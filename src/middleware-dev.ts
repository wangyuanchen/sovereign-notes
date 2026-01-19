import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// 开发模式中间件 - 不使用 Clerk 认证
export function middleware(request: NextRequest) {
  console.log('⚠️  开发模式：认证已禁用');
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
};
