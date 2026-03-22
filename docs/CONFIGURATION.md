# 配置指南

本指南涵盖 Morphic 中的可选功能及其配置。

## 目录

- [数据库](#数据库)
- [身份验证](#身份验证)
- [访客模式](#访客模式)
- [搜索提供商](#搜索提供商)
- [其他 AI 提供商](#其他-ai-提供商)
- [其他功能](#其他功能)

## 数据库

Morphic 使用 PostgreSQL 存储聊天历史。数据库对于基本使用是**可选的**——没有数据库，Morphic 以无状态模式运行，聊天历史不会被持久化。

### 设置 PostgreSQL

在 `.env.local` 中设置连接字符串：

```bash
DATABASE_URL=postgresql://user:password@localhost:5432/morphic
```

任何 PostgreSQL 提供商都可以使用：[Neon](https://neon.tech/)、[Supabase](https://supabase.com/) 或本地 PostgreSQL 实例。

### 运行迁移

配置数据库后，运行迁移以创建必要的表：

```bash
bun run migrate
```

此命令应用 `drizzle/` 目录中的所有迁移。

## 身份验证

默认情况下，Morphic 在**匿名模式**下运行，禁用身份验证（`.env.local.example` 中 `ENABLE_AUTH=false`）。这适用于个人使用，所有用户共享一个匿名用户 ID。

### 匿名模式（默认）

无需配置。`.env.local.example` 中的默认设置包括：

```bash
ENABLE_AUTH=false
ANONYMOUS_USER_ID=anonymous-user
```

**⚠️ 重要**：匿名模式仅适用于个人、单用户环境。所有聊天历史都在一个用户 ID 下共享。

### 启用 Supabase 身份验证

要使用 Supabase 启用用户身份验证：

1. 在 [supabase.com](https://supabase.com) 创建 Supabase 项目

2. 在 `.env.local` 中设置以下环境变量：

```bash
ENABLE_AUTH=true
NEXT_PUBLIC_SUPABASE_URL=[YOUR_SUPABASE_PROJECT_URL]
NEXT_PUBLIC_SUPABASE_ANON_KEY=[YOUR_SUPABASE_ANON_KEY]
```

3. 从 Supabase 仪表板获取您的凭据：
   - **项目 URL**：设置 → API → 项目 URL
   - **匿名密钥**：设置 → API → 项目 API 密钥 → anon/public

启用身份验证后，用户需要注册/登录才能使用 Morphic，每个用户将有隔离的聊天历史。

## 访客模式

访客模式允许用户无需创建账户即可试用 Morphic。访客会话是临时的——聊天历史不会存储在数据库中。

### 启用访客模式

设置以下环境变量：

```bash
ENABLE_GUEST_CHAT=true
```

### 访客模式行为

启用访客模式时：

- **无需身份验证**：用户可以立即开始聊天
- **无聊天历史**：消息不会保存到数据库
- **每次请求的完整上下文**：客户端发送所有消息以维持对话上下文
- **无 URL 导航**：访客停留在根路径（无 `/search/[id]` URL）
- **禁用功能**：
  - 文件上传
  - 质量模式（强制为"速度"）
  - 聊天分享
  - 侧边栏历史

### 访客速率限制

对于云部署，您可以限制每个 IP 地址的访客使用：

```bash
GUEST_CHAT_DAILY_LIMIT=10  # 每个 IP 每天的最大请求数（默认：10）
```

速率限制需要 Redis（Upstash）配置：

```bash
UPSTASH_REDIS_REST_URL=[YOUR_UPSTASH_URL]
UPSTASH_REDIS_REST_TOKEN=[YOUR_UPSTASH_TOKEN]
```

**注意**：速率限制仅在 `MORPHIC_CLOUD_DEPLOYMENT=true` 时应用。对于自托管部署，速率限制默认禁用。

### 推荐设置

| 环境 | 配置 |
| -------------- | -------------------------------------------- |
| 个人/本地 | `ENABLE_AUTH=false`（匿名模式）         |
| 公共演示 | `ENABLE_GUEST_CHAT=true` 带速率限制  |
| 生产环境 | `ENABLE_AUTH=true`（Supabase 身份验证） |

## 搜索提供商

### SearXNG 配置

SearXNG 可用作具有高级搜索功能的替代搜索后端。

#### 基本设置

1. 将 SearXNG 设置为您的搜索提供商：

```bash
SEARCH_API=searxng
SEARXNG_API_URL=http://localhost:8080
SEARXNG_SECRET=""  # 使用以下命令生成：openssl rand -base64 32
```

#### Docker 设置

1. 确保已安装 Docker 和 Docker Compose
2. 根目录中提供两个配置文件：
   - `searxng-settings.yml`：包含 SearXNG 的主要配置
   - `searxng-limiter.toml`：配置速率限制和机器人检测

#### 高级配置

1. 在 `.env.local` 中配置环境变量：

```bash
# SearXNG 基础配置
SEARXNG_PORT=8080
SEARXNG_BIND_ADDRESS=0.0.0.0
SEARXNG_IMAGE_PROXY=true

# 搜索行为
SEARXNG_DEFAULT_DEPTH=basic  # 设置为 'basic' 或 'advanced'
SEARXNG_MAX_RESULTS=50  # 返回的最大结果数
SEARXNG_ENGINES=google,bing,duckduckgo,wikipedia  # 搜索引擎的逗号分隔列表
SEARXNG_TIME_RANGE=None  # 时间范围：day、week、month、year 或 None
SEARXNG_SAFESEARCH=0  # 0：关闭，1：适中，2：严格

# 速率限制
SEARXNG_LIMITER=false  # 启用以限制每个 IP 的请求
```

#### 高级搜索功能

- `SEARXNG_DEFAULT_DEPTH`：控制搜索深度
  - `basic`：标准搜索
  - `advanced`：包括内容爬取和相关性评分
- `SEARXNG_MAX_RESULTS`：返回的最大结果数
- `SEARXNG_CRAWL_MULTIPLIER`：在高级模式下，确定要爬取多少结果
  - 示例：如果 `MAX_RESULTS=10` 且 `CRAWL_MULTIPLIER=4`，最多将爬取 40 个结果

#### 自定义 SearXNG

您可以修改 `searxng-settings.yml` 来：

- 启用/禁用特定搜索引擎
- 更改 UI 设置
- 调整服务器选项

禁用特定引擎的示例：

```yaml
engines:
  - name: wikidata
    disabled: true
```

有关详细配置选项，请参阅 [SearXNG 文档](https://docs.searxng.org/admin/settings/settings.html#settings-yml)

#### 故障排除

- 如果特定搜索引擎不工作，尝试在 `searxng-settings.yml` 中禁用它们
- 对于速率限制问题，调整 `searxng-limiter.toml` 中的设置
- 检查 Docker 日志以查找潜在配置错误：

```bash
docker-compose logs searxng
```

### Brave Search（可选）

当用作一般搜索提供商时，Brave Search 为视频和图像搜索提供增强支持：

```bash
BRAVE_SEARCH_API_KEY=[YOUR_BRAVE_SEARCH_API_KEY]
```

在 https://brave.com/search/api/ 获取您的 API 密钥

**功能：**

- 单次搜索中的多种内容类型（网络、视频、图像、新闻）
- 针对带缩略图的多媒体内容优化
- 直接视频持续时间和元数据支持
- 在搜索查询中指定 `type="general"` 时自动使用

**回退行为：**
如果未配置 `BRAVE_SEARCH_API_KEY`，`type="general"` 搜索将自动回退到您配置的优化搜索提供商。视频和图像搜索仍可工作，但根据提供商的不同，多媒体支持可能有限。

## 其他 AI 提供商

模型在 `config/models/*.json` 文件中配置。每个提供商都需要在环境变量中设置其对应的 API 密钥。

### 模型配置

模型配置文件使用以下结构：

```json
{
  "version": 1,
  "models": {
    "byMode": {
      "quick": {
        "speed": {
          "id": "model-id",
          "name": "Model Name",
          "provider": "Provider Name",
          "providerId": "provider-id",
          "providerOptions": {}
        },
        "quality": {
          "id": "model-id",
          "name": "Model Name",
          "provider": "Provider Name",
          "providerId": "provider-id",
          "providerOptions": {}
        }
      },
      "adaptive": {
        "speed": {
          "id": "model-id",
          "name": "Model Name",
          "provider": "Provider Name",
          "providerId": "provider-id",
          "providerOptions": {}
        },
        "quality": {
          "id": "model-id",
          "name": "Model Name",
          "provider": "Provider Name",
          "providerId": "provider-id",
          "providerOptions": {}
        }
      }
    },
    "relatedQuestions": {
      "id": "model-id",
      "name": "Model Name",
      "provider": "Provider Name",
      "providerId": "provider-id"
    }
  }
}
```

定义所有四种组合以控制每种搜索模式（`quick`、`adaptive`）和偏好（`speed`、`quality`）运行哪个模型。例如，您可以将 `quick/speed` 与 `gemini-2.5-flash-lite` 配对，而将 `adaptive/quality` 保持在 GPT-5 上。默认配置为每个插槽提供 OpenAI 模型，因此 Morphic 开箱即用。

### 支持的提供商

#### OpenAI（默认）

```bash
OPENAI_API_KEY=[YOUR_API_KEY]
```

#### Google Generative AI

```bash
GOOGLE_GENERATIVE_AI_API_KEY=[YOUR_API_KEY]
```

#### Anthropic

```bash
ANTHROPIC_API_KEY=[YOUR_API_KEY]
```

#### Vercel AI Gateway

[Vercel AI Gateway](https://vercel.com/docs/ai-gateway) 允许您通过单个端点使用多个 AI 提供商，具有自动故障转移和负载均衡。

```bash
AI_GATEWAY_API_KEY=[YOUR_AI_GATEWAY_API_KEY]
```

#### Ollama

[Ollama](https://ollama.com/) 使您能够在自己的硬件上本地运行大型语言模型。

**配置：**

```bash
OLLAMA_BASE_URL=http://localhost:11434
```

然后更新您的 `config/models/*.json` 文件以使用 Ollama 模型：

```json
{
  "id": "qwen3:latest",
  "name": "Qwen 3",
  "provider": "Ollama",
  "providerId": "ollama"
}
```

**重要说明：**

- **工具能力**：Morphic 要求模型支持 `tools` 能力以进行函数调用。服务器启动时，Morphic 验证配置的模型并记录结果。请注意，即使模型报告支持工具，实际工具调用性能取决于模型的能力，并不保证。

- **验证日志**：在启动时检查服务器日志以验证您配置的模型：
  ```
  ✓ qwen3:latest（已配置且支持工具）
  ✗ deepseek-r1:latest（已配置但缺乏工具支持）
  ```

## 其他功能

### LLM 可观测性

使用 Langfuse 启用跟踪和监控：

```bash
LANGFUSE_SECRET_KEY=[YOUR_SECRET_KEY]
LANGFUSE_PUBLIC_KEY=[YOUR_PUBLIC_KEY]
LANGFUSE_HOST=https://cloud.langfuse.com
```

### 文件上传

使用 Cloudflare R2 启用文件上传：

```bash
CLOUDFLARE_R2_ACCESS_KEY_ID=[YOUR_ACCESS_KEY]
CLOUDFLARE_R2_SECRET_ACCESS_KEY=[YOUR_SECRET_KEY]
CLOUDFLARE_R2_ACCOUNT_ID=[YOUR_ACCOUNT_ID]
CLOUDFLARE_R2_BUCKET_NAME=[YOUR_BUCKET_NAME]
```

### 替代获取工具

使用 Jina 进行增强的内容提取：

```bash
JINA_API_KEY=[YOUR_API_KEY]
```
