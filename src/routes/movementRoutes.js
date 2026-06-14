import express from 'express';
import {
  createMovement,
  getMovementById,
  getMovements,
} from '../controllers/movementController.js';
import asyncHandler from '../middleware/asyncHandler.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.route('/')
  .post(asyncHandler(createMovement))
  .get(asyncHandler(getMovements));

router.route('/:id')
  .get(asyncHandler(getMovementById));

export default router;
