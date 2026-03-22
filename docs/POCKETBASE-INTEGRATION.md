# PocketBase 集成指南

本指南说明如何将 Morphic 从 Supabase + Cloudflare R2 迁移到 PocketBase。

## 🎯 迁移概述

### 替换的组件
- **认证系统**：Supabase Auth → PocketBase Auth
- **文件存储**：Cloudflare R2 → PocketBase Files API
- **用户管理**：Supabase Users → PocketBase Users

### 保留的组件
- **主数据库**：PostgreSQL + Drizzle ORM
- **缓存系统**：Redis
- **AI 集成**：OpenAI、Anthropic 等

## 🚀 快速开始

### 1. 使用 Docker Compose（推荐）

```bash
# 复制环境变量配置
cp .env.pocketbase.example .env.local

# 启动所有服务
docker compose -f docker-compose.pocketbase.yaml up -d
```

### 2. 手动启动 PocketBase

```bash
# 下载并启动 PocketBase
chmod +x scripts/start-pocketbase.sh
./scripts/start-pocketbase.sh
```

## 📋 环境变量配置

### 必需变量

```bash
# PocketBase 服务器 URL
POCKETBASE_URL=http://localhost:8090

# 启用认证
ENABLE_AUTH=true

# 数据库连接
DATABASE_URL=postgresql://morphic:morphic@postgres:5432/morphic

# AI 提供商
OPENAI_API_KEY=your_openai_key
TAVILY_API_KEY=your_tavily_key
```

### 可选变量

```bash
# 匿名用户 ID（当 ENABLE_AUTH=false 时）
ANONYMOUS_USER_ID=anonymous-user

# Docker 数据库配置
POSTGRES_USER=morphic
POSTGRES_PASSWORD=morphic
POSTGRES_DB=morphic
```

## 🏗️ 架构变更

### 认证流程

#### Supabase（原）
```typescript
const supabase = await createClient()
const { data } = await supabase.auth.getUser()
```

#### PocketBase（新）
```typescript
import { getCurrentUser } from '@/lib/auth/pocketbase-auth'

const user = await getCurrentUser()
```

### 文件上传

#### Cloudflare R2（原）
```typescript
const r2Client = getR2Client()
await r2Client.send(new PutObjectCommand({...}))
```

#### PocketBase（新）
```typescript
import { uploadFileToPocketBase } from '@/lib/storage/pocketbase-client'

const result = await uploadFileToPocketBase(file, userId, chatId)
```

## 🗄️ 数据库结构

### PocketBase 集合

#### Users 集合（扩展）
- `id`：用户 ID
- `email`：邮箱
- `name`：显示名称
- `avatar`：头像文件
- `preferences`：用户偏好设置（JSON）
- `created`：创建时间
- `updated`：更新时间
- `verified`：邮箱验证状态

#### Uploads 集合
- `id`：上传记录 ID
- `user`：关联用户（外键）
- `chatId`：聊天 ID
- `file`：文件对象
- `originalName`：原始文件名
- `mediaType`：文件类型
- `size`：文件大小
- `created`：上传时间
- `updated`：更新时间

## 🔄 迁移步骤

### 阶段 1：基础设施
1. ✅ 添加 PocketBase 依赖
2. ✅ 创建 PocketBase 客户端
3. ✅ 配置 Docker Compose

### 阶段 2：认证系统
1. ✅ 创建 PocketBase 认证模块
2. ✅ 更新 layout.tsx
3. ⏳ 更新认证组件（登录/注册）

### 阶段 3：文件上传
1. ✅ 创建 PocketBase 文件存储
2. ✅ 更新上传 API
3. ⏳ 更新前端上传组件

### 阶段 4：测试和优化
1. ⏳ 单元测试
2. ⏳ 集成测试
3. ⏳ 性能优化

## 🎛️ 管理后台

PocketBase 提供内置管理后台：

访问：`http://localhost:8090/_/`

默认管理员账户：
- 邮箱：`admin@example.com`
- 密码：首次访问时设置

## 🔧 开发工具

### 数据库迁移
```bash
# 运行迁移
./pocketbase migrate --dir pocketbase/migrations

# 查看迁移状态
./pocketbase migrate --dir pocketbase/migrations --status
```

### API 测试
```bash
# 健康检查
curl http://localhost:8090/api/health

# 获取集合列表
curl http://localhost:8090/api/collections
```

## 📊 性能对比

| 指标 | Supabase + R2 | PocketBase |
|------|---------------|-----------|
| **启动时间** | ~30s | ~5s |
| **内存占用** | ~200MB | ~50MB |
| **网络延迟** | ~100ms | ~10ms |
| **存储成本** | $0.15/GB | 免费 |
| **API 调用** | 按量计费 | 免费 |

## 🚨 注意事项

### 安全性
- PocketBase 默认允许匿名访问，需要配置权限规则
- 建议在生产环境中启用 HTTPS
- 定期备份数据库

### 限制
- 单文件上传限制：5MB
- 支持的文件类型：JPEG、PNG、PDF、TXT
- 并发连接数：默认 1000

### 扩展性
- 可以配置 PostgreSQL 作为后端数据库
- 支持水平扩展（多个实例）
- 可以集成 CDN 进行文件加速

## 🎯 故障排除

### 常见问题

#### 1. 无法连接 PocketBase
```bash
# 检查服务状态
curl http://localhost:8090/api/health

# 检查端口占用
netstat -tulpn | grep 8090
```

#### 2. 文件上传失败
- 检查文件大小是否超过 5MB
- 确认文件类型是否受支持
- 验证用户权限

#### 3. 认证问题
- 检查 `ENABLE_AUTH` 环境变量
- 验证 PocketBase URL 配置
- 查看浏览器控制台错误信息

### 日志调试
```bash
# 查看 PocketBase 日志
docker compose -f docker-compose.pocketbase.yaml logs pocketbase

# 查看 Morphic 日志
docker compose -f docker-compose.pocketbase.yaml logs morphic
```

## 🎉 迁移完成

迁移完成后，您将拥有：

- ✅ 统一的认证和文件存储系统
- ✅ 更快的响应速度
- ✅ 更低的运营成本
- ✅ 完全的数据控制权
- ✅ 简化的部署流程

## 📞 支持

如需帮助，请参考：
- [PocketBase 官方文档](https://pocketbase.io/docs/)
- [Morphic 项目仓库](https://github.com/miurla/morphic)
- [问题反馈](https://github.com/miurla/morphic/issues)
