import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import generateToken from '../utils/generateToken.js';
import asyncHandler from './asyncHandler.js';

// Verifica token — 401 si no hay token o es inválido
export const protectHandler = async (req, res, next) => {
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

    // ── Sliding session: renovar token en cada request (reinicia el 1h) ───────
    const newToken = generateToken(user._id);
    res.setHeader('X-Refresh-Token', newToken);

    return next();
  } catch {
    res.status(401);
    throw new Error('No autorizado, token inválido o expirado');
  }
};

export const protect = asyncHandler(protectHandler);

// 403 → autenticado pero sin rol de administrador
export const authorizeAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    return next();
  }
  res.status(403);
  throw new Error('Acceso denegado: se requiere rol de administrador');
};
