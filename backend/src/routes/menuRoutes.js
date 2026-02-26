import express from 'express';
import * as menuController from '../controllers/menuController.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';

const router = express.Router();

router.post('/', authenticate, authorize(['VENDOR']), upload.single('image'), menuController.createMenu);
router.put('/:menuId', authenticate, authorize(['VENDOR']), upload.single('image'), menuController.updateMenu);
router.delete('/:menuId', authenticate, authorize(['VENDOR']), menuController.deleteMenu);
router.get('/vendor/:vendorId', menuController.getVendorMenus);

export default router;
