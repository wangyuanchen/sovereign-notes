import { headers } from "next/headers";
import { NextResponse } from "next/server";
import Stripe from "stripe";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: "2023-10-16" });

export async function POST(req: Request) {
  const body = await req.text();
  const signature = headers().get("Stripe-Signature") as string;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (error: any) {
    return new NextResponse(`Webhook Error: ${error.message}`, { status: 400 });
  }

  const session = event.data.object as Stripe.Checkout.Session;

  // 场景：支付成功
  if (event.type === "checkout.session.completed") {
    const userId = session.metadata?.userId;
    if (!userId) return new NextResponse("No userId in metadata", { status: 400 });

    // 更新数据库：将用户变为 Pro
    await db.update(users)
      .set({ 
        plan: "pro",
        stripeCustomerId: session.customer as string,
        stripeSubscriptionId: session.subscription as string,
      })
      .where(eq(users.id, userId));
  }

  // 场景：取消订阅
  if (event.type === "customer.subscription.deleted") {
    const subscription = event.data.object as Stripe.Subscription;
    await db.update(users)
      .set({ plan: "free" })
      .where(eq(users.stripeSubscriptionId, subscription.id));
  }

  return new NextResponse(null, { status: 200 });
}