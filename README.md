# 游戏鸡自动续期

## 🔥 最近更新 (v2.0)

- **全新的 Web UI**: 为了方便管理，我们重写了整个 Web UI，现在您可以轻松地添加、编辑和删除服务器配置。
- **自定义续期时间**: 您现在可以为每个服务器单独设置续期时间，以满足不同服务器的需求。
- **更强的安全性**: 添加了基于用户名和密码的登录认证，以保护您的管理面板。
- **多平台部署支持**: 新增了 Docker、Zeabur 和 Vercel 的部署指南。
- **代码重构**: 为了更好的可读性和可维护性，对后端逻辑进行了全面重构。

这是一个可多平台部署的脚本，旨在自动为“游戏鸡”服务器续期。它提供了一个 Web UI 用于管理服务器配置，并能在续期任务完成后通过 Telegram 发送通知。

## ✨ 功能

- **自动续期**: 定时任务，无需人工干预。
- **Web UI 管理**: 通过网页界面轻松添加、删除或更新服务器配置。
- **自定义续期**: 支持为每个服务器设置独立的续期时间。
- **Telegram 通知**: 续期任务完成后，将结果报告发送到指定的 Telegram 聊天。
- **易于部署**: 只需几个步骤即可在 Cloudflare Workers 上完成部署。
- **安全可靠**: 通过环境变量保护敏感信息，并使用 KV 存储配置。

## 🚀 部署指南

### 步骤 1: 安装 Wrangler CLI

如果您尚未安装 Cloudflare 的命令行工具 Wrangler，请先安装它。

```bash
npm install -g wrangler
```

### 步骤 2: 克隆仓库并配置

1.  **克隆此仓库到本地:**
    ```bash
    git clone https://github.com/your-username/Games-keeping.git
    cd Games-keeping
    ```

2.  **（重要）确认 `wrangler.toml` 配置:**
    确保 `wrangler.toml` 文件中的 `main` 指向 `index.js`:
    ```toml
    name = "gamechi-auto-renew"
    main = "index.js"
    compatibility_date = "2023-08-01"
    ```

3.  **登录到 Wrangler:**
    ```bash
    wrangler login
    ```

### 步骤 3: 创建 KV 命名空间

此 Worker 使用 Cloudflare KV 来存储服务器配置。您需要创建一个 KV 命名空间。

```bash
wrangler kv:namespace create "AUTO_RENEW_KV"
```

此命令会返回一个 `id`。请将它添加到 `wrangler.toml` 文件中，如下所示:

```toml
[[kv_namespaces]]
binding = "AUTO_RENEW_KV"
id = "your_kv_namespace_id_here" # 替换为你的 ID
```

### 步骤 4: 配置环境变量

在部署之前，您需要在 Cloudflare 控制台或通过 `wrangler.toml` 设置以下环境变量。

-   `AUTH_USERNAME`: 登录 Web UI 的用户名。
-   `AUTH_PASSWORD`: 登录 Web UI 的密码。
-   `TG_BOT_TOKEN` (可选): 您的 Telegram Bot Token。
-   `TG_CHAT_ID` (可选): 您的 Telegram Chat ID。

> **旧版用户注意**:
> 如果您之前使用 `SERVERS_CONFIG` 环境变量来存储服务器列表，新版脚本会在首次运行时自动将这些数据迁移到 KV 存储中。迁移成功后，建议您从环境变量中删除 `SERVERS_CONFIG`，以确保所有配置都由 Web UI 管理。

**通过 `wrangler secret put` 命令设置 (推荐):**

```bash
wrangler secret put AUTH_USERNAME
wrangler secret put AUTH_PASSWORD
wrangler secret put TG_BOT_TOKEN
wrangler secret put TG_CHAT_ID
```

### 步骤 5: 配置定时触发器

为了让续期任务定时运行，您需要在 `wrangler.toml` 文件中配置一个 cron 触发器。默认配置是每天执行一次。

```toml
[triggers]
crons = ["0 16 * * *"] # 默认每天 UTC 时间 16:00 (北京时间 00:00) 执行
```

### 步骤 6: 部署 Worker

一切准备就绪后，部署您的 Worker。

```bash
wrangler deploy
```

部署成功后，Wrangler 会返回您的 Worker URL。

### 在 Zeabur 上部署

1.  **Fork 本仓库**: 点击仓库右上角的 "Fork" 按钮。
2.  **在 Zeabur 中创建新服务**:
    *   登录到您的 [Zeabur](https://zeabur.com) 仪表板。
    *   点击 "Deploy New Service"，然后选择 "Deploy from your Git repository"。
    *   选择您刚刚 Fork 的仓库。
3.  **配置环境变量**:
    *   在 Zeabur 的服务设置中，转到 "Variables" 选项卡。
    *   添加与 Cloudflare 部署相同的环境变量 (`AUTH_USERNAME`, `AUTH_PASSWORD`, `TG_BOT_TOKEN`, `TG_CHAT_ID`)。
    *   **注意**: Zeabur 的环境无法直接访问 Cloudflare KV。您需要修改代码以使用其他存储方式（如 Zeabur 的内置数据库服务）来存储服务器配置。
4.  **部署**: Zeabur 会自动检测 `Dockerfile` 并为您构建和部署镜像。

### 在 Vercel 上部署

Vercel 主要用于部署静态网站和 Serverless Functions，但它也支持 Docker 部署。

1.  **安装 Vercel CLI**:
    ```bash
    npm i -g vercel
    ```
2.  **登录 Vercel**:
    ```bash
    vercel login
    ```
3.  **部署**:
    在项目根目录下运行 `vercel` 命令。Vercel 会自动检测 `Dockerfile` 并进行部署。
    ```bash
    vercel
    ```
4.  **配置环境变量**:
    部署后，在 Vercel 项目的设置中添加所需的环境变量。
    *   **注意**: 与 Zeabur 类似，Vercel 也无法直接访问 Cloudflare KV。您需要修改代码以适应 Vercel 的 Serverless 环境和存储方案（如 Vercel KV）。

### 使用 Docker 部署

您也可以使用 Docker 在任何支持 Docker 的环境中手动部署此应用。

1.  **构建 Docker 镜像**:
    在项目根目录下，运行以下命令来构建镜像：
    ```bash
    docker build -t gamechi-auto-renew .
    ```
2.  **运行 Docker 容器**:
    使用以下命令运行容器。请确保将 `your_...` 替换为您的实际配置。
    ```bash
    docker run -d \
      -e AUTH_USERNAME="your_username" \
      -e AUTH_PASSWORD="your_password" \
      -e TG_BOT_TOKEN="your_tg_bot_token" \
      -e TG_CHAT_ID="your_tg_chat_id" \
      --name gamechi-auto-renew \
      gamechi-auto-renew
    ```
    *   **重要提示**: 此 `Dockerfile` 默认只会运行一次续期任务然后退出。如果您希望它作为定时任务运行，您需要在宿主机上设置一个 cron job 来执行 `docker start gamechi-auto-renew`。

## 🛠️ 使用方法

1.  **访问 Worker URL**: 在浏览器中打开您的 Worker URL。
2.  **登录**: 使用您在环境变量中设置的 `AUTH_USERNAME` 和 `AUTH_PASSWORD` 登录。
3.  **管理服务器**:
    -   点击“添加一个服务器”按钮。
    -   填写服务器的**名称** (可选)、**API Key**、**Server ID**、**续期 URL** 和**续期时间**（Cron 表达式）。
    -   点击“保存所有更改”来保存您的配置。

配置完成后，Worker 将根据您设置的 cron 表达式自动执行续期任务。

## 🤝 贡献

欢迎提交 Pull Request 或创建 Issue 来为这个项目做出贡献。

## 📄 许可证

本项目根据 [MIT License](LICENSE) 授权。
