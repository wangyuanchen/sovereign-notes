"use server";

import Stripe from "stripe";
import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-02-24.acacia",
});

export async function createCheckoutSession() {
  const { userId } = await auth();
  const user = await currentUser();

  if (!userId || !user) throw new Error("Unauthorized");

  // 这里替换成你在 Stripe Dashboard 创建的产品 Price ID
  const PRICE_ID = "price_H123456789"; 

  const session = await stripe.checkout.sessions.create({
    customer_email: user.emailAddresses[0].emailAddress,
    line_items: [{ price: PRICE_ID, quantity: 1 }],
    mode: "subscription",
    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?success=true`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?canceled=true`,
    metadata: {
      userId: userId, // 极其重要：Webhook 靠这个知道是谁付了钱
    },
  });

  redirect(session.url!);
}