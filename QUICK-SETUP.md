# 🚀 PocketBase 快速设置指南

## 🎯 推荐方案：Docker 部署

### 步骤 1：停止当前 PocketBase
```bash
# 停止当前运行的 PocketBase
pkill -f pocketbase
```

### 步骤 2：使用 Docker 启动
```bash
# 启动完整环境
docker compose -f docker-compose.pocketbase.yaml up -d
```

### 步骤 3：等待服务启动
等待 10-15 秒让服务完全启动。

### 步骤 4：访问管理后台
打开浏览器访问：http://localhost:8090/_/

### 步骤 5：设置管理员账户
- 邮箱：`admin@example.com`
- 密码：`admin123456`

### 步骤 6：手动创建 uploads 集合

1. 在左侧导航点击 **"Collections"**
2. 点击 **"New collection"**
3. 填写：
   - **Name**: `uploads`
   - **Type**: `base`
4. 点击 **"Create"**

### 步骤 7：添加字段

在 uploads 集合中添加以下字段：

#### 1. user 字段
- **Name**: `user`
- **Type**: `relation`
- **Required**: ✅
- **Options**:
  - Collection: `_pb_users_auth_`
  - Max select: `1`

#### 2. chatId 字段
- **Name**: `chatId`
- **Type**: `text`
- **Required**: ✅

#### 3. file 字段
- **Name**: `file`
- **Type**: `file`
- **Required**: ✅
- **Options**:
  - Max select: `1`
  - Max size: `5242880`
  - Allowed types: `image/jpeg,image/png,application/pdf,text/plain`

#### 4. originalName 字段
- **Name**: `originalName`
- **Type**: `text`
- **Required**: ✅

#### 5. mediaType 字段
- **Name**: `mediaType`
- **Type**: `text`
- **Required**: ✅

#### 6. size 字段
- **Name**: `size`
- **Type**: `number`
- **Required**: ✅

#### 7. created 字段
- **Name**: `created`
- **Type**: `autodate`
- **Required**: ✅

#### 8. updated 字段
- **Name**: `updated`
- **Type**: `autodate`
- **Required**: ✅

### 步骤 8：扩展 users 集合

1. 点击 `_pb_users_auth_` 集合
2. 点击 **"Schema"** 标签
3. 点击 **"Add field"** 添加：

#### name 字段
- **Name**: `name`
- **Type**: `text`
- **Required**: ❌

#### avatar 字段
- **Name**: `avatar`
- **Type**: `file`
- **Required**: ❌
- **Options**:
  - Max select: `1`
  - Max size: `1048576`
  - Allowed types: `image/jpeg,image/png`

#### preferences 字段
- **Name**: `preferences`
- **Type**: `json`
- **Required**: ❌

### 步骤 9：验证设置

1. **检查集合列表**：应该看到 `uploads` 集合
2. **检查字段**：所有字段都正确配置
3. **测试创建**：尝试创建一条测试记录

### 步骤 10：启动 Morphic

```bash
# 启动 Morphic 应用
bun dev
```

访问：http://localhost:3000

## 🎉 完成！

现在您的 PocketBase 集成应该完全工作了：

- ✅ 认证系统就绪
- ✅ 文件上传就绪
- ✅ 数据库结构正确
- ✅ 管理后台可用

## 📞 如果遇到问题

1. **Docker 问题**：确保 Docker 已安装并运行
2. **端口冲突**：检查 8090 和 3000 端口是否被占用
3. **权限问题**：确保 Docker 有足够权限

## 🔄 其他方案

如果 Docker 不可用，可以：

1. **手动迁移**：使用 Web UI 手动创建
2. **诊断脚本**：运行 `node scripts/diagnose-migration.js`
3. **强制重置**：运行 `./scripts/force-migration.sh`

选择最适合您环境的方案！🚀
