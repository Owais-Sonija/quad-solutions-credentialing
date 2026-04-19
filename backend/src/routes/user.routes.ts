import { Router } from 'express';
import { verifyToken } from '../middleware/auth.middleware';
import { upload } from '../middleware/upload.middleware';
import { submitRequest, getMyRequests, getRequestById } from '../controllers/request.controller';
import { uploadDocument, getDocuments } from '../controllers/document.controller';
import { getProfile, updateProfile, changePassword } from '../controllers/auth.controller';
import rateLimit from 'express-rate-limit';

const router = Router();

// All routes protected with verifyToken middleware
router.use(verifyToken);

// Requests
router.post('/requests', submitRequest);
router.get('/requests', getMyRequests);
router.get('/requests/:id', getRequestById);

const uploadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { 
    message: 'Upload limit reached. Maximum 20 uploads per hour.' 
  }
})

// Documents
router.post(
  '/requests/:id/documents', 
  uploadLimiter,
  upload.array('file', 2), 
  uploadDocument
)
router.get('/requests/:id/documents', getDocuments);

// Profile
router.get('/profile', getProfile);
router.patch('/profile', updateProfile);
router.patch('/profile/change-password', changePassword);

export default router;
