import express from 'express';
import {
  createProduct,
  deleteProduct,
  getProductById,
  getProducts,
  updateProduct,
} from '../controllers/productController.js';
import asyncHandler from '../middleware/asyncHandler.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.route('/')
  .post(asyncHandler(createProduct))
  .get(asyncHandler(getProducts));

router.route('/:id')
  .get(asyncHandler(getProductById))
  .put(asyncHandler(updateProduct))
  .delete(asyncHandler(deleteProduct));

export default router;
