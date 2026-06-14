/**
 * SUITE: Autenticación
 * Controllers son funciones async puras — asyncHandler solo vive en las rutas
 */

import { jest } from '@jest/globals'

// ── Mocks de módulos (deben ir antes de cualquier import dinámico) ─────────────
jest.unstable_mockModule('../src/models/User.js', () => ({
  default: {
    findOne:  jest.fn(),
    findById: jest.fn(),
    create:   jest.fn(),
  },
}))

jest.unstable_mockModule('../src/utils/generateToken.js', () => ({
  default: jest.fn(() => 'tok.mock.jwt'),
}))

jest.unstable_mockModule('../src/models/Movement.js', () => ({
  default: { create: jest.fn(), find: jest.fn(), findById: jest.fn() },
}))

// ── Imports dinámicos (top-level, fuera de describe) ──────────────────────────
const { registerUser, loginUser, getUserProfile } =
  await import('../src/controllers/authController.js')

const { protectHandler } =
  await import('../src/middleware/authMiddleware.js')

const { default: User } = await import('../src/models/User.js')

// ── Helpers ───────────────────────────────────────────────────────────────────
/**
 * Ejecuta un controller puro (async fn que puede hacer throw).
 * Captura el throw y lo guarda en res.__err, igual que asyncHandler.
 */
const run = async (fn, req, res) => {
  try {
    await fn(req, res, (err) => { res.__err = err })
  } catch (err) {
    res.__err = err
  }
}

const buildRes = () => {
  const res = { statusCode: 200, __err: null }
  res.status = jest.fn((code) => { res.statusCode = code; return res })
  res.json   = jest.fn().mockReturnValue(res)
  return res
}

// ── Datos de prueba ───────────────────────────────────────────────────────────
const fakeUser = {
  _id:       'uid001',
  name:      'Jaider',
  email:     'j@test.com',
  role:      'user',
  createdAt: '2024-01-01',
  matchPassword: jest.fn(),
}

// ─────────────────────────────────────────────────────────────────────────────
describe('AUTH › registerUser', () => {
  afterEach(() => jest.clearAllMocks())

  it('201 → crea usuario y retorna token', async () => {
    User.findOne.mockResolvedValue(null)
    User.create.mockResolvedValue(fakeUser)

    const res = buildRes()
    await run(registerUser, { body: { name: 'Jaider', email: 'j@test.com', password: 'pass123' } }, res)

    expect(res.__err).toBeNull()
    expect(res.status).toHaveBeenCalledWith(201)
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ success: true, data: expect.objectContaining({ token: 'tok.mock.jwt' }) })
    )
  })

  it('400 → email ya registrado lanza error', async () => {
    User.findOne.mockResolvedValue(fakeUser)

    const res = buildRes()
    await run(registerUser, { body: { name: 'X', email: 'j@test.com', password: 'x' } }, res)

    expect(res.status).toHaveBeenCalledWith(400)
    expect(res.__err).toBeInstanceOf(Error)
    expect(res.__err.message).toBe('El usuario ya existe')
  })
})

// ─────────────────────────────────────────────────────────────────────────────
describe('AUTH › loginUser', () => {
  afterEach(() => jest.clearAllMocks())

  it('200 → login exitoso retorna token', async () => {
    fakeUser.matchPassword.mockResolvedValue(true)
    User.findOne.mockResolvedValue(fakeUser)

    const res = buildRes()
    await run(loginUser, { body: { email: 'j@test.com', password: 'pass123' } }, res)

    expect(res.__err).toBeNull()
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ success: true, data: expect.objectContaining({ token: 'tok.mock.jwt' }) })
    )
  })

  it('401 → usuario no encontrado', async () => {
    User.findOne.mockResolvedValue(null)

    const res = buildRes()
    await run(loginUser, { body: { email: 'no@test.com', password: 'x' } }, res)

    expect(res.status).toHaveBeenCalledWith(401)
    expect(res.__err).toBeInstanceOf(Error)
  })

  it('401 → contraseña incorrecta', async () => {
    fakeUser.matchPassword.mockResolvedValue(false)
    User.findOne.mockResolvedValue(fakeUser)

    const res = buildRes()
    await run(loginUser, { body: { email: 'j@test.com', password: 'mala' } }, res)

    expect(res.status).toHaveBeenCalledWith(401)
    expect(res.__err).toBeInstanceOf(Error)
  })
})

// ─────────────────────────────────────────────────────────────────────────────
describe('AUTH › getUserProfile', () => {
  afterEach(() => jest.clearAllMocks())

  it('200 → retorna perfil del usuario', async () => {
    User.findById.mockResolvedValue(fakeUser)

    const res = buildRes()
    await run(getUserProfile, { user: { _id: 'uid001' } }, res)

    expect(res.__err).toBeNull()
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: true }))
  })

  it('404 → usuario no existe en DB', async () => {
    User.findById.mockResolvedValue(null)

    const res = buildRes()
    await run(getUserProfile, { user: { _id: 'nope' } }, res)

    expect(res.status).toHaveBeenCalledWith(404)
    expect(res.__err).toBeInstanceOf(Error)
  })
})

// ─────────────────────────────────────────────────────────────────────────────
describe('AUTH Middleware › protectHandler', () => {
  afterEach(() => jest.clearAllMocks())

  it('401 → sin header Authorization', async () => {
    const res = buildRes()
    await run(protectHandler, { headers: {} }, res)

    expect(res.status).toHaveBeenCalledWith(401)
    expect(res.__err).toBeInstanceOf(Error)
  })

  it('401 → token malformado / inválido', async () => {
    const res = buildRes()
    await run(protectHandler, { headers: { authorization: 'Bearer INVALID.TOKEN' } }, res)

    expect(res.status).toHaveBeenCalledWith(401)
    expect(res.__err).toBeInstanceOf(Error)
  })
})

// ─────────────────────────────────────────────────────────────────────────────
describe('AUTH › generateToken (utils)', () => {
  it('genera un string no vacío', async () => {
    const { default: generateToken } = await import('../src/utils/generateToken.js')
    const token = generateToken('uid001')
    expect(typeof token).toBe('string')
    expect(token.length).toBeGreaterThan(0)
  })
})

// ─────────────────────────────────────────────────────────────────────────────
describe('AUTH › errorMiddleware', () => {
  it('responde con el statusCode correcto y mensaje', async () => {
    const { errorHandler } = await import('../src/middleware/errorMiddleware.js')
    const err = new Error('algo salió mal')
    const res = buildRes()
    res.statusCode = 400

    errorHandler(err, {}, res, () => {})

    expect(res.status).toHaveBeenCalledWith(400)
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ success: false, message: 'algo salió mal' })
    )
  })

  it('usa 500 si statusCode es 200', async () => {
    const { errorHandler } = await import('../src/middleware/errorMiddleware.js')
    const err = new Error('error interno')
    const res = buildRes()
    res.statusCode = 200

    errorHandler(err, {}, res, () => {})

    expect(res.status).toHaveBeenCalledWith(500)
  })
})
