import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// 检查是否配置了有效的 Clerk 密钥
const hasValidClerkKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY && 
  process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY.startsWith('pk_') &&
  !process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY.includes('xxx');

const isProtectedRoute = createRouteMatcher([
  '/notes(.*)',
  '/todos(.*)',
  '/dashboard(.*)',
]);

const isPublicRoute = createRouteMatcher([
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/api/webhook(.*)',
  '/api/keep-alive'
]);

// Stripe webhook 需要完全跳过 middleware，保持原始 body
const isWebhookRoute = (pathname: string) => pathname.startsWith('/api/webhook');

export default async function middleware(req: NextRequest) {
  // 完全跳过 webhook 路由，不经过任何 middleware 处理
  if (isWebhookRoute(req.nextUrl.pathname)) {
    return NextResponse.next();
  }

  // 其他路由走 Clerk middleware
  return clerkMiddleware(async (auth, req) => {
    if (isPublicRoute(req)) {
      return;
    }

    // 仅在配置了有效 Clerk 密钥时启用认证
    if (hasValidClerkKey && (isProtectedRoute(req) || req.nextUrl.pathname.startsWith('/api'))) {
      await auth.protect();
    }
  })(req);
}

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
};
