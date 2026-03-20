import { body } from "express-validator";

export const registerValidator = [
  body("name")
    .notEmpty()
    .withMessage("El nombre es obligatorio")
    .trim(),
  body("email")
    .isEmail()
    .withMessage("Debe ser un email válido")
    .normalizeEmail(),
  body("password")
    .isLength({ min: 6 })
    .withMessage("La contraseña debe tener al menos 6 caracteres"),
];

export const loginValidator = [
  body("email")
    .isEmail()
    .withMessage("Debe ser un email válido"),
  body("password")
    .notEmpty()
    .withMessage("La contraseña es obligatoria"),
];