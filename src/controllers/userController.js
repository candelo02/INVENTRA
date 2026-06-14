import User from '../models/User.js';

// GET /api/v1/users — solo admin
export const getUsers = async (req, res) => {
  const users = await User.find({}).select('-password').sort({ createdAt: -1 });
  res.json({ success: true, data: users });
};

// POST /api/v1/users — admin crea vendedor
export const createVendedor = async (req, res) => {
  const { name, email, password } = req.body;

  const userExists = await User.findOne({ email });
  if (userExists) {
    res.status(400);
    throw new Error('Ya existe un usuario con ese email');
  }

  const user = await User.create({ name, email, password, role: 'user' });

  res.status(201).json({
    success: true,
    data: {
      _id:   user._id,
      name:  user.name,
      email: user.email,
      role:  user.role,
    },
  });
};

// DELETE /api/v1/users/:id — admin elimina vendedor
export const deleteUser = async (req, res) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    res.status(404);
    throw new Error('Usuario no encontrado');
  }

  if (user.role === 'admin') {
    res.status(403);
    throw new Error('No puedes eliminar a un administrador');
  }

  await user.deleteOne();
  res.json({ success: true, message: 'Vendedor eliminado correctamente' });
};

// PUT /api/v1/users/:id/reset-password — admin resetea contraseña
export const resetPassword = async (req, res) => {
  const { password } = req.body;

  const user = await User.findById(req.params.id);
  if (!user) {
    res.status(404);
    throw new Error('Usuario no encontrado');
  }

  user.password = password;
  await user.save();

  res.json({ success: true, message: 'Contraseña actualizada correctamente' });
};
