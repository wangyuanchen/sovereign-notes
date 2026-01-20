'use client';

import { useState, useEffect } from 'react';
import { BrowserProvider } from 'ethers';
import { toast } from 'sonner';
import { useTranslation } from '@/lib/i18n';

export function useWeb3Vault() {
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [vaultKey, setVaultKey] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);
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
      toast.warning(t('web3.noWallet'), {
        description: t('web3.installMetaMask'),
        action: {
          label: t('web3.download'),
          onClick: () => window.open('https://metamask.io/download/', '_blank')
        },
        duration: 8000,
      });
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
      toast.warning(t('web3.noWallet'), {
        description: t('web3.installMetaMask'),
        action: {
          label: t('web3.download'),
          onClick: () => window.open('https://metamask.io/download/', '_blank')
        }
      });
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
    walletAddress,
    vaultKey,
    error,
    connectWallet,
    deriveKeyFromSignature,
    clearKey
  };
}
