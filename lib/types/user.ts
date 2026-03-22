// 通用用户接口，兼容 Supabase 和 PocketBase
export interface User {
  id: string
  email?: string
  name?: string
  avatar?: string
  created?: string
  updated?: string
  verified?: boolean
  // Supabase 兼容字段
  app_metadata?: Record<string, any>
  user_metadata?: Record<string, any>
  aud?: string
  created_at?: string
}

// 从 Supabase User 转换为通用 User
export function fromSupabaseUser(supabaseUser: any): User | null {
  if (!supabaseUser) return null
  
  return {
    id: supabaseUser.id,
    email: supabaseUser.email,
    app_metadata: supabaseUser.app_metadata,
    user_metadata: supabaseUser.user_metadata,
    aud: supabaseUser.aud,
    created_at: supabaseUser.created_at
  }
}

// 从 PocketBase User 转换为通用 User
export function fromPocketBaseUser(pocketbaseUser: any): User | null {
  if (!pocketbaseUser) return null
  
  return {
    id: pocketbaseUser.id,
    email: pocketbaseUser.email,
    name: pocketbaseUser.name,
    avatar: pocketbaseUser.avatar,
    created: pocketbaseUser.created,
    updated: pocketbaseUser.updated,
    verified: pocketbaseUser.verified,
    // 提供默认的 Supabase 兼容字段
    app_metadata: {},
    user_metadata: { name: pocketbaseUser.name },
    aud: 'authenticated',
    created_at: pocketbaseUser.created
  }
}
