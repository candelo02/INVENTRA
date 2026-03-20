import express from "express";
import {
    createProduct,
    deleteProduct,
    getInventoryReport,
    getMovements,
    getProducts,
    recordMovement,
    updateProduct
} from "../controllers/productController.js";
import { protect } from "../middleware/authMiddleware.js";
import validate from "../middleware/validatorMiddleware.js";
import { productValidator } from "../validators/productValidator.js";

const router = express.Router();

router.use(protect);

// 📌 Reporte resumido del inventario (por fechas)
router.get("/report", getInventoryReport);

// 📌 Historial general de todos los movimientos (con filtros de fecha y tipo)
router.get("/movements", getMovements);

router.route("/")
  .post(productValidator, validate, createProduct)
  .get(getProducts);

router.route("/:id")
  .put(productValidator, validate, updateProduct)
  .delete(deleteProduct);

// 📌 Rutas específicas de un producto
router.post("/:id/movements", recordMovement); // Registrar entrada/salida
router.get("/:id/movements", getMovements);   // Ver historial de ese producto

export default router;