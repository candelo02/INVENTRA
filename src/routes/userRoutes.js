import express from 'express';
import {
  createVendedor,
  deleteUser,
  getUsers,
  resetPassword,
} from '../controllers/userController.js';
import asyncHandler from '../middleware/asyncHandler.js';
import { onlyAdmin, protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Todas las rutas de usuarios requieren auth + ser el admin fijo
router.use(protect);
router.use(onlyAdmin);

router.route('/')
  .get(asyncHandler(getUsers))
  .post(asyncHandler(createVendedor));

router.route('/:id')
  .delete(asyncHandler(deleteUser));

router.put('/:id/reset-password', asyncHandler(resetPassword));

export default router;
