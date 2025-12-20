# Dify 后端配置指南

## ⚠️ 当前错误

错误信息：`DIFY API Key is not configured.`

这是因为后端 `.env` 文件中缺少 Dify API 密钥配置。

## ✅ 解决方案

### 1. 获取 Dify API 密钥

1. 登录 [Dify Dashboard](https://dify.ai/)
2. 进入你的应用或工作空间
3. 进入 **API 密钥** 或 **Settings** > **API Keys**
4. 创建新的 API 密钥或复制现有的密钥

### 2. 配置后端环境变量

编辑 `src/backend/.env` 文件，添加你的 Dify API 密钥：

```env
# Dify API Configuration
DIFY_BASE_URL=https://api.dify.ai/v1
DIFY_API_KEY_LAYOUT=app-你的布局分析应用的API密钥
DIFY_API_KEY_REPORT=app-你的报告生成应用的API密钥

# 如果两个应用使用同一个 API Key，可以只配置一个：
# DIFY_API_KEY=app-你的API密钥
```

### 3. 重启后端服务器

配置完成后，需要重启后端服务器：

```bash
# 停止当前运行的后端服务器（如果正在运行）
# 然后重新启动
cd src/backend
npm start
```

## 📝 配置说明

### 环境变量说明

- **DIFY_BASE_URL**: Dify API 基础 URL（默认：`https://api.dify.ai/v1`）
- **DIFY_API_KEY_LAYOUT**: 用于布局分析（Agent 1）的 API 密钥
- **DIFY_API_KEY_REPORT**: 用于报告生成（Agent 2）的 API 密钥
- **DIFY_API_KEY**: 如果两个应用使用同一个密钥，可以只配置这个
- **DIFY_DEFAULT_USER**: 默认用户ID（可选，默认：`fengshui-user`）

### 优先级

后端代码会按以下优先级查找 API 密钥：

1. `DIFY_API_KEY_LAYOUT` 或 `DIFY_API_KEY_REPORT`（如果设置了）
2. `DIFY_API_KEY`（如果上面没有设置）
3. 如果都没有设置，会显示警告但不会阻止服务器启动

## 🔍 验证配置

配置完成后，检查后端服务器日志：

```bash
cd src/backend
npm start
```

如果看到以下警告，说明配置不正确：
```
[WARN] DIFY_API_KEY_LAYOUT or DIFY_API_KEY_REPORT is not set. API requests will fail.
```

如果配置正确，这个警告不会出现。

## 🚀 测试

配置完成后，尝试上传户型图，应该能够正常调用 Dify API。

如果仍然遇到错误，请检查：
1. API 密钥是否正确
2. 后端服务器是否已重启
3. API 密钥是否有权限访问对应的应用

