import express from 'express';
import * as orderController from '../controllers/orderController.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

router.post('/', authenticate, authorize(['BUYER']), orderController.createOrder);
router.get('/:orderId', authenticate, orderController.getOrder);
router.put('/:orderId/status', authenticate, authorize(['VENDOR']), orderController.updateOrderStatus);
router.get('/buyer/list', authenticate, authorize(['BUYER']), orderController.getBuyerOrders);
router.get('/vendor/list', authenticate, authorize(['VENDOR']), orderController.getVendorOrders);

export default router;
