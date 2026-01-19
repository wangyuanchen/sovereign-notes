#!/bin/bash

echo "🔧 切换到开发模式（禁用 Clerk 认证）"

if grep -q "不使用 Clerk 认证" "src/middleware.ts"; then
  echo "⚠️  当前已经是开发模式，无需切换"
  exit 0
fi

# 备份原始 middleware
if [ -f "src/middleware.ts" ]; then
  mv src/middleware.ts src/middleware.prod.ts
  echo "✓ 已备份 middleware.ts -> middleware.prod.ts"
fi

# 使用开发版 middleware
cp src/middleware-dev.ts src/middleware.ts
echo "✓ 已启用开发模式 middleware"

echo ""
echo "✅ 开发模式已启用！"
echo "现在可以运行: npm run dev"
echo ""
echo "恢复生产模式: npm run prod-mode"
