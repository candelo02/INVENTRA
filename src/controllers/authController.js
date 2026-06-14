import User from '../models/User.js';
import generateToken from '../utils/generateToken.js';

export const registerUser = async (req, res) => {
  const { name, email, password } = req.body;

  console.log('[register] body recibido:', { name, email, password: password ? '***' : 'VACÍO' });

  const userExists = await User.findOne({ email });
  console.log('[register] userExists:', !!userExists);

  if (userExists) {
    res.status(400);
    throw new Error('El usuario ya existe');
  }

  console.log('[register] creando usuario...');
  const user = await User.create({ name, email, password });
  console.log('[register] usuario creado:', user._id);

  const token = generateToken(user._id);
  console.log('[register] token generado:', !!token);

  res.status(201).json({
    success: true,
    data: {
      _id:   user._id,
      name:  user.name,
      email: user.email,
      role:  user.role,
      token,
    },
  });
};

export const loginUser = async (req, res) => {
  const { email, password } = req.body;

  console.log('[login] intento con email:', email);

  const user = await User.findOne({ email });

  if (!user) {
    res.status(401);
    throw new Error('Credenciales inválidas');
  }

  const isMatch = await user.matchPassword(password);
  console.log('[login] password match:', isMatch);

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
