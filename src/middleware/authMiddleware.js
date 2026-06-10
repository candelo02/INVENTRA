import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import asyncHandler from './asyncHandler.js';

// Verifica token JWT → 401 si no hay token o es inválido
const protect = asyncHandler(async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret123');
      req.user = await User.findById(decoded.id).select('-password');

      if (!req.user) {
        res.status(401);
        throw new Error('Usuario no encontrado');
      }

      return next();
    } catch (error) {
      res.status(401);
      throw new Error('No autorizado, token inválido');
    }
  }

  res.status(401);
  throw new Error('No autorizado, token no enviado');
});

// Verifica rol admin → 403 si el usuario autenticado no tiene permisos
const authorizeAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    return next();
  }
  res.status(403);
  throw new Error('Acceso denegado: se requiere rol de administrador');
};

export { authorizeAdmin, protect };
