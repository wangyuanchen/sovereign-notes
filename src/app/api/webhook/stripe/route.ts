import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { stripe } from '@/lib/stripe';
import { db } from '@/db';
import { users } from '@/db/schema';
import { eq } from 'drizzle-orm';
import Stripe from 'stripe';

// 配置：使用 Node.js 运行时，禁止动态缓存
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// 注意：Next.js App Router 的 route handlers 默认不解析 body
// 使用 request.text() 获取原始 body 用于 Stripe 签名验证

// 通过 Stripe Customer ID 或 metadata 中的 clerkUserId 找到用户
async function findUserByStripeCustomer(customerId: string) {
  // 方法1：通过 stripeCustomerId 直接查找
  let user = await db.query.users.findFirst({
    where: eq(users.stripeCustomerId, customerId),
  });

  if (user) return user;

  // 方法2：如果数据库没找到，从 Stripe 获取 Customer 的 metadata
  try {
    const customer = await stripe.customers.retrieve(customerId);
    if (customer.deleted) return null;
    
    const clerkUserId = (customer as Stripe.Customer).metadata?.clerkUserId;
    if (clerkUserId) {
      user = await db.query.users.findFirst({
        where: eq(users.id, clerkUserId),
      });

      // 找到用户后，确保关联 stripeCustomerId
      if (user && !user.stripeCustomerId) {
        await db.update(users)
          .set({ stripeCustomerId: customerId })
          .where(eq(users.id, user.id));
        console.log(`🔗 Linked Stripe Customer ${customerId} to user ${user.id}`);
      }
    }
  } catch (err) {
    console.error('Failed to retrieve customer from Stripe:', err);
  }

  return user;
}

async function handleSubscriptionCreated(subscription: Stripe.Subscription) {
  const customerId = subscription.customer as string;
  
  console.log('🔍 Processing subscription.created:', {
    subscriptionId: subscription.id,
    customerId,
    status: subscription.status,
  });
  
  // 通过 customerId 或 metadata 找到用户
  const user = await findUserByStripeCustomer(customerId);

  if (!user) {
    console.error('❌ CRITICAL: User not found for customer:', customerId);
    console.error('   Subscription ID:', subscription.id);
    // TODO: 发送告警通知
    return;
  }

  // 安全地获取 current_period_end
  const subData = subscription as any;
  const periodEnd = subData.current_period_end;
  const currentPeriodEnd = periodEnd ? new Date(periodEnd * 1000) : null;

  console.log('📅 Subscription period end:', { periodEnd, currentPeriodEnd });

  await db.update(users)
    .set({
      plan: 'pro',
      subscriptionStatus: 'active',
      stripeSubscriptionId: subscription.id,
      stripeCustomerId: customerId, // 确保关联
      ...(currentPeriodEnd && { subscriptionEndsAt: currentPeriodEnd }),
    })
    .where(eq(users.id, user.id));

  console.log(`✅ Subscription created for user ${user.id}, subscription: ${subscription.id}, plan updated to PRO`);
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  const customerId = subscription.customer as string;
  
  console.log('🔍 Processing subscription.updated:', {
    subscriptionId: subscription.id,
    customerId,
    status: subscription.status,
    cancelAtPeriodEnd: subscription.cancel_at_period_end,
  });

  const user = await findUserByStripeCustomer(customerId);

  if (!user) {
    console.error('User not found for customer:', customerId);
    return;
  }

  // 安全地获取 current_period_end
  const subData = subscription as any;
  const periodEnd = subData.current_period_end;
  const currentPeriodEnd = periodEnd ? new Date(periodEnd * 1000) : null;

  console.log('📅 Subscription period end:', { periodEnd, currentPeriodEnd });
  
  // 确定订阅状态和计划
  let dbStatus: 'active' | 'inactive' | 'expired' = 'inactive';
  let plan: 'free' | 'pro' = 'free';
  
  if (subscription.status === 'active' || subscription.status === 'trialing') {
    // 订阅有效
    dbStatus = 'active';
    plan = 'pro';
  } else if (subscription.status === 'canceled' || subscription.status === 'past_due' || subscription.status === 'unpaid') {
    // 订阅已取消或过期
    dbStatus = 'expired';
    plan = 'free';
  }

  // 如果设置了周期结束时取消，记录日志但保持 Pro 直到周期结束
  if (subscription.cancel_at_period_end && subscription.status === 'active') {
    console.log('⚠️ Subscription will cancel at period end:', currentPeriodEnd);
    // 仍然保持 Pro 直到周期结束
    dbStatus = 'active';
    plan = 'pro';
  }

  await db.update(users)
    .set({
      plan,
      subscriptionStatus: dbStatus,
      stripeSubscriptionId: subscription.id,
      ...(currentPeriodEnd && { subscriptionEndsAt: currentPeriodEnd }),
    })
    .where(eq(users.id, user.id));

  console.log(`✅ Subscription updated for user ${user.id}, status: ${dbStatus}, plan: ${plan}`);
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  const customerId = subscription.customer as string;
  
  const user = await findUserByStripeCustomer(customerId);

  if (!user) {
    console.error('User not found for customer:', customerId);
    return;
  }

  await db.update(users)
    .set({
      plan: 'free',
      subscriptionStatus: 'inactive',
      stripeSubscriptionId: null,
      subscriptionEndsAt: null,
    })
    .where(eq(users.id, user.id));

  console.log(`✅ Subscription deleted for user ${user.id}`);
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  // Checkout 完成时，确保用户关联并同步邮箱
  const customerId = session.customer as string;
  const customerEmail = session.customer_details?.email;
  const userId = session.metadata?.userId; // 从 checkout session metadata 获取

  if (!customerId) {
    console.error('❌ No customer ID in checkout session:', session.id);
    return;
  }

  // 优先通过 metadata.userId 找用户，再 fallback 到 stripeCustomerId
  let user = userId 
    ? await db.query.users.findFirst({ where: eq(users.id, userId) })
    : await findUserByStripeCustomer(customerId);

  if (!user) {
    console.error('❌ CRITICAL: User not found for checkout session:', session.id);
    console.error('   Customer ID:', customerId);
    console.error('   Metadata userId:', userId);
    // TODO: 发送告警通知
    return;
  }

  // 确保用户与 Stripe Customer 关联
  const updateData: Record<string, any> = {};
  
  if (!user.stripeCustomerId) {
    updateData.stripeCustomerId = customerId;
  }
  
  if (customerEmail && !user.email) {
    updateData.email = customerEmail;
  }

  if (Object.keys(updateData).length > 0) {
    await db.update(users)
      .set(updateData)
      .where(eq(users.id, user.id));
    console.log(`🔗 User ${user.id} updated:`, updateData);
  }

  console.log(`✅ Checkout completed: ${session.id}, user: ${user.id}`);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const headersList = await headers();
    const signature = headersList.get('stripe-signature');

    // 调试日志
    console.log('📥 Webhook received');
    console.log('   Body length:', body.length);
    console.log('   Signature:', signature?.substring(0, 50) + '...');
    console.log('   Secret configured:', !!process.env.STRIPE_WEBHOOK_SECRET);

    if (!signature) {
      console.error('No stripe-signature header');
      return NextResponse.json({ error: 'No signature' }, { status: 400 });
    }

    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    if (!webhookSecret) {
      console.error('STRIPE_WEBHOOK_SECRET not configured');
      return NextResponse.json({ error: 'Webhook not configured' }, { status: 500 });
    }

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err: any) {
      console.error('Webhook signature verification failed:', err.message);
      console.error('   Body preview:', body.substring(0, 100));
      return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
    }

    console.log(`📩 Received Stripe event: ${event.type}`);

    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session);
        break;
      case 'customer.subscription.created':
        await handleSubscriptionCreated(event.data.object as Stripe.Subscription);
        break;
      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(event.data.object as Stripe.Subscription);
        break;
      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object as Stripe.Subscription);
        break;
      case 'invoice.paid':
        console.log('💰 Invoice paid:', (event.data.object as Stripe.Invoice).id);
        break;
      case 'invoice.payment_failed':
        console.log('❌ Invoice payment failed:', (event.data.object as Stripe.Invoice).id);
        break;
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { error: error.message || 'Webhook handler failed' },
      { status: 500 }
    );
  }
}
