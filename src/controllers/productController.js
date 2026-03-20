import asyncHandler from "../middleware/asyncHandler.js";
import Movement from "../models/Movement.js";
import Product from "../models/Product.js";

// Helper para registrar movimientos de stock
const logMovement = async (productId, userId, type, quantity, description) => {
  if (quantity === 0) return;
  return await Movement.create({
    product: productId,
    user: userId,
    type,
    quantity: Math.abs(quantity),
    description
  });
};

// 📌 Crear producto
export const createProduct = asyncHandler(async (req, res) => {
  const { name, quantity, price, category, lowStockThreshold } = req.body;

  const product = await Product.create({
    user: req.user._id,
    name,
    quantity,
    price,
    category,
    lowStockThreshold
  });

  await logMovement(product._id, req.user._id, "entrada", quantity, "Carga inicial de inventario");

  res.status(201).json({ success: true, data: product });
});

// 📌 Obtener productos del usuario logueado + Valor Total + Alertas
export const getProducts = asyncHandler(async (req, res) => {
  const products = await Product.find({ user: req.user._id });
  
  const totalValue = products.reduce((acc, p) => acc + (p.price * p.quantity), 0);
  const lowStockAlerts = products.filter(p => p.quantity <= p.lowStockThreshold);

  res.json({
    success: true,
    count: products.length,
    totalValue,
    lowStockCount: lowStockAlerts.length,
    data: products,
    lowStockAlerts
  });
});

// 📌 Actualizar producto (solo dueño)
export const updateProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    res.status(404);
    throw new Error("Producto no encontrado");
  }

  if (product.user.toString() !== req.user._id.toString()) {
    res.status(401);
    throw new Error("No autorizado");
  }

  const { name, quantity, price, category, lowStockThreshold } = req.body;

  // Registrar movimiento si cambia el stock
  if (quantity !== undefined && quantity !== product.quantity) {
    const diff = quantity - product.quantity;
    await logMovement(
      product._id, 
      req.user._id, 
      diff > 0 ? "entrada" : "salida", 
      diff, 
      "Actualización manual de stock"
    );
  }

  Object.assign(product, {
    name: name || product.name,
    quantity: quantity !== undefined ? quantity : product.quantity,
    price: price || product.price,
    category: category || product.category,
    lowStockThreshold: lowStockThreshold !== undefined ? lowStockThreshold : product.lowStockThreshold
  });

  const updatedProduct = await product.save();
  res.json({ success: true, data: updatedProduct });
});

// 📌 Registrar Movimiento (Entrada/Salida rápida para pequeños negocios)
export const recordMovement = asyncHandler(async (req, res) => {
  const { type, quantity, description } = req.body;
  const product = await Product.findById(req.params.id);

  if (!product || product.user.toString() !== req.user._id.toString()) {
    res.status(product ? 401 : 404);
    throw new Error(product ? "No autorizado" : "Producto no encontrado");
  }

  if (type === "salida" && product.quantity < quantity) {
    res.status(400);
    throw new Error("Stock insuficiente para realizar esta salida");
  }

  product.quantity += (type === "entrada" ? quantity : -quantity);
  await product.save();

  const movement = await logMovement(
    product._id, 
    req.user._id, 
    type, 
    quantity, 
    description || `Registro de ${type} manual`
  );

  res.status(201).json({
    success: true,
    data: movement,
    newQuantity: product.quantity
  });
});

// 📌 Obtener Historial de Movimientos
export const getMovements = asyncHandler(async (req, res) => {
  const { startDate, endDate, type } = req.query;
  const query = { user: req.user._id };
  
  // Filtro por producto opcional
  if (req.params.id) {
    query.product = req.params.id;
  }

  // Filtro por tipo (entrada/salida)
  if (type) {
    query.type = type;
  }

  // Filtro por rango de fechas
  if (startDate || endDate) {
    query.createdAt = {};
    if (startDate) query.createdAt.$gte = new Date(startDate);
    if (endDate) query.createdAt.$lte = new Date(endDate);
  }

  const movements = await Movement.find(query)
    .populate("product", "name category")
    .sort("-createdAt");

  res.json({
    success: true,
    count: movements.length,
    data: movements
  });
});

// 📌 Reporte de Ventas y Compras (Resumen para el negocio)
export const getInventoryReport = asyncHandler(async (req, res) => {
  const { startDate, endDate } = req.query;
  const query = { user: req.user._id };

  if (startDate || endDate) {
    query.createdAt = {};
    if (startDate) query.createdAt.$gte = new Date(startDate);
    if (endDate) query.createdAt.$lte = new Date(endDate);
  }

  const movements = await Movement.find(query).populate("product", "price");

  const report = movements.reduce((acc, mov) => {
    const value = mov.quantity * (mov.product?.price || 0);
    if (mov.type === "entrada") {
      acc.totalPurchases += value;
      acc.itemsReceived += mov.quantity;
    } else {
      acc.totalSales += value;
      acc.itemsSold += mov.quantity;
    }
    return acc;
  }, { totalSales: 0, totalPurchases: 0, itemsSold: 0, itemsReceived: 0 });

  res.json({
    success: true,
    period: { 
      start: startDate || "Desde el inicio", 
      end: endDate || "Hoy" 
    },
    data: report
  });
});

// 📌 Eliminar producto
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