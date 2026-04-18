import { Router } from 'express';
import { verifyToken, requireAdmin } from '../middleware/auth.middleware';
import { getAllRequests, getRequestDetail, updateStatus, getDashboardStats, getAllDocuments, deleteDocument, getAdminProfile, updateAdminProfile, changeAdminPassword, getAllUsers, getUserDetail, getAnalytics } from '../controllers/admin.controller';

const router = Router();

// Protect all routes with authentication and admin authorization
router.use(verifyToken, requireAdmin);

// Dashboard routes
router.get('/stats', getDashboardStats);
router.get('/analytics', getAnalytics);

// User management routes
router.get('/users', getAllUsers);
router.get('/users/:id', getUserDetail);

// Request management routes
router.get('/requests', getAllRequests);
router.get('/requests/:id', getRequestDetail);
router.patch('/requests/:id/status', updateStatus);

// Document management routes
router.get('/documents', getAllDocuments);
router.delete('/documents/:id', deleteDocument);

// Profile management routes
router.get('/profile', getAdminProfile);
router.patch('/profile', updateAdminProfile);
router.patch('/profile/change-password', changeAdminPassword);

export default router;
