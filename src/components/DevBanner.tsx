'use client';

import { useTranslation } from "@/lib/i18n";

export default function DevBanner() {
  const { t } = useTranslation();

  return (
    <div className="fixed top-0 left-0 right-0 bg-yellow-500/10 border-b border-yellow-500/20 p-2 text-center text-xs text-yellow-400 z-50">
       {t('layout.devMode')}
    </div>
  );
}
