import express from 'express';
import {
  createProduct,
  deleteProduct,
  getProductById,
  getProducts,
  updateProduct,
} from '../controllers/productController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.route('/').post(createProduct).get(getProducts);
router.route('/:id').get(getProductById).put(updateProduct).delete(deleteProduct);

export default router;
