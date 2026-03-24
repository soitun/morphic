import { signOut } from '@/lib/auth/pocketbase-auth'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    await signOut()
    
    // 清除服务器端认证 cookie
    const cookieStore = await cookies()
    cookieStore.delete('pb_auth')

    // 同时清除客户端 cookie
    const response = NextResponse.json({
      success: true,
      message: 'Logged out successfully'
    })

    response.cookies.set('pb_auth_client', '', {
      sameSite: 'lax',
      maxAge: 0,
      path: '/'
    })

    return response
  } catch (error) {
    console.error('Logout error:', error)
    return NextResponse.json(
      { error: 'Failed to logout' },
      { status: 500 }
    )
  }
}
