# PocketBase 集成测试指南

本文档说明如何测试 PocketBase v0.36.7 集成是否正常工作。

## 🚀 快速测试

### 1. 启动服务

```bash
# 使用 Docker Compose 启动
docker compose -f docker-compose.pocketbase.yaml up -d

# 或者手动启动
./scripts/start-pocketbase.sh
bun dev
```

### 2. 访问管理后台

打开浏览器访问：`http://localhost:8090/_/`

首次访问时设置管理员账户：
- 邮箱：`admin@example.com`
- 密码：`admin123456`

### 3. 测试用户注册

```bash
# 使用 curl 测试注册
curl -X POST http://localhost:3000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "test123456",
    "name": "Test User"
  }'
```

### 4. 测试用户登录

```bash
# 使用 curl 测试登录
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "test123456"
  }'

# 检查响应的 cookies
curl -i -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "test123456"
  }'
```

### 5. 测试文件上传

```bash
# 创建测试文件
echo "Hello PocketBase" > test.txt

# 上传文件（需要先登录获取 token）
curl -X POST http://localhost:3000/api/upload \
  -H "Content-Type: multipart/form-data" \
  -F "file=@test.txt" \
  -F "chatId=test-chat-123"
```

## 🔍 功能验证

### 认证系统测试

1. **用户注册**
   - ✅ 创建新用户
   - ✅ 验证邮箱唯一性
   - ✅ 自动登录
   - ✅ 设置认证 cookie

2. **用户登录**
   - ✅ 验证凭据
   - ✅ 返回用户信息
   - ✅ 设置持久化会话

3. **用户登出**
   - ✅ 清除认证状态
   - ✅ 清除 cookies
   - ✅ 重定向到首页

### 文件上传测试

1. **文件验证**
   - ✅ 检查文件类型
   - ✅ 检查文件大小限制
   - ✅ 验证用户权限

2. **存储功能**
   - ✅ 文件保存到 PocketBase
   - ✅ 生成访问 URL
   - ✅ 关联用户和聊天

## 🐛 故障排除

### 常见问题

#### 1. 认证失败
```bash
# 检查 PocketBase 服务状态
curl http://localhost:8090/api/health

# 检查用户集合
curl http://localhost:8090/api/collections
```

#### 2. Cookie 问题
```javascript
// 在浏览器控制台检查
console.log(document.cookie)

// 检查 PocketBase 客户端状态
const pb = new PocketBase('http://localhost:8090')
console.log('Auth valid:', pb.authStore.isValid)
console.log('Auth token:', pb.authStore.token)
```

#### 3. 文件上传失败
- 检查文件大小是否超过 5MB
- 确认用户已登录
- 验证文件类型是否受支持

## 📊 测试清单

### 基础功能测试

- [ ] 用户注册成功
- [ ] 用户登录成功
- [ ] 用户登出成功
- [ ] 认证状态持久化
- [ ] 页面刷新后保持登录
- [ ] 错误凭据处理
- [ ] 重复邮箱注册处理

### 文件上传测试

- [ ] 图片文件上传（JPEG/PNG）
- [ ] 文档文件上传（PDF/TXT）
- [ ] 文件大小限制验证
- [ ] 文件类型验证
- [ ] 上传权限检查
- [ ] 文件访问 URL 生成

### 集成测试

- [ ] Morphic 应用启动正常
- [ ] PocketBase 服务连接
- [ ] 数据库迁移成功
- [ ] API 路由响应正常
- [ ] 前端组件渲染
- [ ] 用户界面交互

## 🎯 性能测试

### 响应时间测试

```bash
# 测试 API 响应时间
time curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "password": "test123456"}'
```

### 并发测试

```bash
# 使用 ab 进行压力测试
ab -n 100 -c 10 http://localhost:3000/api/auth/login
```

## 📝 测试报告

### 测试结果记录

记录每次测试的结果：

```markdown
## 测试日期：2024-03-23

### 认证测试
- 注册接口：✅ 通过
- 登录接口：✅ 通过  
- 登出接口：✅ 通过
- Cookie 持久化：✅ 通过

### 文件上传测试
- 图片上传：✅ 通过
- 文档上传：✅ 通过
- 大小限制：✅ 通过

### 性能指标
- 平均响应时间：< 200ms
- 并发处理：正常
- 错误率：< 1%

### 发现的问题
1. 问题：描述
   解决方案：方案
2. 问题：描述
   解决方案：方案
```

## 🎉 测试完成

当所有测试项目都完成后，您的 PocketBase 集成就准备好了生产使用！

## 📞 获取帮助

如果在测试过程中遇到问题：

1. **查看日志**
   ```bash
   docker compose -f docker-compose.pocketbase.yaml logs pocketbase
   docker compose -f docker-compose.pocketbase.yaml logs morphic
   ```

2. **检查配置**
   ```bash
   # 验证环境变量
   grep -r "POCKETBASE" .env.local
   ```

3. **重置环境**
   ```bash
   # 清理数据
   docker compose -f docker-compose.pocketbase.yaml down -v
   
   # 重新启动
   docker compose -f docker-compose.pocketbase.yaml up -d
   ```

4. **社区支持**
   - [PocketBase 官方文档](https://pocketbase.io/docs/)
   - [Morphic 项目 Issues](https://github.com/miurla/morphic/issues)
   - [PocketBase Discord](https://pocketbase.io/discord)
