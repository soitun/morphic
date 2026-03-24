#!/bin/bash

# PocketBase 启动脚本 - 兼容 v0.36.7

echo "🚀 启动 PocketBase 服务器..."

# 检查 PocketBase 是否已安装
if ! command -v pocketbase &> /dev/null; then
    echo "📦 下载 PocketBase v0.36.7..."
    
    # 下载 PocketBase v0.36.7
    if [[ "$OSTYPE" == "linux-gnu"* ]]; then
        wget https://github.com/pocketbase/pocketbase/releases/download/v0.36.7/pocketbase_0.36.7_linux_amd64.zip
        unzip pocketbase_0.36.7_linux_amd64.zip
    elif [[ "$OSTYPE" == "darwin"* ]]; then
        wget https://github.com/pocketbase/pocketbase/releases/download/v0.36.7/pocketbase_0.36.7_darwin_amd64.zip
        unzip pocketbase_0.36.7_darwin_amd64.zip
    elif [[ "$OSTYPE" == "msys" ]] || [[ "$OSTYPE" == "win32" ]]; then
        wget https://github.com/pocketbase/pocketbase/releases/download/v0.36.7/pocketbase_0.36.7_windows_amd64.zip
        unzip pocketbase_0.36.7_windows_amd64.zip
    fi
    
    chmod +x pocketbase
    rm pocketbase_*.zip
fi

# 创建数据目录
mkdir -p pocketbase_data
mkdir -p pocketbase-hooks
mkdir -p pocketbase/migrations

# 运行迁移
echo "🗄️ 运行数据库迁移..."
./pocketbase migrate --dir pocketbase/migrations

# 启动 PocketBase
echo "🌟 启动 PocketBase 服务器..."
./pocketbase serve --http=0.0.0.0:8090 --dir=pocketbase_data
