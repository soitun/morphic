import { createPocketBaseClient } from '@/lib/pocketbase/client'
import { perfLog } from '@/lib/utils/perf-logging'
import { incrementAuthCallCount } from '@/lib/utils/perf-tracking'
import { cookies } from 'next/headers'

// 兼容 Supabase User 接口的 PocketBase 用户类型
export interface PocketBaseUser {
  id: string
  email: string
  name?: string
  avatar?: string
  created: string
  updated: string
  verified: boolean
  // Supabase 兼容字段
  app_metadata?: Record<string, any>
  user_metadata?: Record<string, any>
  aud?: string
  created_at?: string
}

export async function getCurrentUser(): Promise<PocketBaseUser | null> {
  const pocketbaseUrl = process.env.POCKETBASE_URL

  if (!pocketbaseUrl) {
    return null // PocketBase is not configured
  }

  try {
    const pb = await createPocketBaseClient()
    
    // 在服务器端从 cookies 获取认证信息
    const cookieStore = await cookies()
    const authCookie = cookieStore.get('pb_auth')
    
    if (authCookie?.value) {
      // 如果有认证 cookie，尝试恢复认证状态
      try {
        pb.authStore.loadFromCookie(authCookie.value)
        
        if (pb.authStore.isValid && pb.authStore.model) {
          const model = pb.authStore.model as any
          return {
            id: model.id,
            email: model.email,
            name: model.name,
            avatar: model.avatar,
            created: model.created,
            updated: model.updated,
            verified: model.verified,
            // Supabase 兼容字段
            app_metadata: model.preferences || {},
            user_metadata: { 
              name: model.name,
              avatar_url: model.avatar 
            },
            aud: 'authenticated',
            created_at: model.created
          }
        }
      } catch (cookieError) {
        console.warn('Failed to restore auth from cookie:', cookieError)
      }
    }
    
    return null
  } catch (error) {
    console.error('Failed to get current user:', error)
    return null
  }
}

export async function getCurrentUserId(): Promise<string> {
  const count = incrementAuthCallCount()
  perfLog(`getCurrentUserId called - count: ${count}`)

  // Skip authentication mode (for personal Docker deployments)
  if (process.env.ENABLE_AUTH === 'false') {
    // Guard: Prevent disabling auth in Morphic Cloud deployments
    if (process.env.MORPHIC_CLOUD_DEPLOYMENT === 'true') {
      throw new Error(
        'ENABLE_AUTH=false is not allowed in MORPHIC_CLOUD_DEPLOYMENT'
      )
    }

    // Always warn when authentication is disabled (except in tests)
    if (process.env.NODE_ENV !== 'test') {
      console.warn(
        '⚠️  Authentication disabled. Running in anonymous mode.\n' +
          '   All users share the same user ID. For personal use only.'
      )
    }

    return process.env.ANONYMOUS_USER_ID || 'anonymous-user'
  }

  const user = await getCurrentUser()
  return user?.id || process.env.ANONYMOUS_USER_ID || 'anonymous-user'
}

// 客户端认证函数
export async function signInWithEmail(email: string, password: string) {
  const pb = await createPocketBaseClient()
  
  try {
    const authData = await pb.collection('users').authWithPassword(email, password)
    return authData
  } catch (error) {
    throw new Error('Invalid credentials')
  }
}

export async function signUpWithEmail(email: string, password: string, name?: string) {
  const pb = await createPocketBaseClient()
  
  try {
    const userData = {
      email,
      password,
      passwordConfirm: password,
      name: name || email.split('@')[0]
    }
    
    const record = await pb.collection('users').create(userData)
    
    // 自动登录
    const authData = await pb.collection('users').authWithPassword(email, password)
    return authData
  } catch (error) {
    throw new Error('Failed to create account')
  }
}

export async function signOut() {
  const pb = await createPocketBaseClient()
  pb.authStore.clear()
}

export async function isAuthenticated() {
  const pb = await createPocketBaseClient()
  return pb.authStore.isValid
}
