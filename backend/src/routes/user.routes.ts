import { Router } from 'express';
import { verifyToken } from '../middleware/auth.middleware';
import { upload } from '../middleware/upload.middleware';
import { submitRequest, getMyRequests, getRequestById } from '../controllers/request.controller';
import { uploadDocument, getDocuments } from '../controllers/document.controller';
import { getProfile, updateProfile, changePassword } from '../controllers/auth.controller';

const router = Router();

// All routes protected with verifyToken middleware
router.use(verifyToken);

// Requests
router.post('/requests', submitRequest);
router.get('/requests', getMyRequests);
router.get('/requests/:id', getRequestById);

// Documents
router.post('/requests/:id/documents', upload.single('file'), uploadDocument);
router.get('/requests/:id/documents', getDocuments);

// Profile
router.get('/profile', getProfile);
router.patch('/profile', updateProfile);
router.patch('/profile/change-password', changePassword);

export default router;
