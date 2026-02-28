import express from "express";
import { validationResult } from "express-validator";
import { registerUser } from "../controllers/authController.js";
import { registerValidation } from "../validators/authValidator.js";

const router = express.Router();

// Middleware para capturar errores de validación
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array(),
    });
  }
  next();
};

router.post("/register", registerValidation, validate, registerUser);

export default router;
