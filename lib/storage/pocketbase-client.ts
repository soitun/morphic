import { createPocketBaseClient } from '@/lib/pocketbase/client'

export interface PocketBaseFileResult {
  filename: string
  url: string
  mediaType: string
  type: 'file'
  id: string
  size: number
}

const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'application/pdf', 'text/plain']

export async function uploadFileToPocketBase(
  file: File, 
  userId: string, 
  chatId: string
): Promise<PocketBaseFileResult> {
  const pb = await createPocketBaseClient()

  // 验证文件
  if (file.size > MAX_FILE_SIZE) {
    throw new Error('File too large (max 5MB)')
  }

  if (!ALLOWED_TYPES.includes(file.type)) {
    throw new Error('Unsupported file type')
  }

  try {
    // 创建上传记录
    const formData = new FormData()
    formData.append('user', userId)
    formData.append('chatId', chatId)
    formData.append('file', file)
    formData.append('originalName', file.name)
    formData.append('mediaType', file.type)
    formData.append('size', file.size.toString())

    const record = await pb.collection('uploads').create(formData)
    
    const pocketbaseUrl = process.env.POCKETBASE_URL || ''
    const fileUrl = `${pocketbaseUrl}/api/files/uploads/${record.id}/${record.file}`

    return {
      filename: file.name,
      url: fileUrl,
      mediaType: file.type,
      type: 'file',
      id: record.id,
      size: file.size
    }
  } catch (error: any) {
    throw new Error('Upload failed: ' + error.message)
  }
}

export async function deleteFileFromPocketBase(fileId: string) {
  const pb = await createPocketBaseClient()
  
  try {
    await pb.collection('uploads').delete(fileId)
  } catch (error: any) {
    throw new Error('Failed to delete file: ' + error.message)
  }
}

export async function getUserFiles(userId: string, chatId?: string) {
  const pb = await createPocketBaseClient()
  
  try {
    let filter = `user = "${userId}"`
    if (chatId) {
      filter += ` && chatId = "${chatId}"`
    }
    
    const records = await pb.collection('uploads').getFullList({
      filter,
      sort: '-created'
    })
    
    const pocketbaseUrl = process.env.POCKETBASE_URL || ''
    
    return records.map(record => ({
      id: record.id,
      filename: record.originalName,
      url: `${pocketbaseUrl}/api/files/uploads/${record.id}/${record.file}`,
      mediaType: record.mediaType,
      type: 'file',
      size: record.size,
      created: record.created
    }))
  } catch (error: any) {
    throw new Error('Failed to fetch files: ' + error.message)
  }
}
