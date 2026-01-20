import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { Toaster } from 'sonner';
import { I18nProvider } from '@/lib/i18n';
import DevBanner from '@/components/DevBanner';
import "./globals.css";

export const metadata: Metadata = {
  title: "Sovereign Notes | Web3 Privacy First",
  description: "Your notes, always yours. A Web3 privacy-first note-taking tool.",
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
      <html lang="en" className="dark">
        <body className="antialiased bg-zinc-950 text-zinc-50">
          <I18nProvider>
            <Toaster richColors theme="dark" position="top-center" />
            <DevBanner />
            <div className="pt-10">
              {children}
            </div>
          </I18nProvider>
        </body>
      </html>
    );
  }

  return (
    <ClerkProvider>
      <html lang="en" className="dark">
        <body className="antialiased bg-zinc-950 text-zinc-50">
          <I18nProvider>
            <Toaster richColors theme="dark" position="top-center" />
            {children}
          </I18nProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
