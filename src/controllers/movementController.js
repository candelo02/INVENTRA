import asyncHandler from '../middleware/asyncHandler.js';
import Movement from '../models/Movement.js';
import Product from '../models/Product.js';

// POST /api/movements
export const createMovement = asyncHandler(async (req, res) => {
  const { productId, type, quantity, note } = req.body;

  const product = await Product.findById(productId);
  if (!product) {
    res.status(404);
    throw new Error('Producto no encontrado');
  }

  // Solo el dueño del producto puede registrar movimientos
  if (product.user.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('Acceso denegado: no eres el dueño de este producto');
  }

  // Actualizar stock
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
    product: productId,
    user: req.user._id,
    type,
    quantity,
    note: note || '',
  });

  res.status(201).json({ success: true, data: movement });
});

// GET /api/movements
export const getMovements = asyncHandler(async (req, res) => {
  const movements = await Movement.find({ user: req.user._id })
    .populate('product', 'name')
    .sort({ createdAt: -1 });

  res.json({ success: true, data: movements });
});

// GET /api/movements/:id
export const getMovementById = asyncHandler(async (req, res) => {
  const movement = await Movement.findById(req.params.id).populate('product', 'name');

  if (!movement) {
    res.status(404);
    throw new Error('Movimiento no encontrado');
  }

  if (movement.user.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('Acceso denegado: no tienes permisos sobre este movimiento');
  }

  res.json({ success: true, data: movement });
});
