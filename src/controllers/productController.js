import Product from '../models/Product.js';

export const createProduct = async (req, res) => {
  const { name, quantity, price } = req.body;
  const product = await Product.create({ user: req.user._id, name, quantity, price });
  res.status(201).json({ success: true, data: product });
};

export const getProducts = async (req, res) => {
  const products = await Product.find({ user: req.user._id });
  res.json({ success: true, data: products });
};

export const getProductById = async (req, res) => {
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
};

export const updateProduct = async (req, res) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    res.status(404);
    throw new Error('Producto no encontrado');
  }

  if (product.user.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('Acceso denegado: no tienes permisos sobre este producto');
  }

  product.name     = req.body.name     ?? product.name;
  product.quantity = req.body.quantity ?? product.quantity;
  product.price    = req.body.price    ?? product.price;

  const updated = await product.save();
  res.json({ success: true, data: updated });
};

export const deleteProduct = async (req, res) => {
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
};
