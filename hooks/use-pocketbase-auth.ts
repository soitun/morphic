'use client'

import { useRouter } from 'next/navigation'
import { useCallback, useEffect } from 'react'

import { clearAuthCookie, createPocketBaseClient, saveAuthCookie } from '@/lib/pocketbase/client'

export function usePocketBaseAuth() {
  const router = useRouter()

  useEffect(() => {
    // 在客户端初始化时从 cookie 恢复认证状态
    createPocketBaseClient()
  }, [])

  const login = useCallback(async (email: string, password: string) => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      })

      const data = await response.json()

      if (data.success) {
        saveAuthCookie(data.token)
        router.refresh()
        return { success: true, user: data.user }
      } else {
        return { success: false, error: data.error }
      }
    } catch (error) {
      console.error('Login error:', error)
      return { success: false, error: 'Network error' }
    }
  }, [])

  const signup = useCallback(async (email: string, password: string, name?: string) => {
    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password, name }),
      })

      const data = await response.json()

      if (data.success) {
        saveAuthCookie(data.token)
        router.refresh()
        return { success: true, user: data.user }
      } else {
        return { success: false, error: data.error }
      }
    } catch (error) {
      console.error('Signup error:', error)
      return { success: false, error: 'Network error' }
    }
  }, [])

  const logout = useCallback(async () => {
    try {
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const data = await response.json()

      if (data.success) {
        clearAuthCookie()
        router.push('/')
        router.refresh()
        return { success: true }
      } else {
        return { success: false, error: data.error }
      }
    } catch (error) {
      console.error('Logout error:', error)
      return { success: false, error: 'Network error' }
    }
  }, [])

  return {
    login,
    signup,
    logout
  }
}
