import { Router } from 'express';
import { verifyToken } from '../middleware/auth.middleware';
import { upload } from '../middleware/upload.middleware';
import { submitRequest, getMyRequests, getRequestById } from '../controllers/request.controller';
import { uploadDocument, getDocuments } from '../controllers/document.controller';

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

export default router;
