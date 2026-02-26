import express from 'express';
import * as adminController from '../controllers/adminController.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

// Dashboard & Analytics
router.get('/dashboard', authenticate, authorize(['ADMIN']), adminController.getDashboard);
router.get('/analytics', authenticate, authorize(['ADMIN']), adminController.getAnalytics);
router.get('/heatmap', authenticate, authorize(['ADMIN']), adminController.getHeatmap);

// User Management
router.get('/users', authenticate, authorize(['ADMIN']), adminController.getAllUsers);
router.put('/users/:userId/suspend', authenticate, authorize(['ADMIN']), adminController.suspendUser);
router.put('/users/:userId/unsuspend', authenticate, authorize(['ADMIN']), adminController.unsuspendUser);

// Vendor Management
router.put('/vendors/:vendorId/verify', authenticate, authorize(['ADMIN']), adminController.verifyVendor);
router.put('/vendors/:vendorId/suspend', authenticate, authorize(['ADMIN']), adminController.suspendVendor);
router.put('/vendors/:vendorId/unsuspend', authenticate, authorize(['ADMIN']), adminController.unsuspendVendor);

export default router;
