# Supabase Configuration Guide

## 1. Create Supabase Project

1. Go to [https://supabase.com](https://supabase.com)
2. Create a new project
3. Wait for the database to be provisioned

## 2. Run Database Schema

1. Go to your Supabase project dashboard
2. Click on "SQL Editor" in the left sidebar
3. Click "New Query"
4. Copy and paste the contents of `supabase_schema.sql`
5. Click "Run" to execute the schema

## 3. Get API Credentials

1. Go to "Project Settings" → "API"
2. Copy the following values:
   - **Project URL**: `https://xxxxx.supabase.co`
   - **anon/public key**: `eyJhbGc...` (long string)

## 4. Configure Environment Variables

### 配置文件位置

**Supabase 配置必须放在项目根目录下的 `.env` 文件中。**

**重要说明：**
- ✅ **项目根目录**：`/项目根目录/.env`（正确位置）
- ❌ **后端目录**：`/项目根目录/src/backend/.env`（错误位置）

**原因：**
- 前端代码使用 Vite 的环境变量系统（`import.meta.env.VITE_*`）
- Vite 只从**项目根目录**读取 `.env` 文件
- 后端代码不使用 Supabase 配置，所以不需要在后端目录配置

**文件路径示例：**
```
fengshui-master/
├── .env                    ← Supabase 配置放这里（项目根目录）
├── src/
│   ├── backend/
│   │   └── .env           ← 这里是后端配置（Dify、Stripe），不是 Supabase
│   └── services/
│       └── supabaseService.ts
└── ...
```

**重要提示：**
- `.env` 文件已经在 `.gitignore` 中，不会被提交到 Git
- 如果项目根目录下没有 `.env` 文件，请创建一个

### 配置步骤

1. 在项目根目录创建 `.env` 文件（如果不存在）
2. 添加以下内容：

```env
# Supabase Configuration
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

3. 将 `your-project-id` 替换为你的 Supabase 项目 ID
4. 将 `your-anon-key-here` 替换为你的 anon/public key

### 示例

```env
# Supabase Configuration
VITE_SUPABASE_URL=https://abcdefghijklmnop.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFiY2RlZmdoaWprbG1ub3AiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTYxNjIzOTAyMiwiZXhwIjoxOTMxODE1MDIyfQ.example
```

### 验证配置

配置完成后，重启开发服务器（如果正在运行）：

```bash
# 停止当前服务器 (Ctrl+C)
# 然后重新启动
npm run dev
```

在浏览器控制台中，你应该看到：
- ✅ 如果配置正确：`[Supabase] Loaded consultation state from cloud`
- ❌ 如果配置错误：`[Supabase] Not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY...`

## 5. Test the Connection

配置完成后，应用将：
- ✅ 自动将咨询结果保存到 Supabase
- ✅ 当用户返回时加载之前的结果（相同的邮箱 + 出生信息 + 户型图）
- ❌ 如果 Supabase 未配置或连接失败，会抛出错误（不再使用 localStorage 作为备用）

## Database Structure

The `consultations` table stores:
- User identification (email, birth_date, gender, house_type)
- Floor plan hash (to detect if user uploaded different images)
- Agent 1 results (layout grid)
- Agent 2 results (energy summary)
- Full report (after payment)
- Payment status

## Key Features

### Smart Caching
- Uses `floor_plans_hash` to detect if user uploaded the same floor plan
- If hash matches, loads cached results instantly
- If hash differs, triggers new analysis

### Cloud Storage
- **Supabase**: 持久化云存储，跨设备访问
- 所有数据存储在 Supabase，不再使用 localStorage

### Privacy
- Row Level Security (RLS) enabled
- Users can only access their own data
- No authentication required (uses email as identifier)

## Troubleshooting

### "Failed to save to Supabase"
- Check if `.env` variables are set correctly
- Verify Supabase project is active
- Check browser console for detailed error messages

### "No data loaded"
- Ensure email, birth_date, gender, and house_type match exactly
- Check if floor plan files are the same (hash comparison)
- Verify data exists in Supabase dashboard (Table Editor)

## 配置检查

### 如何确认配置是否正确

1. **检查环境变量是否加载**：
   - 打开浏览器开发者工具（F12）
   - 查看 Console 标签
   - 如果看到 `[Supabase] Not configured...` 说明配置未生效

2. **常见问题**：
   - **问题**：配置了但提示未配置
     - **解决**：确保 `.env` 文件在项目根目录，变量名以 `VITE_` 开头，重启开发服务器
   
   - **问题**：保存数据时出错
     - **解决**：检查 Supabase 项目是否激活，API 密钥是否正确，RLS 策略是否允许操作

3. **生产环境配置**：
   - 如果部署到 Vercel/Netlify 等平台，需要在平台的环境变量设置中添加：
     - `VITE_SUPABASE_URL`
     - `VITE_SUPABASE_ANON_KEY`
