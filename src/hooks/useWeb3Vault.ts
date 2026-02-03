'use client';

import { useState, useEffect } from 'react';
import { BrowserProvider } from 'ethers';
import { toast } from 'sonner';
import { useTranslation } from '@/lib/i18n';

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

// Helper to check if we're on mobile but NOT in MetaMask browser (i.e., regular mobile browser)
const isMobileSystemBrowser = () => {
  if (typeof window === 'undefined') return false;
  return isMobileDevice() && !(window as any).ethereum;
};

// Generate MetaMask deep link to open current page in MetaMask browser
const getMetaMaskDeepLink = () => {
  if (typeof window === 'undefined') return '';
  const currentUrl = window.location.href;
  // MetaMask deep link format: https://metamask.app.link/dapp/{url without protocol}
  const urlWithoutProtocol = currentUrl.replace(/^https?:\/\//, '');
  return `https://metamask.app.link/dapp/${urlWithoutProtocol}`;
};

export function useWeb3Vault() {
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [vaultKey, setVaultKey] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { t } = useTranslation();

  // Helper to safely get provider
  const getProvider = () => {
    if (typeof window !== 'undefined' && (window as any).ethereum) {
      return new BrowserProvider((window as any).ethereum);
    }
    return null;
  };

  // 初始化检查
  useEffect(() => {
    // 检测移动设备
    setIsMobile(isMobileDevice());
    
    // 检查是否有缓存的 Key (Session级别)
    const cachedKey = sessionStorage.getItem('sovereign_vault_key');
    if (cachedKey) {
      setVaultKey(cachedKey);
    }
    
    // 检查是否有 ethereum 对象
    if (typeof window !== 'undefined' && (window as any).ethereum) {
      setIsReady(true);
    }
  }, []);

  const connectWallet = async () => {
    setError(null);
    if (typeof window === 'undefined' || !(window as any).ethereum) {
      // Check if on mobile system browser - directly redirect to MetaMask
      if (isMobileSystemBrowser()) {
        toast.info(t('web3.redirectingToMetaMask'), {
          description: t('web3.openInMetaMask'),
          duration: 3000,
        });
        // Small delay to let user see the toast, then redirect
        setTimeout(() => {
          const deepLink = getMetaMaskDeepLink();
          window.location.href = deepLink;
        }, 1000);
        return null;
      } else if (!isMobileDevice()) {
        // Desktop without MetaMask
        toast.warning(t('web3.noWallet'), {
          description: t('web3.installMetaMask'),
          action: {
            label: t('web3.download'),
            onClick: () => window.open('https://metamask.io/download/', '_blank')
          },
          duration: 8000,
        });
      }
      return null;
    }

    try {
      const provider = getProvider();
      if (!provider) throw new Error("Could not initialize provider");

      const accounts = await provider.send("eth_requestAccounts", []);
      if (accounts.length > 0) {
        setWalletAddress(accounts[0]);
        return accounts[0];
      }
    } catch (err: any) {
      console.error("Wallet connection error:", err);
      // specific handling for user rejection
      if (err.code === 4001) {
         toast.info(t('web3.connectCancelled'));
         return null;
      }
      const msg = err.message || t('web3.connectionFailed');
      setError(msg);
      toast.error(t('web3.connectionFailed'), { description: "Unable to connect wallet, please retry." });
    }
    return null;
  };

  const deriveKeyFromSignature = async () => {
    setError(null);
    if (typeof window === 'undefined' || !(window as any).ethereum) {
      // Check if on mobile system browser - directly redirect to MetaMask
      if (isMobileSystemBrowser()) {
        toast.info(t('web3.redirectingToMetaMask'), {
          description: t('web3.openInMetaMask'),
          duration: 3000,
        });
        setTimeout(() => {
          const deepLink = getMetaMaskDeepLink();
          window.location.href = deepLink;
        }, 1000);
        return null;
      } else if (!isMobileDevice()) {
        toast.warning(t('web3.noWallet'), {
          description: t('web3.installMetaMask'),
          action: {
            label: t('web3.download'),
            onClick: () => window.open('https://metamask.io/download/', '_blank')
          }
        });
      }
      return null;
    }

    try {
      const provider = getProvider();
      if (!provider) throw new Error("Could not initialize provider");

      const signer = await provider.getSigner();
      
      // 这是一个固定的签名消息，用于生成确定性的密钥
      // 注意：为了安全性，不要改变这个消息的内容，否则旧笔记将无法解密
      const message = "Sign this message to unlock your Sovereign Notes Vault.\n\nNonce: sovereign-notes-v1";
      
      const signature = await signer.signMessage(message);
      
      // 使用签名作为派生密钥的源
      // 签名对同一个钱包和同一个消息是固定的，长且随机，非常适合做主密钥
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
  };

  const clearKey = () => {
    setVaultKey(null);
    sessionStorage.removeItem('sovereign_vault_key');
    toast.info(t('web3.disconnected'), { description: t('web3.sessionEnded') });
  };

  return {
    isReady,
    isMobile,
    walletAddress,
    vaultKey,
    error,
    connectWallet,
    deriveKeyFromSignature,
    clearKey,
    openInMetaMask: () => {
      const deepLink = getMetaMaskDeepLink();
      window.location.href = deepLink;
    }
  };
}
