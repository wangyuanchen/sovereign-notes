'use client';

import { useEffect, useState } from 'react';
import { getAppKit } from '@/lib/web3-config';

export function Web3Provider({ children }: { children: React.ReactNode }) {
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    // 初始化 AppKit
    getAppKit();
    setInitialized(true);
  }, []);

  return <>{children}</>;
}
