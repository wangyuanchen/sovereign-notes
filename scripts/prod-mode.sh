#!/bin/bash

echo "🔧 切换到生产模式（启用 Clerk 认证）"

# 恢复原始 middleware
if [ -f "src/middleware.prod.ts" ]; then
  mv src/middleware.prod.ts src/middleware.ts
  echo "✓ 已恢复 middleware.ts"
else
  echo "⚠️  未找到备份文件"
fi

echo ""
echo "✅ 生产模式已启用！"
echo "确保已配置 Clerk 密钥"
