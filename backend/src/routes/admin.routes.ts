import { Router } from 'express';
import { verifyToken, requireAdmin } from '../middleware/auth.middleware';
import { getAllRequests, getRequestDetail, updateStatus, getDashboardStats } from '../controllers/admin.controller';

const router = Router();

// Protect all routes with authentication and admin authorization
router.use(verifyToken, requireAdmin);

// Dashboard routes
router.get('/stats', getDashboardStats);

// Request management routes
router.get('/requests', getAllRequests);
router.get('/requests/:id', getRequestDetail);
router.patch('/requests/:id/status', updateStatus);

export default router;
