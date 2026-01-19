import type { Metadata } from "next";
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
  return (
    <html lang="zh-CN" className="dark">
      <body className="antialiased bg-zinc-950 text-zinc-50">
        <div className="fixed top-0 left-0 right-0 bg-yellow-500/10 border-b border-yellow-500/20 p-2 text-center text-xs text-yellow-400 z-50">
          ⚠️ 开发模式：认证功能已禁用。配置 Clerk 密钥以启用完整功能。
        </div>
        <div className="pt-10">
          {children}
        </div>
      </body>
    </html>
  );
}
