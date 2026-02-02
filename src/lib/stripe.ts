import Stripe from 'stripe';

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('Missing STRIPE_SECRET_KEY environment variable');
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2025-01-27.acacia',
  typescript: true,
});

// 验证价格 ID 配置
if (!process.env.STRIPE_MONTHLY_PRICE_ID || !process.env.STRIPE_YEARLY_PRICE_ID) {
  console.warn('⚠️ Missing STRIPE_MONTHLY_PRICE_ID or STRIPE_YEARLY_PRICE_ID. Subscription features may not work.');
}

// 订阅价格配置 (从环境变量读取)
export const SUBSCRIPTION_PRICES = {
  monthly: {
    priceId: process.env.STRIPE_MONTHLY_PRICE_ID || '',
    amount: 100, // $1.00
    currency: 'usd',
    interval: 'month' as const,
  },
  yearly: {
    priceId: process.env.STRIPE_YEARLY_PRICE_ID || '',
    amount: 900, // $9.00 (3个月免费)
    currency: 'usd',
    interval: 'year' as const,
  },
} as const;

// 产品配置 (可选：也可以从环境变量读取)
export const PRODUCT_CONFIG = {
  productId: process.env.STRIPE_PRODUCT_ID || '',
  name: 'Sovereign Notes Pro',
  description: 'End-to-end encrypted notes with cross-device sync, 2GB storage, and daily backups.',
};
