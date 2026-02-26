import express from 'express';
import * as vendorController from '../controllers/vendorController.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

router.post('/', authenticate, authorize(['VENDOR']), vendorController.createVendor);
router.get('/profile/:vendorId', vendorController.getVendorProfile);
router.put('/status', authenticate, authorize(['VENDOR']), vendorController.updateVendorStatus);
router.put('/location', authenticate, authorize(['VENDOR']), vendorController.updateVendorLocation);
router.get('/active', vendorController.getActiveVendors);
router.get('/category/:category', vendorController.getVendorsByCategory);

export default router;
