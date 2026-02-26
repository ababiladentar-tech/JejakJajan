import express from 'express';
import * as reviewController from '../controllers/reviewController.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

router.post('/', authenticate, authorize(['BUYER']), reviewController.createReview);
router.get('/vendor/:vendorId', reviewController.getVendorReviews);
router.put('/:reviewId', authenticate, authorize(['BUYER']), reviewController.updateReview);
router.delete('/:reviewId', authenticate, authorize(['BUYER']), reviewController.deleteReview);

export default router;
