# Sovereign Notes - 安装指南

## 快速开始

### 1. 安装依赖

```bash
npm install
# 或
yarn install
# 或
pnpm install
```

### 2. 配置环境变量

复制 `.env.example` 到 `.env.local` 并填写你的配置：

```bash
cp .env.example .env.local
```

需要配置的服务：

- **数据库**: PostgreSQL 数据库连接字符串
- **Clerk**: 在 [clerk.com](https://clerk.com) 创建应用获取密钥
- **Stripe** (可选): 在 [stripe.com](https://stripe.com) 获取 API 密钥
- **OpenAI** (可选): 在 [openai.com](https://openai.com) 获取 API 密钥

### 3. 设置数据库

确保你有一个运行中的 PostgreSQL 数据库，然后运行：

```bash
# 生成数据库迁移文件
npm run db:generate

# 推送数据库 schema
npm run db:push
```

### 4. 启动开发服务器

```bash
npm run dev
```

打开 [http://localhost:3000](http://localhost:3000) 查看应用。

## 数据库命令

```bash
# 生成迁移文件
npm run db:generate

# 执行迁移
npm run db:migrate

# 推送 schema 到数据库
npm run db:push

# 打开 Drizzle Studio (数据库 GUI)
npm run db:studio
```

## 生产部署

### Vercel 部署

1. 推送代码到 GitHub
2. 在 Vercel 导入项目
3. 配置环境变量
4. 部署

```bash
# 或使用 Vercel CLI
npm i -g vercel
vercel
```

## 技术栈

- **框架**: Next.js 15 (App Router)
- **认证**: Clerk
- **数据库**: PostgreSQL + Drizzle ORM
- **支付**: Stripe
- **样式**: Tailwind CSS
- **加密**: Web Crypto API

## 注意事项

- 确保 PostgreSQL 数据库正在运行
- Clerk 需要配置回调 URL: `http://localhost:3000`
- 生产环境需要配置正确的域名和 HTTPS
