# Morphic 私有化部署指南

本指南详细说明如何在私有环境中部署 Morphic，包括 Docker 部署、带认证的部署、自托管搜索等配置。

## 目录

- [快速开始 (Docker Compose)](#快速开始-docker-compose)
- [环境变量配置](#环境变量配置)
- [启用 Supabase 认证](#启用-supabase-认证)
- [自托管 SearXNG 搜索](#自托管-searxng-搜索)
- [生产环境部署](#生产环境部署)
- [常用命令](#常用命令)
- [故障排除](#故障排除)

---

## 快速开始 (Docker Compose)

### 前置条件

- Docker 和 Docker Compose 已安装
- 克隆代码仓库

### 步骤 1: 配置环境变量

```bash
cp .env.local.example .env.local
```

编辑 `.env.local`，设置必需的环境变量：

```bash
# 数据库连接
DATABASE_URL=postgresql://morphic:morphic@postgres:5432/morphic

# AI 提供商 (至少需要一个)
OPENAI_API_KEY=your_openai_key

# 搜索提供商 (至少需要一个)
TAVILY_API_KEY=your_tavily_key
```

### 步骤 2: 启动服务

```bash
docker compose up -d
```

服务启动顺序：

1. PostgreSQL 17 (带健康检查)
2. Redis (搜索缓存)
3. SearXNG (可选，自托管搜索)
4. Morphic 应用

### 步骤 3: 访问应用

访问 http://localhost:3000

---

## 环境变量配置

### 必需配置

| 变量             | 说明                  | 获取方式                                                    |
| ---------------- | --------------------- | ----------------------------------------------------------- |
| `DATABASE_URL`   | PostgreSQL 连接字符串 | 本地 Docker 或云数据库                                      |
| `OPENAI_API_KEY` | OpenAI API 密钥       | [platform.openai.com](https://platform.openai.com/api-keys) |
| `TAVILY_API_KEY` | Tavily 搜索 API       | [app.tavily.com](https://app.tavily.com/home)               |

### 可选 AI 提供商

```bash
# Anthropic Claude
ANTHROPIC_API_KEY=your_anthropic_key

# Google Gemini
GOOGLE_GENERATIVE_AI_API_KEY=your_gemini_key

# Ollama (本地模型)
OLLAMA_BASE_URL=http://localhost:11434
```

### 可选搜索提供商

```bash
# Exa 神经搜索
EXA_API_KEY=your_exa_key

# Firecrawl 网页抓取
FIRECRAWL_API_KEY=your_firecrawl_key

# Brave 搜索 (图片/视频支持)
BRAVE_SEARCH_API_KEY=your_brave_key
```

---

## 启用 Supabase 认证

默认情况下认证是禁用的 (匿名模式)。要启用用户认证：

### 步骤 1: 创建 Supabase 项目

1. 访问 [supabase.com](https://supabase.com/dashboard)
2. 创建新项目
3. 获取项目 URL 和 Anon Key

### 步骤 2: 配置环境变量

```bash
# 启用认证
ENABLE_AUTH=true

# Supabase 配置
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### 步骤 3: 配置数据库

在 Supabase SQL 编辑器中运行数据库迁移：

```bash
bun migrate
```

或手动导入 `/lib/db/migrations/` 中的迁移文件。

### 注意事项

- `NEXT_PUBLIC_*` 变量在构建时嵌入，无法通过预构建镜像启用
- 如需认证功能，必须从源码构建镜像
- 匿名模式仅适合个人/单用户环境

---

## 自托管 SearXNG 搜索

SearXNG 是开源的元搜索引擎，可以完全自托管。

### 基础配置

```bash
# 搜索提供商选择
SEARCH_API=searxng

# SearXNG 配置
SEARXNG_API_URL=http://searxng:8080
SEARXNG_SECRET=your-secret-key  # 生成: openssl rand -base64 32
SEARXNG_LIMITER=false
```

### 高级配置

```bash
SEARXNG_DEFAULT_DEPTH=advanced    # basic 或 advanced
SEARXNG_MAX_RESULTS=50            # 最大结果数
SEARXNG_ENGINES=google,bing,duckduckgo,wikipedia  # 搜索引擎列表
SEARXNG_SAFESEARCH=0             # 0=关闭, 1=适中, 2=严格
SEARXNG_TIME_RANGE=None          # day, week, month, year, None
```

### SearXNG UI 配置

编辑 `searxng-settings.yml` 自定义 SearXNG 界面和搜索引擎。

---

## 生产环境部署

### 使用预构建镜像

```bash
# 拉取最新镜像
docker pull ghcr.io/miurla/morphic:latest
```

创建 `docker-compose.prod.yaml`:

```yaml
version: '3.8'

services:
  morphic:
    image: ghcr.io/miurla/morphic:latest
    restart: unless-stopped
    ports:
      - '3000:3000'
    env_file: .env.production
    environment:
      DATABASE_URL: ${DATABASE_URL}
      DATABASE_SSL_DISABLED: 'true'
      ENABLE_AUTH: 'true'
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_started

  postgres:
    image: postgres:17-alpine
    restart: unless-stopped
    environment:
      POSTGRES_USER: ${POSTGRES_USER}
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
      POSTGRES_DB: ${POSTGRES_DB}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ['CMD-SHELL', 'pg_isready -U ${POSTGRES_USER}']
      interval: 10s
      timeout: 5s
      retries: 5

  redis:
    image: redis:alpine
    restart: unless-stopped
    volumes:
      - redis_data:/data
    command: redis-server --appendonly yes

volumes:
  postgres_data:
  redis_data:
```

启动生产环境：

```bash
docker compose -f docker-compose.prod.yaml up -d
```

### 从源码构建

```bash
# 构建镜像
docker compose build morphic

# 启动服务
docker compose up -d
```

### 反向代理配置 (Nginx)

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### HTTPS 配置 (Let's Encrypt)

```bash
# 安装 certbot
sudo apt install certbot python3-certbot-nginx

# 获取证书
sudo certbot --nginx -d your-domain.com
```

---

## 常用命令

```bash
# 启动所有服务
docker compose up -d

# 停止所有服务
docker compose down

# 停止并删除数据卷 (重置数据库)
docker compose down -v

# 查看日志
docker compose logs -f morphic

# 查看特定服务日志
docker compose logs -f postgres

# 重启应用
docker compose restart morphic

# 重新构建镜像
docker compose build --no-cache morphic

# 进入容器
docker compose exec morphic sh

# 执行数据库迁移
docker compose exec morphic bun run lib/db/migrate.ts
```

---

## 故障排除

### 数据库连接失败

1. 检查 PostgreSQL 是否健康：

   ```bash
   docker compose ps postgres
   ```

2. 验证连接字符串格式：

   ```
   postgresql://user:password@host:5432/database
   ```

3. 检查日志：
   ```bash
   docker compose logs postgres
   ```

### 认证不工作

1. 确认 `ENABLE_AUTH=true`
2. 验证 Supabase URL 和 Anon Key 正确
3. 检查浏览器控制台错误
4. 确保数据库迁移已执行

### 搜索功能异常

1. 检查 SearXNG 是否运行：

   ```bash
   docker compose ps searxng
   curl http://localhost:8080
   ```

2. 验证 API 密钥配置
3. 查看搜索日志

### 性能问题

1. 增加 Redis 内存：

   ```yaml
   redis:
     image: redis:alpine
     command: redis-server --maxmemory 512mb --appendonly yes
   ```

2. 启用 CDN 加速静态资源
3. 配置适当的数据库连接池

---

## 安全建议

1. **使用环境变量文件**: 不要在代码中硬编码密钥
2. **启用 HTTPS**: 生产环境必须使用 SSL/TLS
3. **限制端口访问**: 只开放必要的端口 (80, 443)
4. **定期更新**: 保持 Docker 镜像和依赖最新
5. **监控日志**: 设置日志收集和告警
6. **数据库备份**: 定期备份 PostgreSQL 数据
