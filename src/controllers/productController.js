import asyncHandler from "../middleware/asyncHandler.js";
import Product from "../models/Product.js";

// 📌 Crear producto
export const createProduct = asyncHandler(async (req, res) => {
  const { name, quantity, price } = req.body;

  const product = await Product.create({
    user: req.user._id,
    name,
    quantity,
    price
  });

  res.status(201).json({
    success: true,
    data: product,
  });
});

// 📌 Obtener productos del usuario logueado
export const getProducts = asyncHandler(async (req, res) => {
  const products = await Product.find({ user: req.user._id });
  res.json({
    success: true,
    data: products,
  });
});

// 📌 Eliminar producto (solo dueño)
export const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    res.status(404);
    throw new Error("Producto no encontrado");
  }

  // Verificar que el usuario sea el dueño del producto
  if (product.user.toString() !== req.user._id.toString()) {
    res.status(401);
    throw new Error("No autorizado para eliminar este producto");
  }

  await product.deleteOne();
  res.json({ 
    success: true,
    message: "Producto eliminado" 
  });
});