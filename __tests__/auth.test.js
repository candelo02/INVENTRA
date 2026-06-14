/**
 * SUITE: Autenticación
 */

import { jest } from '@jest/globals'

jest.unstable_mockModule('../src/models/User.js', () => {
  const mockUser = {
    _id: 'user123',
    name: 'Jaider Test',
    email: 'jaider@test.com',
    role: 'user',
    createdAt: new Date().toISOString(),
    matchPassword: jest.fn(),
  }
  return {
    default: { findOne: jest.fn(), findById: jest.fn(), create: jest.fn() },
    __mockUser: mockUser,
  }
})

jest.unstable_mockModule('../src/utils/generateToken.js', () => ({
  default: jest.fn(() => 'mocked.jwt.token'),
}))

// Todos los imports dinámicos al nivel raíz del módulo (fuera de describe)
const { registerUser, loginUser, getUserProfile } =
  await import('../src/controllers/authController.js')

const { protect } = await import('../src/middleware/authMiddleware.js')

const UserModule = await import('../src/models/User.js')
const User     = UserModule.default
const mockUser = UserModule.__mockUser

// Helper: replica asyncHandler — captura throw y llama next(err)
const run = (controller, req, res) =>
  new Promise((resolve) => {
    const next = (err) => { res.__err = err; resolve() }
    Promise.resolve(controller(req, res, next))
      .then(() => resolve())
      .catch((err) => { next(err) })
  })

const buildRes = () => {
  const res = { statusCode: 200, __err: null }
  res.status = jest.fn((code) => { res.statusCode = code; return res })
  res.json   = jest.fn().mockReturnValue(res)
  return res
}

// ─────────────────────────────────────────────────────────────────────────────
describe('AUTH › registerUser', () => {
  afterEach(() => jest.clearAllMocks())

  it('201 → registra usuario correctamente', async () => {
    User.findOne.mockResolvedValue(null)
    User.create.mockResolvedValue({ ...mockUser })

    const res = buildRes()
    await run(registerUser, { body: { name: 'Jaider', email: 'j@test.com', password: 'pass123' } }, res)

    expect(res.status).toHaveBeenCalledWith(201)
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: true }))
  })

  it('400 → email ya registrado', async () => {
    User.findOne.mockResolvedValue(mockUser)

    const res = buildRes()
    await run(registerUser, { body: { name: 'Jaider', email: 'j@test.com', password: 'pass123' } }, res)

    expect(res.status).toHaveBeenCalledWith(400)
    expect(res.__err).toBeInstanceOf(Error)
  })
})

describe('AUTH › loginUser', () => {
  afterEach(() => jest.clearAllMocks())

  it('200 → login exitoso retorna token', async () => {
    mockUser.matchPassword.mockResolvedValue(true)
    User.findOne.mockResolvedValue(mockUser)

    const res = buildRes()
    await run(loginUser, { body: { email: 'j@test.com', password: 'pass123' } }, res)

    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ success: true, data: expect.objectContaining({ token: 'mocked.jwt.token' }) })
    )
  })

  it('401 → usuario no existe', async () => {
    User.findOne.mockResolvedValue(null)

    const res = buildRes()
    await run(loginUser, { body: { email: 'no@test.com', password: 'x' } }, res)

    expect(res.status).toHaveBeenCalledWith(401)
    expect(res.__err).toBeInstanceOf(Error)
  })

  it('401 → contraseña incorrecta', async () => {
    mockUser.matchPassword.mockResolvedValue(false)
    User.findOne.mockResolvedValue(mockUser)

    const res = buildRes()
    await run(loginUser, { body: { email: 'j@test.com', password: 'bad' } }, res)

    expect(res.status).toHaveBeenCalledWith(401)
    expect(res.__err).toBeInstanceOf(Error)
  })
})

describe('AUTH › getUserProfile', () => {
  afterEach(() => jest.clearAllMocks())

  it('200 → devuelve perfil del usuario autenticado', async () => {
    User.findById.mockResolvedValue(mockUser)

    const res = buildRes()
    await run(getUserProfile, { user: { _id: 'user123' } }, res)

    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: true }))
  })

  it('404 → usuario no encontrado', async () => {
    User.findById.mockResolvedValue(null)

    const res = buildRes()
    await run(getUserProfile, { user: { _id: 'nope' } }, res)

    expect(res.status).toHaveBeenCalledWith(404)
    expect(res.__err).toBeInstanceOf(Error)
  })
})

describe('AUTH Middleware › protect', () => {
  afterEach(() => jest.clearAllMocks())

  it('401 → sin header Authorization', async () => {
    const res = buildRes()
    await run(protect, { headers: {} }, res)

    expect(res.status).toHaveBeenCalledWith(401)
    expect(res.__err).toBeInstanceOf(Error)
  })

  it('401 → token malformado', async () => {
    const res = buildRes()
    await run(protect, { headers: { authorization: 'Bearer tokenmalformado' } }, res)

    expect(res.status).toHaveBeenCalledWith(401)
    expect(res.__err).toBeInstanceOf(Error)
  })
})
