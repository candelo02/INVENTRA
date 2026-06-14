import jwt from 'jsonwebtoken';

// Genera token con expiración de 1 hora desde ahora
const generateToken = (id) => {
  return jwt.sign(
    { id },
    process.env.JWT_SECRET,
    { expiresIn: '1h' }
  );
};

export default generateToken;
