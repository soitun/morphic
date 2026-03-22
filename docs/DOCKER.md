# Docker 指南

本指南涵盖使用 Docker 运行 Morphic，包括开发设置、预构建镜像和部署选项。

## 使用 Docker Compose 快速开始

1. 配置环境变量：

```bash
cp .env.local.example .env.local
```

编辑 `.env.local` 并设置必需变量：

```bash
DATABASE_URL=postgresql://morphic:morphic@postgres:5432/morphic
OPENAI_API_KEY=your_openai_key
TAVILY_API_KEY=your_tavily_key
BRAVE_SEARCH_API_KEY=your_brave_key
```

**注意**：默认情况下禁用身份验证（`.env.local.example` 中 `ENABLE_AUTH=false`）。

**可选**：通过在 `.env.local` 中设置环境变量来自定义 PostgreSQL 凭据：

```bash
POSTGRES_USER=morphic      # 默认：morphic
POSTGRES_PASSWORD=morphic  # 默认：morphic
POSTGRES_DB=morphic        # 默认：morphic
POSTGRES_PORT=5432         # 默认：5432
```

2. 启动 Docker 容器：

```bash
docker compose up -d
```

应用程序将：

- 启动带健康检查的 PostgreSQL 17
- 启动 Redis 用于 SearXNG 搜索缓存
- 等待数据库准备就绪
- 自动运行数据库迁移
- 启动 Morphic 应用程序
- 启动 SearXNG（可选搜索提供商）

3. 在浏览器中访问 http://localhost:3000。

**注意**：数据库数据持久化在 Docker 卷中。要重置数据库，运行：

```bash
docker compose down -v  # 这将删除所有数据
```

## 使用预构建镜像

预构建的 Docker 镜像会自动构建并发布到 GitHub Container Registry：

```bash
docker pull ghcr.io/miurla/morphic:latest
```

您可以通过在 `docker-compose.yaml` 中设置镜像来使用它与 docker-compose：

```yaml
services:
  morphic:
    image: ghcr.io/miurla/morphic:latest
    env_file: .env.local
    environment:
      DATABASE_URL: postgresql://morphic:morphic@postgres:5432/morphic
      DATABASE_SSL_DISABLED: 'true'
      ENABLE_AUTH: 'false'
    ports:
      - '3000:3000'
    depends_on:
      - postgres
      - redis
```

**注意**：预构建镜像仅在**匿名模式**下运行（`ENABLE_AUTH=false`）。无法启用 Supabase 身份验证，因为 `NEXT_PUBLIC_*` 环境变量在构建时由 Next.js 嵌入。要启用身份验证或自定义模型配置，您需要从源代码构建——详情请参阅 [CONFIGURATION.md](./CONFIGURATION.md)。

## 从源代码构建

使用 Docker Compose 进行包含 PostgreSQL、Redis 和 SearXNG 的完整设置。请参阅上面的 [快速开始](#使用-docker-compose-快速开始) 部分。

## 有用命令

```bash
# 在后台启动所有容器
docker compose up -d

# 停止所有容器
docker compose down

# 停止所有容器并删除卷（删除数据库数据）
docker compose down -v

# 查看日志
docker compose logs -f morphic

# 重新构建镜像
docker compose build morphic
```
