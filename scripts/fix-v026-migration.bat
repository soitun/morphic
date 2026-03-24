@echo off
echo 🔧 修复 PocketBase v0.26.8 迁移...

echo ⏹️ 停止现有服务...
taskkill /f /im pocketbase.exe >nul 2>&1
timeout /t 2 >nul

echo 🗑️ 清理数据库文件...
if exist "pocketbase_data\data.db" del "pocketbase_data\data.db"
if exist "pocketbase_data\auxiliary.db" del "pocketbase_data\auxiliary.db"

echo 📋 使用修复后的迁移文件...
copy "pocketbase\migrations\001_create_collections_v0.26.js" "pocketbase\migrations\001_create_collections.js" /Y

echo 🗄️ 运行迁移...
cd pocketbase_data
..\pocketbase.exe migrate --dir ..\pocketbase\migrations
cd ..

if %errorlevel% equ 0 (
    echo ✅ 迁移成功完成
) else (
    echo ❌ 迁移失败
    pause
    exit /b 1
)

echo 🌟 启动 PocketBase 服务...
pocketbase.exe serve --http=0.0.0.0:8090 --dir=pocketbase_data

pause
