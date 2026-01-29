import { NextRequest, NextResponse } from 'next/server';
import { auth, currentUser } from '@clerk/nextjs/server';
import { stripe, SUBSCRIPTION_PRICES } from '@/lib/stripe';
import { db } from '@/db';
import { users } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 获取 Clerk 用户信息（可能没有邮箱，如 Web3 钱包登录）
    const clerkUser = await currentUser();
    const userEmail = clerkUser?.emailAddresses?.[0]?.emailAddress || null;

    const body = await request.json();
    const { plan = 'monthly' } = body;
    
    const priceConfig = SUBSCRIPTION_PRICES[plan as keyof typeof SUBSCRIPTION_PRICES];
    if (!priceConfig) {
      return NextResponse.json({ error: 'Invalid plan' }, { status: 400 });
    }

    // 获取或创建用户记录
    let user = await db.query.users.findFirst({
      where: eq(users.id, userId),
    });

    let customerId = user?.stripeCustomerId;

    // 如果用户没有 Stripe Customer ID，创建一个
    if (!customerId) {
      const customer = await stripe.customers.create({
        ...(userEmail && { email: userEmail }),
        ...(clerkUser?.fullName && { name: clerkUser.fullName }),
        metadata: {
          clerkUserId: userId,
        },
      });
      customerId = customer.id;

      // 保存 customer ID 到数据库
      if (user) {
        await db.update(users)
          .set({ 
            stripeCustomerId: customerId, 
            ...(userEmail && { email: userEmail })
          })
          .where(eq(users.id, userId));
      } else {
        await db.insert(users).values({
          id: userId,
          ...(userEmail && { email: userEmail }),
          stripeCustomerId: customerId,
          plan: 'free',
          subscriptionStatus: 'inactive',
        });
      }
    } else if (userEmail) {
      // 如果已有 Customer 且有邮箱，确保邮箱是最新的
      await stripe.customers.update(customerId, {
        email: userEmail,
      });
    }

    // 创建 Checkout Session
    // 如果用户没有邮箱（如 Web3 钱包登录），Stripe Checkout 会让用户输入
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      customer_update: {
        // 允许用户在 Checkout 页面更新邮箱
        name: 'auto',
        address: 'auto',
      },
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceConfig.priceId,
          quantity: 1,
        },
      ],
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?canceled=true`,
      metadata: {
        userId,
        plan,
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (error: any) {
    console.error('Stripe checkout error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}
