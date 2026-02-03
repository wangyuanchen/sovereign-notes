'use client';

import { useState, useEffect, useCallback } from 'react';
import { BrowserProvider } from 'ethers';
import { toast } from 'sonner';
import { useTranslation } from '@/lib/i18n';
import { useAppKit, useAppKitAccount, useAppKitProvider } from '@reown/appkit/react';
import type { Provider } from '@reown/appkit-adapter-ethers';

// Helper to detect mobile device
const isMobileDevice = () => {
  if (typeof window === 'undefined') return false;
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  );
};

// Helper to check if we're inside MetaMask's in-app browser
const isMetaMaskBrowser = () => {
  if (typeof window === 'undefined') return false;
  return (window as any).ethereum?.isMetaMask && isMobileDevice();
};

export function useWeb3Vault() {
  const [vaultKey, setVaultKey] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { t } = useTranslation();

  // AppKit hooks
  const { open } = useAppKit();
  const { address, isConnected } = useAppKitAccount();
  const { walletProvider } = useAppKitProvider<Provider>('eip155');

  // 初始化检查
  useEffect(() => {
    setIsMobile(isMobileDevice());
    
    // 检查是否有缓存的 Key (Session级别)
    const cachedKey = sessionStorage.getItem('sovereign_vault_key');
    if (cachedKey) {
      setVaultKey(cachedKey);
    }
    
    setIsReady(true);
  }, []);

  // 连接钱包 - 使用 WalletConnect Modal
  const connectWallet = useCallback(async () => {
    setError(null);
    
    try {
      // 打开 WalletConnect Modal
      await open();
      return address || null;
    } catch (err: any) {
      console.error("Wallet connection error:", err);
      if (err.code === 4001) {
        toast.info(t('web3.connectCancelled'));
        return null;
      }
      const msg = err.message || t('web3.connectionFailed');
      setError(msg);
      toast.error(t('web3.connectionFailed'), { description: "Unable to connect wallet, please retry." });
      return null;
    }
  }, [open, address, t]);

  // 从签名派生密钥
  const deriveKeyFromSignature = useCallback(async () => {
    setError(null);
    
    // 如果未连接，先打开连接弹窗
    if (!isConnected || !walletProvider) {
      toast.info(t('web3.connectFirst'));
      await open();
      return null;
    }

    try {
      const provider = new BrowserProvider(walletProvider);
      const signer = await provider.getSigner();
      
      // 这是一个固定的签名消息，用于生成确定性的密钥
      // 注意：为了安全性，不要改变这个消息的内容，否则旧笔记将无法解密
      const message = "Sign this message to unlock your Sovereign Notes Vault.\n\nNonce: sovereign-notes-v1";
      
      const signature = await signer.signMessage(message);
      
      // 使用签名作为派生密钥的源
      setVaultKey(signature);
      sessionStorage.setItem('sovereign_vault_key', signature);
      toast.success(t('web3.vaultUnlocked'), { description: t('web3.vaultUnlockedDesc') });

      return signature;
    } catch (err: any) {
      console.error(err);
      setError("User denied signature or failed to sign.");
      toast.error(t('web3.signatureFailed'), { description: t('web3.signatureFailedDesc') });
      return null;
    }
  }, [isConnected, walletProvider, open, t]);

  const clearKey = useCallback(() => {
    setVaultKey(null);
    sessionStorage.removeItem('sovereign_vault_key');
    toast.info(t('web3.disconnected'), { description: t('web3.sessionEnded') });
  }, [t]);

  return {
    isReady,
    isMobile,
    isConnected,
    walletAddress: address || null,
    vaultKey,
    error,
    connectWallet,
    deriveKeyFromSignature,
    clearKey,
    openWalletModal: () => open(),
  };
}
