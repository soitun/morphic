import { NextRequest, NextResponse } from 'next/server'

import { getCurrentUserId } from '@/lib/auth/pocketbase-auth'
import { uploadFileToPocketBase } from '@/lib/storage/pocketbase-client'

export async function POST(req: NextRequest) {
  try {
    const userId = await getCurrentUserId()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const contentType = req.headers.get('content-type') || ''
    if (!contentType.includes('multipart/form-data')) {
      return NextResponse.json(
        { error: 'Invalid content type' },
        { status: 400 }
      )
    }

    const formData = await req.formData()
    const file = formData.get('file') as File
    const chatId = formData.get('chatId') as string
    
    if (!file) {
      return NextResponse.json({ error: 'File is required' }, { status: 400 })
    }

    const result = await uploadFileToPocketBase(file, userId, chatId)
    return NextResponse.json({ success: true, file: result }, { status: 200 })
  } catch (err: any) {
    console.error('Upload Error:', err)
    return NextResponse.json(
      { error: 'Upload failed', message: err.message },
      { status: 500 }
    )
  }
}
