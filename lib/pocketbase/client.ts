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

export async function createPocketBaseClient(): Promise<PocketBase> {
  const pb = getPocketBase()
  
  // 在客户端环境中，尝试从 cookie 恢复认证状态
  if (typeof window !== 'undefined') {
    try {
      const authCookie = document.cookie
        .split('; ')
        .find(cookie => cookie.trim().startsWith('pb_auth='))
        ?.split('=')[1]
      
      if (authCookie) {
        pb.authStore.loadFromCookie(authCookie)
      }
    } catch (error) {
      console.warn('Failed to restore auth from cookie:', error)
    }
  }
  
  return pb
}

export function saveAuthCookie(token: string) {
  if (typeof window !== 'undefined') {
    const expires = new Date()
    expires.setTime(expires.getTime() + 30 * 24 * 60 * 60 * 1000) // 30 days
    
    document.cookie = `pb_auth=${token}; expires=${expires.toUTCString()}; path=/; samesite=lax; ${process.env.NODE_ENV === 'production' ? 'secure;' : ''}`
  }
}

export function clearAuthCookie() {
  if (typeof window !== 'undefined') {
    document.cookie = 'pb_auth=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;'
  }
}
