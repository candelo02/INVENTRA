import express from 'express';
import {
  createVendedor,
  deleteUser,
  getUsers,
  resetPassword,
} from '../controllers/userController.js';
import asyncHandler from '../middleware/asyncHandler.js';
import { authorizeAdmin, protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);
router.use(authorizeAdmin);

router.route('/')
  .get(asyncHandler(getUsers))
  .post(asyncHandler(createVendedor));

router.route('/:id')
  .delete(asyncHandler(deleteUser));

router.put('/:id/reset-password', asyncHandler(resetPassword));

export default router;
