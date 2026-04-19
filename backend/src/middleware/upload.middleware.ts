import multer from 'multer'
import { CloudinaryStorage } from 'multer-storage-cloudinary'
import cloudinary from '../config/cloudinary'
import path from 'path'

const ALLOWED_MIME_TYPES = [
  'application/pdf',
  'image/jpeg',
  'image/png'
]

const ALLOWED_EXTENSIONS = ['.pdf', '.jpg', '.jpeg', '.png']
const MAX_FILE_SIZE = 1 * 1024 * 1024  // 1MB

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req: any, file: any) => {
    const ext = path.extname(file.originalname).toLowerCase()
    const resourceType = file.mimetype === 'application/pdf' 
      ? 'raw' 
      : 'image'
    return {
      folder: 'quad-solutions/documents',
      resource_type: resourceType,
      public_id: `${Date.now()}-${file.originalname
        .replace(/[^a-zA-Z0-9\-_.]/g, '-')
        .substring(0, 50)}`,
      allowed_formats: ['pdf', 'jpg', 'jpeg', 'png']
    }
  }
})

const fileFilter = (req: any, file: any, cb: any) => {
  if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
    cb(new Error('Only PDF, JPG and PNG files are allowed'))
    return
  }

  const ext = path.extname(file.originalname).toLowerCase()
  if (!ALLOWED_EXTENSIONS.includes(ext)) {
    cb(new Error('Invalid file extension'))
    return
  }

  const parts = file.originalname.split('.')
  if (parts.length > 2) {
    const secondExt = '.' + parts[parts.length - 2].toLowerCase()
    const dangerousExts = [
      '.exe', '.php', '.js', '.sh', '.bat', 
      '.cmd', '.ps1', '.py', '.rb', '.pl'
    ]
    if (dangerousExts.includes(secondExt)) {
      cb(new Error('Invalid filename - suspicious file extension'))
      return
    }
  }

  cb(null, true)
}

export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: MAX_FILE_SIZE,
    files: 2
  }
})
