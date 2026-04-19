import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { Request } from 'express';

const ALLOWED_MIME_TYPES = [
  'application/pdf',
  'image/jpeg', 
  'image/png'
];

const ALLOWED_EXTENSIONS = ['.pdf', '.jpg', '.jpeg', '.png'];

const MAX_FILE_SIZE = 1 * 1024 * 1024;  // 1MB

const fileFilter = (
  req: any, 
  file: any, 
  cb: any
) => {
  if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
    cb(new Error('Only PDF, JPG and PNG files are allowed'));
    return;
  }

  const ext = path.extname(file.originalname).toLowerCase();
  if (!ALLOWED_EXTENSIONS.includes(ext)) {
    cb(new Error('Invalid file extension'));
    return;
  }

  // Check for actual double extensions like file.pdf.exe
  const parts = file.originalname.split('.')
  if (parts.length > 2) {
    // More than one dot - check if second-to-last is also 
    // a known extension
    const secondExt = '.' + parts[parts.length - 2].toLowerCase()
    const dangerousExts = [
      '.exe', '.php', '.js', '.sh', '.bat', '.cmd', 
      '.ps1', '.py', '.rb', '.pl'
    ]
    if (dangerousExts.includes(secondExt)) {
      cb(new Error('Invalid filename - suspicious file extension'))
      return
    }
  }

  const maliciousPattern = /[<>:"/\\|?*\x00-\x1f]/g;
  if (maliciousPattern.test(file.originalname)) {
    cb(new Error('Filename contains invalid characters'));
    return;
  }

  cb(null, true);
};

const storage = multer.diskStorage({
  destination: (req: any, file: any, cb: any) => {
    const uploadsDir = path.join(__dirname, '..', '..', 'uploads')
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true })
    }
    cb(null, uploadsDir)
  },
  filename: (req: any, file: any, cb: any) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const safeName = path.basename(file.originalname, ext)
      .replace(/[^a-zA-Z0-9\-_\s]/g, '')
      .replace(/\s+/g, '-')
      .substring(0, 50);
    const uniqueName = `${Date.now()}-${safeName}${ext}`;
    cb(null, uniqueName);
  }
});

export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: MAX_FILE_SIZE,
    files: 2  // max 2 files per upload request
  }
});
