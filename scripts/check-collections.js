#!/usr/bin/env node

// 检查 PocketBase 集合名称

const PocketBase = require('pocketbase');

async function checkCollections() {
  try {
    const pb = new PocketBase('http://127.0.0.1:8090');
    
    console.log('🔍 检查 PocketBase 集合...\n');
    
    // 尝试获取所有集合
    try {
      const collections = await pb.send('/api/collections');
      console.log('📋 现有集合:');
      collections.forEach(collection => {
        console.log(`  - ${collection.name} (id: ${collection.id})`);
      });
    } catch (error) {
      console.log('❌ 无法获取集合列表:', error.message);
    }
    
    // 测试不同的用户集合名称
    const possibleNames = ['users', '_pb_users_auth_', 'users_auth'];
    
    console.log('\n🧪 测试用户集合名称:');
    for (const name of possibleNames) {
      try {
        await pb.send(`/api/collections/${name}`);
        console.log(`  ✅ ${name} - 存在`);
      } catch (error) {
        console.log(`  ❌ ${name} - 不存在`);
      }
    }
    
    // 尝试创建测试用户
    console.log('\n👤 测试用户创建:');
    for (const name of possibleNames) {
      try {
        const testData = {
          email: `test-${Date.now()}@example.com`,
          password: 'test123456',
          passwordConfirm: 'test123456'
        };
        
        await pb.send(`/api/collections/${name}/records`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(testData)
        });
        console.log(`  ✅ ${name} - 可以创建用户`);
        break;
      } catch (error) {
        console.log(`  ❌ ${name} - 无法创建用户: ${error.message}`);
      }
    }
    
  } catch (error) {
    console.log('❌ 连接失败:', error.message);
    console.log('💡 请确保 PocketBase 正在运行: pocketbase serve --http=0.0.0.0:8090');
  }
}

checkCollections();
