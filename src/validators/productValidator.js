import { body } from "express-validator";

export const productValidator = [
  body("name")
    .notEmpty()
    .withMessage("El nombre del producto es obligatorio")
    .isLength({ min: 3 })
    .withMessage("El nombre debe tener al menos 3 caracteres"),
  
  body("quantity")
    .isInt({ min: 0 })
    .withMessage("La cantidad debe ser un número entero mayor o igual a 0"),
  
  body("price")
    .isFloat({ min: 0.01 })
    .withMessage("El precio debe ser un número mayor a 0"),
];