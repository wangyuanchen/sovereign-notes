# 快速启动指南

## 问题：Clerk 密钥错误

如果你看到 "Publishable key not valid" 错误，这是因为需要配置 Clerk 认证服务。

## 解决方案（选择一个）

### 方案 1：配置 Clerk（推荐，5分钟）

1. 访问 https://clerk.com 并注册（免费）
2. 创建新应用
3. 复制 API 密钥
4. 更新 `.env.local` 文件：

```bash
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_你的真实密钥
CLERK_SECRET_KEY=sk_test_你的真实密钥
```

5. 重启开发服务器：`npm run dev`

### 方案 2：使用测试模式（临时）

如果你只想快速查看项目，可以临时禁用认证：

1. 重命名 `src/middleware.ts` 为 `src/middleware.ts.bak`
2. 创建新的 `src/middleware.ts`：

```typescript
import { NextResponse } from 'next/server';

export function middleware() {
  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)'],
};
```

3. 修改需要认证的页面（如 `src/app/page.tsx`），注释掉认证检查：

```typescript
// const { userId } = await auth();
const userId = 'dev-user-123'; // 临时测试 ID
```

4. 重启服务器

### 方案 3：使用 Docker（完整环境）

```bash
# 即将推出
docker-compose up
```

## 数据库配置

项目需要 PostgreSQL 数据库。最简单的方式：

### 使用 Neon（免费云数据库）

1. 访问 https://neon.tech
2. 创建免费项目
3. 复制连接字符串到 `.env.local`：

```bash
DATABASE_URL=postgresql://user:pass@host.neon.tech/dbname
```

4. 初始化数据库：

```bash
npm run db:push
```

## 完整启动流程

```bash
# 1. 安装依赖
npm install

# 2. 配置环境变量（复制并编辑）
cp .env.example .env.local

# 3. 配置 Clerk 和数据库（见上文）

# 4. 初始化数据库
npm run db:push

# 5. 启动开发服务器
npm run dev
```

## 常见问题

**Q: 我不想配置 Clerk，能运行吗？**
A: 可以，使用方案 2 临时禁用认证。但生产环境必须配置。

**Q: 数据库连接失败？**
A: 确保 PostgreSQL 正在运行，或使用 Neon 等云服务。

**Q: 端口 3000 被占用？**
A: 使用 `npm run dev -- -p 3001` 指定其他端口。

## 需要帮助？

查看详细文档：
- `DEVELOPMENT.md` - 开发环境配置
- `SETUP.md` - 完整安装指南
- `README.md` - 项目介绍
