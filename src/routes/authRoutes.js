import express from 'express';
import { loginUser, registerUser, logoutUser } from '../controllers/authController.js';
import validate from '../middleware/validatorMiddleware.js';
import { loginValidator, registerValidator } from '../validators/authValidator.js';

const router = express.Router();

router.post('/register', registerValidator, validate, registerUser);
router.post('/login', loginValidator, validate, loginUser);
router.post('/logout', logoutUser);

export default router;
