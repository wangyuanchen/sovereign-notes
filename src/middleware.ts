import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

// 检查是否配置了有效的 Clerk 密钥
const hasValidClerkKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY && 
  process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY.startsWith('pk_') &&
  !process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY.includes('xxx');

const isProtectedRoute = createRouteMatcher([
  '/notes(.*)',
  '/todos(.*)',
  '/dashboard(.*)',
  '/api(.*)',
]);

export default clerkMiddleware(async (auth, req) => {
  // 仅在配置了有效 Clerk 密钥时启用认证
  if (hasValidClerkKey && isProtectedRoute(req)) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
};
