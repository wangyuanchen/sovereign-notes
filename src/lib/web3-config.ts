import { createAppKit } from '@reown/appkit/react';
import { mainnet, polygon, arbitrum } from '@reown/appkit/networks';
import { EthersAdapter } from '@reown/appkit-adapter-ethers';

// 1. 获取 WalletConnect 项目 ID
// 你需要在 https://cloud.reown.com/ 注册获取 projectId
const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || 'demo-project-id';

// 2. 配置元数据
const metadata = {
  name: 'Sovereign Notes',
  description: 'Your Notes, Encrypted & Secure.',
  url: typeof window !== 'undefined' ? window.location.origin : 'https://note.svgn.org',
  icons: ['https://note.svgn.org/icon.png']
};

// 3. 创建 Ethers 适配器
const ethersAdapter = new EthersAdapter();

// 4. 创建 AppKit 实例（只在客户端创建）
let appKitInstance: ReturnType<typeof createAppKit> | null = null;

export function getAppKit() {
  if (typeof window === 'undefined') return null;
  
  if (!appKitInstance) {
    appKitInstance = createAppKit({
      adapters: [ethersAdapter],
      networks: [mainnet, polygon, arbitrum],
      projectId,
      metadata,
      features: {
        analytics: false,
        email: false,
        socials: false,
      },
      themeMode: 'dark',
      themeVariables: {
        '--w3m-accent': '#0ea5e9', // sky-500
        '--w3m-border-radius-master': '12px',
      }
    });
  }
  
  return appKitInstance;
}

export { ethersAdapter };
