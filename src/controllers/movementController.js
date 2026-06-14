import Movement from '../models/Movement.js';
import Product from '../models/Product.js';

export const createMovement = async (req, res) => {
  const { productId, type, quantity, note } = req.body;

  // Vendedor solo puede hacer salidas (ventas)
  if (req.user.role !== 'admin' && type === 'entrada') {
    res.status(403);
    throw new Error('Solo el administrador puede registrar entradas de stock');
  }

  const product = await Product.findById(productId);
  if (!product) {
    res.status(404);
    throw new Error('Producto no encontrado');
  }

  // Admin solo puede mover sus propios productos
  // Vendedor puede hacer salidas de cualquier producto
  if (req.user.role === 'admin' && product.user.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('Acceso denegado: no eres el dueño de este producto');
  }

  if (type === 'entrada') {
    product.quantity += quantity;
  } else {
    if (product.quantity < quantity) {
      res.status(400);
      throw new Error('Stock insuficiente para realizar la venta');
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

// Admin ve todos los movimientos; vendedor solo los suyos
export const getMovements = async (req, res) => {
  const filter = req.user.role === 'admin' ? {} : { user: req.user._id };

  const movements = await Movement.find(filter)
    .populate('product', 'name price')
    .populate('user', 'name role')
    .sort({ createdAt: -1 });

  res.json({ success: true, data: movements });
};

export const getMovementById = async (req, res) => {
  const movement = await Movement.findById(req.params.id)
    .populate('product', 'name price')
    .populate('user', 'name role');

  if (!movement) {
    res.status(404);
    throw new Error('Movimiento no encontrado');
  }

  // Admin ve cualquier movimiento; vendedor solo los suyos
  if (req.user.role !== 'admin' && movement.user._id.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('Acceso denegado');
  }

  res.json({ success: true, data: movement });
};
