import Product from '../models/Product.js';

// Admin: crea producto
export const createProduct = async (req, res) => {
  const { name, quantity, price, description } = req.body;
  const product = await Product.create({
    user: req.user._id,
    name,
    quantity,
    price,
    description: description || '',
  });
  res.status(201).json({ success: true, data: product });
};

// Todos: ven todos los productos (admin ve los suyos, vendedor ve todos)
export const getProducts = async (req, res) => {
  const filter = req.user.role === 'admin' ? { user: req.user._id } : {};
  const products = await Product.find(filter).populate('user', 'name');
  res.json({ success: true, data: products });
};

// Todos: ver producto por id
export const getProductById = async (req, res) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    res.status(404);
    throw new Error('Producto no encontrado');
  }

  // Vendedor puede ver cualquier producto; admin solo los suyos
  if (req.user.role !== 'admin' || product.user.toString() === req.user._id.toString()) {
    return res.json({ success: true, data: product });
  }

  res.status(403);
  throw new Error('Acceso denegado');
};

// Solo admin: actualizar producto
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

  product.name        = req.body.name        ?? product.name;
  product.quantity    = req.body.quantity    ?? product.quantity;
  product.price       = req.body.price       ?? product.price;
  product.description = req.body.description ?? product.description;

  const updated = await product.save();
  res.json({ success: true, data: updated });
};

// Solo admin: eliminar producto
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
