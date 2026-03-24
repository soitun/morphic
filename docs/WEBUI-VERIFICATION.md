# PocketBase Web UI 迁移验证指南

## 🌐 访问管理后台

### 1. 打开浏览器
访问：`http://localhost:8090/_/`

### 2. 首次登录设置
- 邮箱：`admin@example.com`
- 密码：`admin123456`
- 点击 "Create"

## 🔍 验证步骤

### 步骤 1：检查集合列表

在左侧导航栏点击 **"Collections"**

**✅ 成功标志：**
- 看到 `uploads` 集合
- 看到 `_pb_users_auth_` 集合
- 集合图标和类型正确

**❌ 失败标志：**
- 没有 `uploads` 集合
- 只看到系统默认集合

### 步骤 2：检查 uploads 集合结构

点击 `uploads` 集合，进入字段设置

**✅ 应该看到的字段：**
```
📋 uploads 集合字段详情
├── user
│   ├── Type: relation
│   ├── Required: ✓
│   ├── Options:
│   │   ├── Collection: _pb_users_auth_
│   │   ├── Max select: 1
│   │   └── Display fields: []
├── chatId
│   ├── Type: text
│   ├── Required: ✓
│   └── Options: (none)
├── file
│   ├── Type: file
│   ├── Required: ✓
│   └── Options:
│   │   ├── Max select: 1
│   │   ├── Max size: 5242880 (5MB)
│   │   └── Allowed types: image/jpeg, image/png, application/pdf, text/plain
├── originalName
│   ├── Type: text
│   ├── Required: ✓
├── mediaType
│   ├── Type: text
│   ├── Required: ✓
├── size
│   ├── Type: number
│   ├── Required: ✓
├── created
│   ├── Type: autodate
│   ├── Required: ✓
└── updated
    ├── Type: autodate
    ├── Required: ✓
```

### 步骤 3：检查 users 集合扩展

点击 `_pb_users_auth_` 集合

**✅ 应该看到的新增字段：**
```
👤 _pb_users_auth_ 集合新增字段
├── name
│   ├── Type: text
│   ├── Required: ✗
│   └── Options: (none)
├── avatar
│   ├── Type: file
│   ├── Required: ✗
│   └── Options:
│   │   ├── Max select: 1
│   │   ├── Max size: 1048576 (1MB)
│   │   └── Allowed types: image/jpeg, image/png
└── preferences
    ├── Type: json
    ├── Required: ✗
    └── Options: (none)
```

### 步骤 4：测试数据操作

#### 创建测试用户
1. 点击 `_pb_users_auth_` 集合
2. 点击 "New record" 按钮
3. 填写：
   - Email: `test@example.com`
   - Password: `test123456`
   - Name: `Test User`
4. 点击 "Create"

#### 上传测试文件
1. 点击 `uploads` 集合
2. 点击 "New record" 按钮
3. 选择刚创建的用户
4. 填写 `chatId`: `test-chat-123`
5. 上传一个测试文件（小于 5MB）
6. 填写 `originalName` 和 `mediaType`
7. 填写 `size`
8. 点击 "Create"

## 📊 验证结果判断

### ✅ 迁移成功的标志
- [ ] `uploads` 集合存在
- [ ] 所有字段配置正确
- [ ] `_pb_users_auth_` 集合包含新增字段
- [ ] 可以成功创建用户
- [ ] 可以成功上传文件
- [ ] 文件关联用户正常

### ❌ 迁移失败的标志
- [ ] `uploads` 集合不存在
- [ ] 字段类型或配置错误
- [ ] `_pb_users_auth_` 集合没有新增字段
- [ ] 创建用户时字段缺失
- [ ] 上传文件时字段缺失
- [ ] 文件关联失败

## 🛠️ 如果发现问题

### 情况 1：uploads 集合不存在
**解决方案：**
```bash
# 重新运行迁移
./pocketbase migrate --dir pocketbase/migrations
```

### 情况 2：字段配置错误
**解决方案：**
1. 在 Web UI 中手动编辑字段
2. 或者删除集合重新创建

### 情况 3：users 集合没有扩展
**解决方案：**
1. 点击 `_pb_users_auth_` 集合
2. 点击 "Schema" 标签
3. 点击 "Add field" 按钮
4. 添加缺失的字段

## 🎉 验证完成

如果所有检查都通过，说明迁移成功！现在您可以：

1. ✅ 启动 Morphic 应用
2. ✅ 测试用户注册/登录
3. ✅ 测试文件上传功能
4. ✅ 部署到生产环境

## 📞 获取帮助

如果 Web UI 验证遇到问题：

1. **检查服务状态**：确保 PocketBase 正在运行
2. **查看日志**：检查控制台错误信息
3. **重启服务**：重启 PocketBase 重新加载
4. **完全重置**：使用重置脚本重新开始

Web UI 是最直观的验证方式，通过它您可以清楚地看到数据库的实际状态！
