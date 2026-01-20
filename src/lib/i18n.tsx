'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { en } from '@/locales/en';
import { zh } from '@/locales/zh';

type Locale = 'en' | 'zh';
type Decorations = Record<string, any>;

// Flattened keys type would be better but keeping it simple
const resources = {
  en,
  zh
};

const I18nContext = createContext<{
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string, params?: Record<string, string>) => string;
}>({
  locale: 'en',
  setLocale: () => {},
  t: (key) => key,
});

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocale] = useState<Locale>('en');

  useEffect(() => {
    // Detect browser language
    if (typeof navigator !== 'undefined') {
      const browserLang = navigator.language;
      const isZh = browserLang.toLowerCase().startsWith('zh');
      // Only switch to zh if detected, otherwise default to en
      // This respects "Default is English" while assuming "browser environment" means auto-detect
      if (isZh) {
        setLocale('zh');
      } else {
        setLocale('en');
      }
    }
  }, []);

  const t = (path: string, params?: Record<string, string>) => {
    const keys = path.split('.');
    let value: any = resources[locale];

    for (const key of keys) {
      if (value && typeof value === 'object' && key in value) {
        value = value[key];
      } else {
        // Fallback to English if missing in current locale
        let fallback: any = resources['en'];
        for (const k of keys) {
           if (fallback && typeof fallback === 'object' && k in fallback) fallback = fallback[k];
           else return path; // Return key if not found
        }
        value = fallback;
      }
    }

    if (typeof value !== 'string') return path;

    if (params) {
      Object.entries(params).forEach(([key, val]) => {
        value = value.replace(new RegExp(`{${key}}`, 'g'), val);
      });
    }

    return value;
  };

  return (
    <I18nContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useTranslation() {
  return useContext(I18nContext);
}
