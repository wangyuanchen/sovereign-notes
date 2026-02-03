'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { BrowserProvider } from 'ethers';
import { toast } from 'sonner';
import { useTranslation } from '@/lib/i18n';
import EthereumProvider from '@walletconnect/ethereum-provider';

// WalletConnect Project ID
const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || '';

// Helper to detect mobile device
const isMobileDevice = () => {
  if (typeof window === 'undefined') return false;
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  );
};

// Check if injected wallet exists (MetaMask, etc)
const hasInjectedWallet = () => {
  if (typeof window === 'undefined') return false;
  return !!(window as any).ethereum;
};

export function useWeb3Vault() {
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [vaultKey, setVaultKey] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { t } = useTranslation();
  
  const wcProviderRef = useRef<InstanceType<typeof EthereumProvider> | null>(null);

  // 初始化检查
  useEffect(() => {
    setIsMobile(isMobileDevice());
    
    // 检查是否有缓存的 Key (Session级别)
    const cachedKey = sessionStorage.getItem('sovereign_vault_key');
    const cachedAddress = sessionStorage.getItem('sovereign_wallet_address');
    if (cachedKey) {
      setVaultKey(cachedKey);
    }
    if (cachedAddress) {
      setWalletAddress(cachedAddress);
    }
    
    setIsReady(true);
  }, []);

  // 连接钱包
  const connectWallet = useCallback(async () => {
    setError(null);
    setIsConnecting(true);
    
    try {
      // 如果有注入的钱包，直接用
      if (hasInjectedWallet()) {
        const provider = new BrowserProvider((window as any).ethereum);
        const accounts = await provider.send("eth_requestAccounts", []);
        if (accounts.length > 0) {
          setWalletAddress(accounts[0]);
          sessionStorage.setItem('sovereign_wallet_address', accounts[0]);
          return accounts[0];
        }
        return null;
      }
      
      // 使用 WalletConnect
      if (!projectId) {
        toast.error('WalletConnect not configured', { 
          description: 'Please set NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID in environment variables' 
        });
        return null;
      }

      const wcProvider = await EthereumProvider.init({
        projectId,
        chains: [1],
        optionalChains: [137, 42161],
        showQrModal: true,
        metadata: {
          name: 'Sovereign Notes',
          description: 'Your Notes, Encrypted & Secure.',
          url: typeof window !== 'undefined' ? window.location.origin : 'https://note.svgn.org',
          icons: ['https://note.svgn.org/icon.png']
        }
      });
      
      wcProviderRef.current = wcProvider;
      
      // 连接 - 这会显示 QR 码弹窗
      await wcProvider.connect();
      
      const accounts = wcProvider.accounts;
      if (accounts.length > 0) {
        setWalletAddress(accounts[0]);
        sessionStorage.setItem('sovereign_wallet_address', accounts[0]);
        toast.success(t('web3.walletConnected'));
        return accounts[0];
      }
      
      return null;
    } catch (err: any) {
      console.error("Wallet connection error:", err);
      if (err.code === 4001 || err.message?.includes('User rejected')) {
        toast.info(t('web3.connectCancelled'));
        return null;
      }
      const msg = err.message || t('web3.connectionFailed');
      setError(msg);
      toast.error(t('web3.connectionFailed'));
      return null;
    } finally {
      setIsConnecting(false);
    }
  }, [t]);

  // 从签名派生密钥
  const deriveKeyFromSignature = useCallback(async () => {
    setError(null);
    
    try {
      let provider: BrowserProvider | null = null;
      
      // 如果有注入的钱包
      if (hasInjectedWallet()) {
        provider = new BrowserProvider((window as any).ethereum);
      } else if (wcProviderRef.current) {
        provider = new BrowserProvider(wcProviderRef.current as any);
      }
      
      if (!provider) {
        toast.info(t('web3.connectFirst'));
        await connectWallet();
        return null;
      }

      const signer = await provider.getSigner();
      
      // 固定的签名消息
      const message = "Sign this message to unlock your Sovereign Notes Vault.\n\nNonce: sovereign-notes-v1";
      
      const signature = await signer.signMessage(message);
      
      setVaultKey(signature);
      sessionStorage.setItem('sovereign_vault_key', signature);
      toast.success(t('web3.vaultUnlocked'), { description: t('web3.vaultUnlockedDesc') });

      return signature;
    } catch (err: any) {
      console.error(err);
      if (err.code === 4001 || err.message?.includes('User rejected')) {
        toast.info(t('web3.signatureCancelled'));
        return null;
      }
      setError("Signature failed");
      toast.error(t('web3.signatureFailed'), { description: t('web3.signatureFailedDesc') });
      return null;
    }
  }, [connectWallet, t]);

  const clearKey = useCallback(() => {
    setVaultKey(null);
    setWalletAddress(null);
    sessionStorage.removeItem('sovereign_vault_key');
    sessionStorage.removeItem('sovereign_wallet_address');
    
    // 断开 WalletConnect
    if (wcProviderRef.current) {
      wcProviderRef.current.disconnect();
      wcProviderRef.current = null;
    }
    
    toast.info(t('web3.disconnected'), { description: t('web3.sessionEnded') });
  }, [t]);

  return {
    isReady,
    isMobile,
    isConnecting,
    isConnected: !!walletAddress,
    walletAddress,
    vaultKey,
    error,
    connectWallet,
    deriveKeyFromSignature,
    clearKey,
  };
}
