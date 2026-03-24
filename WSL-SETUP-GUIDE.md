# WSL 环境下的 PocketBase 设置指南

## 🚨 当前问题

您在 WSL (Windows Subsystem for Linux) 环境中遇到了 PowerShell 命令兼容性问题，这导致无法正常启动 PocketBase。

## 🔧 解决方案

### 方案一：使用 WSL 内置的 Linux 命令

在 WSL 中，建议直接使用 Linux 命令而不是 PowerShell cmdlet：

```bash
# 在 WSL 中执行
cd /mnt/d/projects/morphic

# 删除旧的 PocketBase
rm -rf pocketbase

# 下载新的 PocketBase
wget https://github.com/pocketbase/pocketbase/releases/download/v0.36.7/pocketbase_0.36.7_linux_amd64.zip
unzip pocketbase_0.36.7_linux_amd64.zip
chmod +x pocketbase

# 启动 PocketBase
./pocketbase serve --http=0.0.0.0:8090 --dir=pocketbase_data
```

### 方案二：使用 Docker（推荐）

最简单的方式是使用 Docker，它会处理所有环境差异：

```bash
# 启动完整环境
docker compose -f docker-compose.pocketbase.yaml up -d

# PocketBase 将自动启动并可用
# 访问管理后台：http://localhost:8090/_/
```

### 方案三：修复 PowerShell 执行

如果您仍想使用 PowerShell，可以尝试以下方法：

```powershell
# 使用 PowerShell 的 Start-Process
Start-Process -FilePath "./pocketbase/pocketbase.exe" -ArgumentList "serve","--http=0.0.0.0:8090","--dir=pocketbase_data"

# 或者直接调用
& ./pocketbase/pocketbase.exe serve --http=0.0.0.0:8090 --dir=pocketbase_data
```

## 🎯 推荐步骤

1. **使用 Docker 启动**：
   ```bash
   docker compose -f docker-compose.pocketbase.yaml up -d
   ```

2. **验证服务**：
   - 访问：http://localhost:8090/_/
   - 检查健康：http://localhost:8090/api/health

3. **启动 Morphic**：
   ```bash
   bun dev
   ```

## 📋 故障排除

### 检查 PocketBase 状态
```bash
# 在 WSL 中检查进程
ps aux | grep pocketbase

# 检查端口
netstat -tulpn | grep 8090

# 检查服务
curl -s http://127.0.0.1:8090/api/health
```

### 常见问题

1. **权限问题**：确保 `pocketbase` 文件有执行权限
2. **端口占用**：检查 8090 端口是否被其他程序占用
3. **网络问题**：WSL 网络配置可能阻止连接

## 🎉 完成标志

当您看到以下输出时，说明设置成功：
- ✅ PocketBase 服务启动
- ✅ 健康检查通过
- ✅ 管理后台可访问

选择适合您环境的方案，开始使用 PocketBase v0.36.7！
