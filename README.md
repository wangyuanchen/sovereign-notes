# Sovereign Notes

**你的笔记，永远属于你** - Web3 隐私优先的个人笔记与待办清单工具

## ✨ 特性

- 🔐 **端到端加密** - 使用 Web Crypto API，所有加密在浏览器完成
- 📝 **Markdown 支持** - 支持代码高亮、任务列表、表格等
- 💾 **本地存储** - 数据加密后存储在 IndexedDB
- 🎨 **清新界面** - 简洁优雅的设计
- 🔍 **快速搜索** - 实时搜索笔记标题和内容
- 🌙 **隐私优先** - 密钥永不上传，服务端无法解密

## 🚀 快速开始

### 本地运行

直接打开 `index.html` 即可使用，无需安装任何依赖。

### 部署到 Vercel

1. Fork 这个仓库
2. 在 Vercel 导入项目
3. 点击部署

或使用 Vercel CLI：

```bash
npm i -g vercel
vercel
```

## 🔒 安全说明

- 所有笔记使用 AES-GCM 256 位加密
- 密钥通过 PBKDF2 从主密码派生（100,000 次迭代）
- 密钥仅存在于内存中，永不持久化
- 服务端（localStorage）只存储加密后的密文

## 📖 使用方法

1. **首次使用**：设置一个主密码，用于加密所有笔记
2. **创建笔记**：点击"新建笔记"按钮
3. **编辑**：支持 Markdown 语法，可切换预览模式
4. **保存**：点击保存按钮或等待自动保存（30秒）
5. **搜索**：在搜索框输入关键词快速查找

## 🛠️ 技术栈

- 纯 HTML/CSS/JavaScript
- Tailwind CSS - UI 样式
- Web Crypto API - 加密
- Marked.js - Markdown 渲染
- LocalStorage - 数据持久化

## 📝 Markdown 示例

```markdown
# 标题 1
## 标题 2

**粗体** *斜体* `代码`

- [ ] 待办事项
- [x] 已完成

\`\`\`javascript
console.log('Hello World');
\`\`\`
```

## 🔮 未来计划

- [ ] 跨设备同步（Arweave + Lit Protocol）
- [ ] Web3 钱包登录
- [ ] 加密货币支付订阅
- [ ] PWA 支持
- [ ] 标签和分类
- [ ] 导出功能

## 📄 许可证

MIT License

---

**注意**：请务必记住你的主密码，一旦忘记将无法恢复笔记内容。
