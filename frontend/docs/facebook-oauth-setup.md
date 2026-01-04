# Facebook OAuth 设置指南

本指南将帮助你设置 Facebook 登录功能。

## 1. 创建 Facebook 应用

1. 访问 [Facebook 开发者平台](https://developers.facebook.com/)
2. 点击右上角的"我的应用"
3. 点击"创建应用"
4. 选择"消费者"或"商务"类型
5. 填写应用信息并创建

## 2. 配置 Facebook 登录

1. 在应用面板中，点击左侧菜单的"添加产品"
2. 找到并点击"Facebook 登录"，选择"网站"
3. 在设置中添加以下 OAuth 重定向 URI：
   ```
   http://localhost:3000/api/auth/callback/facebook
   ```
   注意：在生产环境中，需要将域名改为你的实际域名。

## 3. 获取应用凭据

1. 在左侧菜单中点击"设置" > "基本信息"
2. 你会看到：
   - 应用编号（这就是你的 `FACEBOOK_CLIENT_ID`）
   - 应用密钥（这就是你的 `FACEBOOK_CLIENT_SECRET`）

## 4. 配置环境变量

1. 在项目根目录复制 `.env.local.example` 到 `.env.local`：
   ```bash
   cp .env.local.example .env.local
   ```

2. 编辑 `.env.local`，填入你的 Facebook 应用凭据：
   ```
   FACEBOOK_CLIENT_ID=你的应用编号
   FACEBOOK_CLIENT_SECRET=你的应用密钥
   ```

## 5. 验证设置

1. 启动开发服务器：
   ```bash
   npm run dev
   ```

2. 访问 http://localhost:3000/login
3. 点击 "使用 Facebook 登录" 按钮
4. 如果配置正确，你应该能看到 Facebook 登录对话框

## 注意事项

- 在开发环境中，Facebook 登录只能在 localhost 域名下工作
- 对于生产环境，你需要：
  1. 在 Facebook 开发者平台添加你的域名
  2. 更新重定向 URI
  3. 提交应用审核
  4. 更新环境变量

## 常见问题

1. 如果登录按钮不起作用，检查：
   - 环境变量是否正确配置
   - 重定向 URI 是否正确设置
   - 应用是否处于开发模式

2. 如果遇到跨域问题：
   - 确保在 Facebook 开发者平台正确配置了域名
   - 检查 NextAuth 配置是否正确

需要更多帮助？请查看：
- [NextAuth.js 文档](https://next-auth.js.org/)
- [Facebook 开发者文档](https://developers.facebook.com/docs/)