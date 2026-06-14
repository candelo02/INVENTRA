import User from '../models/User.js';
import generateToken from '../utils/generateToken.js';

// POST /api/v1/auth/login
export const loginUser = async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });
  if (!user) {
    res.status(401);
    throw new Error('Credenciales inválidas');
  }

  const isMatch = await user.matchPassword(password);
  if (!isMatch) {
    res.status(401);
    throw new Error('Credenciales inválidas');
  }

  res.json({
    success: true,
    data: {
      _id:   user._id,
      name:  user.name,
      email: user.email,
      role:  user.role,
      token: generateToken(user._id),
    },
  });
};

// GET /api/v1/auth/profile
export const getUserProfile = async (req, res) => {
  const user = await User.findById(req.user._id);
  if (!user) {
    res.status(404);
    throw new Error('Usuario no encontrado');
  }

  res.json({
    success: true,
    data: {
      _id:       user._id,
      name:      user.name,
      email:     user.email,
      role:      user.role,
      createdAt: user.createdAt,
    },
  });
};

// POST /api/v1/auth/setup — crea el primer admin (solo si no existe ninguno)
export const setupAdmin = async (req, res) => {
  const { name, email, password } = req.body;

  const adminExists = await User.findOne({ role: 'admin' });
  if (adminExists) {
    res.status(403);
    throw new Error('El sistema ya tiene un administrador configurado');
  }

  const user = await User.create({ name, email, password, role: 'admin' });

  res.status(201).json({
    success: true,
    data: {
      _id:   user._id,
      name:  user.name,
      email: user.email,
      role:  user.role,
      token: generateToken(user._id),
    },
  });
};
