import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import asyncHandler from './asyncHandler.js';

// 401 → sin token / token inválido o expirado
const protect = asyncHandler(async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401);
    throw new Error('No autorizado, token no enviado');
  }

  try {
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret123');
    const user = await User.findById(decoded.id).select('-password');

    if (!user) {
      res.status(401);
      throw new Error('No autorizado, usuario no encontrado');
    }

    req.user = user;
    return next();
  } catch {
    res.status(401);
    throw new Error('No autorizado, token inválido');
  }
});

// 403 → autenticado pero sin rol de administrador
const authorizeAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    return next();
  }
  res.status(403);
  throw new Error('Acceso denegado: se requiere rol de administrador');
};

export { authorizeAdmin, protect };
