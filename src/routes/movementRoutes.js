import express from 'express';
import {
  createMovement,
  getMovementById,
  getMovements,
} from '../controllers/movementController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.route('/').post(createMovement).get(getMovements);
router.route('/:id').get(getMovementById);

export default router;
