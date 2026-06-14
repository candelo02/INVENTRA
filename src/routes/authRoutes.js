import express from 'express';
import { validationResult } from 'express-validator';
import {
  getUserProfile,
  loginUser,
  registerUser,
} from '../controllers/authController.js';
import asyncHandler from '../middleware/asyncHandler.js';
import { protect } from '../middleware/authMiddleware.js';
import { loginValidation, registerValidation } from '../validators/authValidator.js';

const router = express.Router();

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }
  return next();
};

router.post('/register', registerValidation, validate, asyncHandler(registerUser));
router.post('/login',    loginValidation,    validate, asyncHandler(loginUser));
router.get('/profile',   protect,                      asyncHandler(getUserProfile));

export default router;
