import express from 'express';
import {
  createProduct,
  deleteProduct,
  getProductById,
  getProducts,
  updateProduct,
} from '../controllers/productController.js';
import asyncHandler from '../middleware/asyncHandler.js';
import { authorizeAdmin, protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

// Todos pueden ver productos
router.get('/',    asyncHandler(getProducts));
router.get('/:id', asyncHandler(getProductById));

// Solo admin puede crear, editar, eliminar
router.post('/',       authorizeAdmin, asyncHandler(createProduct));
router.put('/:id',     authorizeAdmin, asyncHandler(updateProduct));
router.delete('/:id',  authorizeAdmin, asyncHandler(deleteProduct));

export default router;
