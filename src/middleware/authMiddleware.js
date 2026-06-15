import asyncHandler from './asyncHandler.js';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import generateToken from '../utils/generateToken.js';

const ADMIN_EMAIL = 'candeloj2002@gmail.com';

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

    // Sliding session: renovar token en cada request
    const newToken = generateToken(user._id);
    res.setHeader('X-Refresh-Token', newToken);

    return next();
  } catch {
    res.status(401);
    throw new Error('No autorizado, token inválido o expirado');
  }
};

export const protect = asyncHandler(protectHandler);

// 403 → solo el admin fijo puede gestionar usuarios
export const onlyAdmin = asyncHandler(async (req, res, next) => {
  if (req.user && req.user.email === ADMIN_EMAIL) {
    return next();
  }
  res.status(403);
  throw new Error('Acceso denegado: solo el administrador puede realizar esta acción');
});
