import User from '../models/User.js';
import generateToken from '../utils/generateToken.js';

// Lógica pura — sin asyncHandler para facilitar tests unitarios
export const registerUser = async (req, res) => {
  const { name, email, password } = req.body;

  const userExists = await User.findOne({ email });

  if (userExists) {
    res.status(400);
    throw new Error('El usuario ya existe');
  }

  const user = await User.create({ name, email, password });

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
