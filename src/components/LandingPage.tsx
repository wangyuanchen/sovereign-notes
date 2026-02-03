'use client';

import React, { useState, useEffect } from 'react';
import { Shield, Plus, CheckCircle2, Circle, Calendar, ExternalLink, Copy, Check } from 'lucide-react';
import { UserButton, SignedIn, SignedOut, SignInButton } from "@clerk/nextjs";
import Link from 'next/link';
import { useTranslation } from '@/lib/i18n';

// 检测是否在 MetaMask 内置浏览器中
const isMetaMaskBrowser = () => {
  if (typeof window === 'undefined') return false;
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  return (window as any).ethereum?.isMetaMask && isMobile;
};

export default function LandingPage() {
  const { t } = useTranslation();
  const [inMetaMaskBrowser, setInMetaMaskBrowser] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setInMetaMaskBrowser(isMetaMaskBrowser());
  }, []);

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-100 p-6">
      <div className="max-w-6xl mx-auto mb-8 flex justify-between items-center">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Shield className="text-sky-500" /> {t('home.title')}
        </h1>
        <div className="flex gap-4">
          <SignedOut>
             <SignInButton mode="modal">
                <button className="bg-white text-black px-4 py-2 rounded-lg font-medium hover:bg-zinc-200 transition">
                  {t('home.signIn')}
                </button>
             </SignInButton>
          </SignedOut>
           <SignedIn>
             <Link href="/dashboard">
               <button className="bg-zinc-800 text-white px-4 py-2 rounded-lg font-medium hover:bg-zinc-700 transition mr-2">
                 {t('home.goToDashboard')}
               </button>
             </Link>
             <UserButton afterSignOutUrl="/"/>
           </SignedIn>
        </div>
      </div>

      <SignedOut>
        {/* MetaMask Browser Warning */}
        {inMetaMaskBrowser && (
          <div className="max-w-4xl mx-auto mb-8 bg-amber-500/10 border border-amber-500/30 rounded-2xl p-6">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-amber-500/20 text-amber-400 rounded-lg flex items-center justify-center flex-shrink-0">
                <ExternalLink className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-amber-400 mb-2">请在系统浏览器中打开</h3>
                <p className="text-zinc-400 text-sm mb-4">
                  Google 登录不支持在 MetaMask 内置浏览器中使用。请复制链接并在 Chrome 或 Safari 中打开来完成登录。
                </p>
                <button
                  onClick={handleCopyLink}
                  className="inline-flex items-center gap-2 bg-amber-500/20 hover:bg-amber-500/30 text-amber-400 px-4 py-2 rounded-lg font-medium transition"
                >
                  {copied ? (
                    <>
                      <Check className="w-4 h-4" />
                      已复制!
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      复制链接
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="max-w-4xl mx-auto text-center py-20">
          <h2 className="text-5xl font-bold mb-6">{t('home.subtitle')}</h2>
          <p className="text-xl text-zinc-400 mb-10">
            {t('home.description')}
          </p>

          <div className="flex justify-center gap-6 mb-20">
             <SignInButton mode="modal">
               <button className="bg-white text-black text-lg px-8 py-3 rounded-full font-bold hover:scale-105 transition duration-300 shadow-[0_0_20px_rgba(255,255,255,0.3)]">
                 {t('home.startWriting')}
               </button>
             </SignInButton>
          </div>

          <div className="grid md:grid-cols-3 gap-8 text-left">
             <div className="bg-zinc-900/50 p-6 rounded-2xl border border-zinc-800">
                <div className="w-10 h-10 bg-sky-500/20 text-sky-400 rounded-lg flex items-center justify-center mb-4">
                  <Shield className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-lg mb-2">{t('home.feature1Title')}</h3>
                <p className="text-zinc-400 text-sm">{t('home.feature1Desc')}</p>
             </div>
             <div className="bg-zinc-900/50 p-6 rounded-2xl border border-zinc-800">
                <div className="w-10 h-10 bg-purple-500/20 text-purple-400 rounded-lg flex items-center justify-center mb-4">
                   <Circle className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-lg mb-2">{t('home.feature2Title')}</h3>
                <p className="text-zinc-400 text-sm">{t('home.feature2Desc')}</p>
             </div>
             <div className="bg-zinc-900/50 p-6 rounded-2xl border border-zinc-800">
                <div className="w-10 h-10 bg-emerald-500/20 text-emerald-400 rounded-lg flex items-center justify-center mb-4">
                   <CheckCircle2 className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-lg mb-2">{t('home.feature3Title')}</h3>
                <p className="text-zinc-400 text-sm">{t('home.feature3Desc')}</p>
             </div>
          </div>
        </div>
      </SignedOut>

      <SignedIn>
         {/* If we wanted to show something on landing page for signed in users besides the redirect button */}
         <div className="max-w-4xl mx-auto text-center py-20">
            <h2 className="text-3xl font-bold mb-6">Welcome Back</h2>
            <Link href="/dashboard">
                <button className="bg-sky-600 text-white px-8 py-3 rounded-lg font-bold hover:bg-sky-500 transition">
                  {t('home.goToDashboard')}
                </button>
            </Link>
         </div>
      </SignedIn>

      <footer className="text-center text-zinc-600 py-10 text-sm border-t border-zinc-900 mt-20">
        <p>{t('home.copyright')}</p>
        <div className="flex justify-center gap-4 mt-2">
           <a href="#" className="hover:text-zinc-400">{t('home.openSource')}</a>
        </div>
      </footer>
    </div>
  );
}
