/**
 * SUITE: Autenticación
 * Cubre: registerUser, loginUser, getUserProfile
 * Módulos críticos: flujos exitosos y fallidos (401 / 400 / 404)
 */

import { jest } from '@jest/globals';

// ── Mocks ─────────────────────────────────────────────────────────────────────
jest.unstable_mockModule('../src/models/User.js', () => {
  const mockUser = {
    _id: 'user123',
    name: 'Jaider Test',
    email: 'jaider@test.com',
    role: 'user',
    createdAt: new Date().toISOString(),
    matchPassword: jest.fn(),
  };

  return {
    default: {
      findOne: jest.fn(),
      findById: jest.fn(),
      create: jest.fn(),
    },
    __mockUser: mockUser,
  };
});

jest.unstable_mockModule('../src/utils/generateToken.js', () => ({
  default: jest.fn(() => 'mocked.jwt.token'),
}));

// ── Importar después del mock ─────────────────────────────────────────────────
const { registerUser, loginUser, getUserProfile } = await import(
  '../src/controllers/authController.js'
);
const UserModule = await import('../src/models/User.js');
const User = UserModule.default;
const mockUser = UserModule.__mockUser;

// ── Helper res mock ────────────────────────────────────────────────────────────
const buildRes = () => {
  const res = { statusCode: 200 };
  res.status = jest.fn((code) => { res.statusCode = code; return res; });
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

// ─────────────────────────────────────────────────────────────────────────────
describe('AUTH › registerUser', () => {
  afterEach(() => jest.clearAllMocks());

  it('201 → registra usuario correctamente', async () => {
    User.findOne.mockResolvedValue(null);
    User.create.mockResolvedValue({ ...mockUser });

    const req = { body: { name: 'Jaider Test', email: 'jaider@test.com', password: 'pass123' } };
    const res = buildRes();

    await registerUser(req, res, jest.fn());

    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ success: true })
    );
  });

  it('400 → email ya registrado', async () => {
    User.findOne.mockResolvedValue(mockUser);

    const req = { body: { name: 'Jaider Test', email: 'jaider@test.com', password: 'pass123' } };
    const res = buildRes();
    const next = jest.fn();

    await registerUser(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(next).toHaveBeenCalledWith(expect.any(Error));
  });
});

// ─────────────────────────────────────────────────────────────────────────────
describe('AUTH › loginUser', () => {
  afterEach(() => jest.clearAllMocks());

  it('200 → login exitoso retorna token', async () => {
    mockUser.matchPassword.mockResolvedValue(true);
    User.findOne.mockResolvedValue(mockUser);

    const req = { body: { email: 'jaider@test.com', password: 'pass123' } };
    const res = buildRes();

    await loginUser(req, res, jest.fn());

    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ success: true, data: expect.objectContaining({ token: 'mocked.jwt.token' }) })
    );
  });

  it('401 → credenciales incorrectas', async () => {
    User.findOne.mockResolvedValue(null);

    const req = { body: { email: 'wrong@test.com', password: 'wrongpass' } };
    const res = buildRes();
    const next = jest.fn();

    await loginUser(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).toHaveBeenCalledWith(expect.any(Error));
  });

  it('401 → contraseña incorrecta', async () => {
    mockUser.matchPassword.mockResolvedValue(false);
    User.findOne.mockResolvedValue(mockUser);

    const req = { body: { email: 'jaider@test.com', password: 'badpass' } };
    const res = buildRes();
    const next = jest.fn();

    await loginUser(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).toHaveBeenCalledWith(expect.any(Error));
  });
});

// ─────────────────────────────────────────────────────────────────────────────
describe('AUTH › getUserProfile', () => {
  afterEach(() => jest.clearAllMocks());

  it('200 → devuelve perfil del usuario autenticado', async () => {
    User.findById.mockResolvedValue(mockUser);

    const req = { user: { _id: 'user123' } };
    const res = buildRes();

    await getUserProfile(req, res, jest.fn());

    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ success: true })
    );
  });

  it('404 → usuario no encontrado en DB', async () => {
    User.findById.mockResolvedValue(null);

    const req = { user: { _id: 'nonexistent' } };
    const res = buildRes();
    const next = jest.fn();

    await getUserProfile(req, res, next);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(next).toHaveBeenCalledWith(expect.any(Error));
  });
});

// ─────────────────────────────────────────────────────────────────────────────
describe('AUTH Middleware › protect', () => {
  afterEach(() => jest.clearAllMocks());

  it('401 → sin header Authorization', async () => {
    const { protect } = await import('../src/middleware/authMiddleware.js');
    const req = { headers: {} };
    const res = buildRes();
    const next = jest.fn();

    await protect(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).toHaveBeenCalledWith(expect.any(Error));
  });

  it('401 → token malformado', async () => {
    const { protect } = await import('../src/middleware/authMiddleware.js');
    const req = { headers: { authorization: 'Bearer tokenmalformado' } };
    const res = buildRes();
    const next = jest.fn();

    await protect(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).toHaveBeenCalledWith(expect.any(Error));
  });
});
