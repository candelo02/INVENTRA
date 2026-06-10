import asyncHandler from '../middleware/asyncHandler.js';
import Product from '../models/Product.js';

// POST /api/products
export const createProduct = asyncHandler(async (req, res) => {
  const { name, quantity, price } = req.body;

  const product = await Product.create({
    user: req.user._id,
    name,
    quantity,
    price,
  });

  res.status(201).json({ success: true, data: product });
});

// GET /api/products
export const getProducts = asyncHandler(async (req, res) => {
  const products = await Product.find({ user: req.user._id });
  res.json({ success: true, data: products });
});

// GET /api/products/:id
export const getProductById = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    res.status(404);
    throw new Error('Producto no encontrado');
  }

  if (product.user.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('Acceso denegado: no tienes permisos sobre este producto');
  }

  res.json({ success: true, data: product });
});

// PUT /api/products/:id
export const updateProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    res.status(404);
    throw new Error('Producto no encontrado');
  }

  if (product.user.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('Acceso denegado: no tienes permisos sobre este producto');
  }

  product.name = req.body.name ?? product.name;
  product.quantity = req.body.quantity ?? product.quantity;
  product.price = req.body.price ?? product.price;

  const updated = await product.save();
  res.json({ success: true, data: updated });
});

// DELETE /api/products/:id
export const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    res.status(404);
    throw new Error('Producto no encontrado');
  }

  if (product.user.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('Acceso denegado: no tienes permisos sobre este producto');
  }

  await product.deleteOne();
  res.json({ success: true, message: 'Producto eliminado' });
});
