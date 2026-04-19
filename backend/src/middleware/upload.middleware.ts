import multer from 'multer';
import path from 'path';
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

  const nameWithoutExt = path.basename(file.originalname, ext);
  if (nameWithoutExt.includes('.')) {
    cb(new Error('Invalid filename - double extensions not allowed'));
    return;
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
    cb(null, 'uploads/');
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
