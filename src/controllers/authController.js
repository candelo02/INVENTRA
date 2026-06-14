import User from '../models/User.js';
import generateToken from '../utils/generateToken.js';

// Registro público — solo crea rol 'admin' si no hay usuarios en el sistema
export const registerUser = async (req, res) => {
  const { name, email, password } = req.body;

  const userExists = await User.findOne({ email });
  if (userExists) {
    res.status(400);
    throw new Error('El usuario ya existe');
  }

  // El primer usuario registrado es admin automáticamente
  const totalUsers = await User.countDocuments();
  const role = totalUsers === 0 ? 'admin' : 'user';

  const user = await User.create({ name, email, password, role });

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

// Login
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

// Perfil propio
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
