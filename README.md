# 📝 Sovereign Notes

> **🌐 Live: [https://note.svgn.org](https://note.svgn.org)**

A privacy-first personal notes and todo app with Web3 wallet support.

**Your notes, always yours — end-to-end encrypted, cross-device sync, wallet login supported, no ads, no tracking.**

---

## Sovereign Notes Pro (Production)

- **Product Name:** Sovereign Notes Pro
- **Price:** $1/month (recurring subscription)
- **Description:** Unlock encrypted cross-device sync, 2GB storage (Arweave + Lit Protocol), daily encrypted backup, wallet login, and more. All encryption happens in your browser. Keys never leave your device.
- **Payment Methods:** Stripe (credit card), Coinbase (USDC, ETH)
- **Target Users:** Privacy-conscious individuals, Web3 enthusiasts, remote workers

> Stripe product/price IDs must be created in the Stripe Dashboard and set in your production environment variables (e.g., `STRIPE_PRO_PRICE_ID`).

[English](#english) | [中文](#中文)

---

## English

### Product Vision

- **Target Users**: Privacy-conscious individuals, Web3 enthusiasts, remote workers
- **Core Values**:
  - ✅ True end-to-end encryption (E2EE) — server cannot read your content
  - ✅ Traditional login (Email/Passkey) + Web3 wallet login
  - ✅ Free basic tier + transparent premium subscription ($1/month)
  - ✅ Dual payment: Stripe (credit card) & Crypto (USDC/ETH)
- **Non-Goals**: Team collaboration, rich media editing, AI generation (MVP phase)

### Features

| Feature | Free | Pro ($1/month) |
|---------|------|----------------|
| Local encrypted notes & todos | ✅ | ✅ |
| Markdown editing + code highlighting | ✅ | ✅ |
| Cross-device sync | ❌ | ✅ (encrypted on decentralized network) |
| Storage | Local only (IndexedDB) | 2 GB (Arweave + Lit Protocol) |
| Auto backup snapshots | ❌ | ✅ (daily encrypted snapshots) |
| Login methods | Email / Passkey | + Wallet login (MetaMask, etc.) |
| Payment methods | — | Stripe / Coinbase (USDC, ETH) |

> 💡 All encryption happens in your browser. Keys never leave your device.

### Tech Stack

| Category | Technology |
|----------|------------|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript |
| Auth | Clerk + Web3Auth |
| Database | Neon Postgres + Drizzle ORM |
| UI | Tailwind CSS + Lucide Icons |
| Editor | Tiptap + Markdown |
| Web3 | ethers.js |
| Payments | Stripe + Coinbase Commerce |

### Security Model

```
User Browser                    Server                 Storage
    │                              │                      │
    ├─ Input plaintext             │                      │
    ├─ Derive AES key (PBKDF2)     │                      │
    ├─ Encrypt (AES-GCM)           │                      │
    ├─ Upload ciphertext ─────────►│─────────────────────►│
    │                              │                      │
    │    Server NEVER sees plaintext or keys              │
```

**Security Guarantees:**
- All encryption uses **Web Crypto API** (browser-native, tamper-proof)
- Keys are **never uploaded or stored** on any server
- Export your complete encrypted data package
- No IP logging, no behavior tracking, no third-party analytics

### Web3 Integration

| Feature | Implementation |
|---------|---------------|
| Wallet Login | Web3Auth → Signature verification → Clerk user mapping |
| ENS Display | Shows `alice.eth` instead of `0x...` |
| Decentralized Storage | Encrypted data on Arweave, access controlled by Lit Protocol |

> ⚠️ Web3 is an **optional enhancement**. Regular users can ignore it completely.

### Quick Start

```bash
# Clone the repository
git clone https://github.com/wangyuanchen/sovereign-notes.git
cd sovereign-notes

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your keys

# Push database schema
npm run db:push

# Start development server
npm run dev
```

### License

This project is licensed under **AGPL-3.0** — if you use this code to run a commercial service, you must open-source your modifications.

---

## 中文

### 产品定位

> **"你的笔记，永远属于你——端到端加密、跨设备同步、支持钱包登录，无广告、无追踪。"**

- **目标用户**：注重隐私的个人用户、Web3 爱好者、远程工作者
- **核心价值**：
  - ✅ 真正端到端加密（E2EE），服务端无法读取内容
  - ✅ 支持传统登录（邮箱/Passkey） + Web3 钱包登录
  - ✅ 免费基础版 + 透明高级订阅（$1/月）
  - ✅ 支持法币（Stripe）与加密货币（USDC/ETH）双轨支付
- **非目标**：团队协作、富媒体编辑、AI 生成（MVP 阶段）

### 核心功能

| 功能 | 免费版 | 高级版（$1/月） |
|------|--------|----------------|
| 本地加密笔记 & 待办 | ✅ | ✅ |
| Markdown 编辑 + 代码高亮 | ✅ | ✅ |
| 跨设备同步 | ❌ | ✅（加密后存去中心化网络） |
| 存储空间 | 仅本地（IndexedDB） | 2 GB（Arweave + Lit Protocol） |
| 自动备份快照 | ❌ | ✅（每日加密快照） |
| 登录方式 | 邮箱 / Passkey | + 钱包登录（MetaMask 等） |
| 支付方式 | — | Stripe（信用卡） / Coinbase（USDC, ETH） |

> 💡 所有加密操作在浏览器完成，密钥永不离开设备。

### 技术栈

| 类别 | 技术 |
|------|------|
| 框架 | Next.js 16 (App Router) |
| 语言 | TypeScript |
| 认证 | Clerk + Web3Auth |
| 数据库 | Neon Postgres + Drizzle ORM |
| UI | Tailwind CSS + Lucide Icons |
| 编辑器 | Tiptap + Markdown |
| Web3 | ethers.js |
| 支付 | Stripe + Coinbase Commerce |

### 安全模型

```
用户浏览器                       服务端                  存储
    │                              │                      │
    ├─ 输入明文                     │                      │
    ├─ 派生 AES 密钥 (PBKDF2)       │                      │
    ├─ 加密 (AES-GCM)              │                      │
    ├─ 上传密文 ──────────────────►│─────────────────────►│
    │                              │                      │
    │       服务端永远无法看到明文或密钥                      │
```

**安全承诺：**
- 所有加密使用 **Web Crypto API**（浏览器原生，不可篡改）
- 密钥**不上传、不存储**于任何服务器
- 支持用户**导出完整加密数据包**
- 无 IP 日志、无行为追踪、无第三方分析

### Web3 融合

| 功能 | 实现方式 |
|------|----------|
| 钱包登录 | Web3Auth → 签名验证 → Clerk 用户映射 |
| ENS 显示 | 将 `0x...` 显示为 `alice.eth` |
| 去中心化存储 | 加密数据存 Arweave，访问权限由 Lit Protocol 控制 |

> ⚠️ Web3 是**增强选项**，非强制。普通用户可完全忽略。

### 快速开始

```bash
# 克隆仓库
git clone https://github.com/wangyuanchen/sovereign-notes.git
cd sovereign-notes

# 安装依赖
npm install

# 设置环境变量
cp .env.example .env.local
# 编辑 .env.local 填入你的密钥

# 推送数据库 schema
npm run db:push

# 启动开发服务器
npm run dev
```

### 开源协议

本项目使用 **AGPL-3.0** 协议 — 如果你使用本代码运行商业服务，必须开源你的修改。

---

## Contributing

Contributions are welcome! Please read our contributing guidelines before submitting a PR.

## Support

- 🐛 Issues: [GitHub Issues](https://github.com/wangyuanchen/sovereign-notes/issues)

---

**Sovereign Notes is not just another note-taking tool — it's a gateway to data sovereignty.**

We don't do AI, we don't do social, we don't do ads — we do one thing: **Make your data truly yours.**
