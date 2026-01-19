# 开发环境配置

## 快速开始（无需外部服务）

如果你想快速查看项目结构而不配置外部服务，可以：

### 1. 临时禁用 Clerk 认证

在 `src/middleware.ts` 中注释掉认证保护：

```typescript
export default clerkMiddleware(async (auth, req) => {
  // 临时禁用认证
  // if (isProtectedRoute(req)) {
  //   await auth.protect();
  // }
});
```

### 2. 修改页面组件

在需要 userId 的页面中使用测试 ID：

```typescript
// 临时使用测试用户 ID
const userId = 'test-user-123';
// const { userId } = await auth(); // 注释掉真实认证
```

### 3. 使用 SQLite 替代 PostgreSQL

修改 `src/db/index.ts` 使用本地 SQLite：

```typescript
import { drizzle } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';

const sqlite = new Database('sqlite.db');
export const db = drizzle(sqlite);
```

然后安装依赖：
```bash
npm install better-sqlite3 @types/better-sqlite3
```

## 完整配置（推荐）

### 1. 配置 Clerk

1. 访问 [clerk.com](https://clerk.com) 注册账号
2. 创建新应用
3. 复制 API 密钥到 `.env.local`：
   - `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
   - `CLERK_SECRET_KEY`
4. 在 Clerk Dashboard 配置回调 URL：
   - Sign-in URL: `http://localhost:3000/sign-in`
   - Sign-up URL: `http://localhost:3000/sign-up`
   - After sign-in: `http://localhost:3000`

### 2. 配置 PostgreSQL

#### 选项 A: 本地 PostgreSQL

```bash
# macOS
brew install postgresql
brew services start postgresql

# 创建数据库
createdb sovereign_notes

# 更新 .env.local
DATABASE_URL=postgresql://localhost:5432/sovereign_notes
```

#### 选项 B: 使用 Neon (免费云数据库)

1. 访问 [neon.tech](https://neon.tech)
2. 创建免费项目
3. 复制连接字符串到 `.env.local`

#### 选项 C: 使用 Supabase (免费云数据库)

1. 访问 [supabase.com](https://supabase.com)
2. 创建新项目
3. 获取 PostgreSQL 连接字符串
4. 更新 `.env.local`

### 3. 初始化数据库

```bash
# 生成迁移文件
npm run db:generate

# 推送 schema 到数据库
npm run db:push
```

### 4. 配置 Stripe（可选）

仅在需要支付功能时配置：

1. 访问 [stripe.com](https://stripe.com)
2. 获取测试模式的 API 密钥
3. 更新 `.env.local`

## 常见问题

### Clerk 错误: "Publishable key not valid"

确保你的 `.env.local` 中有有效的 Clerk 密钥，或临时禁用认证。

### 数据库连接错误

确保 PostgreSQL 正在运行，或使用云数据库服务。

### 端口被占用

```bash
# 使用其他端口
npm run dev -- -p 3001
```

## 推荐的开发流程

1. 先配置 Clerk（5分钟）
2. 使用云数据库如 Neon（免费，无需本地安装）
3. 运行 `npm run db:push` 初始化数据库
4. 启动开发服务器 `npm run dev`
5. 访问 `http://localhost:3000`
