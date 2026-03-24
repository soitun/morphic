#!/usr/bin/env node

// PocketBase 迁移验证脚本

const PocketBase = require('pocketbase');

async function verifyMigration() {
  try {
    const pb = new PocketBase('http://localhost:8090');
    
    console.log('🔍 验证 PocketBase 迁移状态...\n');
    
    // 检查 uploads 集合
    try {
      const uploads = await pb.collection('uploads').getFirstListItem('', { perPage: 1 });
      console.log('✅ uploads 集合存在');
    } catch (error) {
      if (error.status === 404) {
        console.log('❌ uploads 集合不存在');
      } else {
        console.log('✅ uploads 集合存在（但可能为空）');
      }
    }
    
    // 检查 users 集合的自定义字段
    try {
      const users = await pb.collection('users').getFirstListItem('', { perPage: 1 });
      console.log('✅ users 集合存在');
      
      // 检查自定义字段
      const userFields = ['name', 'avatar', 'preferences'];
      for (const field of userFields) {
        if (users[field] !== undefined) {
          console.log(`  ✅ ${field} 字段存在`);
        } else {
          console.log(`  ❌ ${field} 字段不存在`);
        }
      }
    } catch (error) {
      if (error.status === 404) {
        console.log('❌ users 集合不存在');
      } else {
        console.log('✅ users 集合存在（但可能为空）');
      }
    }
    
    // 获取所有集合列表
    const collections = await pb.send('/api/collections');
    console.log('\n📋 所有集合：');
    collections.items.forEach(collection => {
      console.log(`  - ${collection.name} (${collection.type})`);
    });
    
    console.log('\n🎉 验证完成！');
    
  } catch (error) {
    console.error('❌ 验证失败:', error);
    console.log('\n💡 请确保 PocketBase 服务正在运行：');
    console.log('   ./pocketbase serve --http=0.0.0.0:8090 --dir=pocketbase_data');
  }
}

verifyMigration();
