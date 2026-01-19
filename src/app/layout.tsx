import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";

export const metadata: Metadata = {
  title: "Sovereign Notes | Web3 Privacy First",
  description: "你的笔记，永远属于你 - Web3 隐私优先的个人笔记与待办清单工具",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // 检查是否配置了有效的 Clerk 密钥
  const hasValidClerkKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY && 
    process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY.startsWith('pk_') &&
    !process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY.includes('xxx');

  if (!hasValidClerkKey) {
    // 开发模式：不使用 Clerk
    return (
      <html lang="zh-CN" className="dark">
        <body className="antialiased bg-zinc-950 text-zinc-50">
          <div className="fixed top-0 left-0 right-0 bg-yellow-500/10 border-b border-yellow-500/20 p-2 text-center text-xs text-yellow-400 z-50">
            ⚠️ 开发模式：请配置 Clerk 密钥以启用认证功能。查看 DEVELOPMENT.md 了解详情。
          </div>
          <div className="pt-10">
            {children}
          </div>
        </body>
      </html>
    );
  }

  return (
    <ClerkProvider>
      <html lang="zh-CN" className="dark">
        <body className="antialiased bg-zinc-950 text-zinc-50">
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}

