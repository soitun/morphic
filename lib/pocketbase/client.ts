import PocketBase from 'pocketbase'

let _pb: PocketBase | null = null

export function getPocketBase(): PocketBase {
  if (_pb) {
    return _pb
  }

  const url = process.env.POCKETBASE_URL
  if (!url) {
    throw new Error('POCKETBASE_URL environment variable is not set')
  }

  _pb = new PocketBase(url)
  
  // 禁用自动取消（用于服务器端渲染）
  _pb.autoCancellation(false)
  
  return _pb
}

export async function createPocketBaseClient() {
  const pb = getPocketBase()
  
  // 在服务器端，我们不需要认证状态
  // 客户端认证将通过 cookies 或 headers 处理
  return pb
}
