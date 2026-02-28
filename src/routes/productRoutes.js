import express from "express";
import {
    createProduct,
    deleteProduct,
    getProducts
} from "../controllers/productController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(protect); // Todas las rutas de productos requieren autenticación

router.route("/")
  .post(createProduct)
  .get(getProducts);

router.route("/:id")
  .delete(deleteProduct);

export default router;