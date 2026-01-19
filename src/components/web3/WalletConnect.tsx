'use client';

import { useState } from 'react';

export default function WalletConnect() {
  const [address, setAddress] = useState<string | null>(null);

  const connectWallet = async () => {
    if (typeof window.ethereum !== 'undefined') {
      try {
        const accounts = await window.ethereum.request({ 
          method: 'eth_requestAccounts' 
        });
        setAddress(accounts[0]);
      } catch (error) {
        console.error('连接钱包失败:', error);
      }
    }
  };

  return (
    <div>
      {address ? (
        <div className="text-sm">
          已连接: {address.slice(0, 6)}...{address.slice(-4)}
        </div>
      ) : (
        <button
          onClick={connectWallet}
          className="px-4 py-2 bg-purple-500 text-white rounded-lg"
        >
          连接钱包
        </button>
      )}
    </div>
  );
}
