import Movement from '../models/Movement.js';
import Product from '../models/Product.js';

export const createMovement = async (req, res) => {
  const { productId, type, quantity, note } = req.body;

  const product = await Product.findById(productId);
  if (!product) {
    res.status(404);
    throw new Error('Producto no encontrado');
  }

  if (product.user.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('Acceso denegado: no eres el dueño de este producto');
  }

  if (type === 'entrada') {
    product.quantity += quantity;
  } else {
    if (product.quantity < quantity) {
      res.status(400);
      throw new Error('Stock insuficiente para realizar la salida');
    }
    product.quantity -= quantity;
  }

  await product.save();

  const movement = await Movement.create({
    product:  productId,
    user:     req.user._id,
    type,
    quantity,
    note:     note || '',
  });

  res.status(201).json({ success: true, data: movement });
};

export const getMovements = async (req, res) => {
  const movements = await Movement.find({ user: req.user._id })
    .populate('product', 'name price')
    .populate('user', 'name')
    .sort({ createdAt: -1 });

  res.json({ success: true, data: movements });
};

export const getMovementById = async (req, res) => {
  const movement = await Movement.findById(req.params.id)
    .populate('product', 'name price')
    .populate('user', 'name');

  if (!movement) {
    res.status(404);
    throw new Error('Movimiento no encontrado');
  }

  if (movement.user._id.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('Acceso denegado');
  }

  res.json({ success: true, data: movement });
};
