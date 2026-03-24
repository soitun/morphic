import { signInWithEmail } from '@/lib/auth/pocketbase-auth'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json()

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      )
    }

    const authData = await signInWithEmail(email, password)
    
    // 设置认证 cookie
    const cookieStore = await cookies()
    cookieStore.set('pb_auth', authData.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30, // 30 days
      path: '/'
    })

    // 同时设置客户端可访问的 cookie
    const response = NextResponse.json({
      success: true,
      user: {
        id: authData.record.id,
        email: authData.record.email,
        name: authData.record.name
      }
    })

    // 为客户端设置额外的 cookie
    response.cookies.set('pb_auth_client', authData.token, {
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30,
      path: '/'
    })

    return response
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { error: 'Invalid credentials' },
      { status: 401 }
    )
  }
}
