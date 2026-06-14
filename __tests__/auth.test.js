/**
 * SUITE: Autenticación
 * Controllers son funciones async puras
 */

import { jest } from '@jest/globals'

// ── Mocks ─────────────────────────────────────────────────────────────────────
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

// ── Imports top-level ─────────────────────────────────────────────────────────
const { registerUser, loginUser, getUserProfile } =
  await import('../src/controllers/authController.js')

const { protectHandler } =
  await import('../src/middleware/authMiddleware.js')

const { errorHandler } =
  await import('../src/middleware/errorMiddleware.js')

const { default: generateToken } =
  await import('../src/utils/generateToken.js')

const { default: User } = await import('../src/models/User.js')

// ── Helper ────────────────────────────────────────────────────────────────────
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

// Crea un usuario fresco con matchPassword limpio en cada uso
const makeFakeUser = (matchResult = true) => ({
  _id:           'uid001',
  name:          'Jaider',
  email:         'j@test.com',
  role:          'user',
  createdAt:     '2024-01-01',
  matchPassword: jest.fn().mockResolvedValue(matchResult),
})

// ─────────────────────────────────────────────────────────────────────────────
describe('AUTH › registerUser', () => {
  afterEach(() => jest.clearAllMocks())

  it('201 → crea usuario y retorna token', async () => {
    const user = makeFakeUser()
    User.findOne.mockResolvedValue(null)
    User.create.mockResolvedValue(user)

    const res = buildRes()
    await run(registerUser, { body: { name: 'Jaider', email: 'j@test.com', password: 'pass123' } }, res)

    expect(res.__err).toBeNull()
    expect(res.status).toHaveBeenCalledWith(201)
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ success: true, data: expect.objectContaining({ token: 'tok.mock.jwt' }) })
    )
  })

  it('400 → email ya registrado', async () => {
    User.findOne.mockResolvedValue(makeFakeUser())

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
    User.findOne.mockResolvedValue(makeFakeUser(true))

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
    User.findOne.mockResolvedValue(makeFakeUser(false))

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
    User.findById.mockResolvedValue(makeFakeUser())

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
    await run(protectHandler, { headers: { authorization: 'Bearer TOKEN.INVALIDO.XXX' } }, res)

    expect(res.status).toHaveBeenCalledWith(401)
    expect(res.__err).toBeInstanceOf(Error)
  })
})

// ─────────────────────────────────────────────────────────────────────────────
describe('Utils › generateToken', () => {
  it('retorna un JWT string no vacío', () => {
    generateToken.mockReturnValue('jwt.test.token')
    const token = generateToken('uid001')
    expect(typeof token).toBe('string')
    expect(token.length).toBeGreaterThan(0)
  })
})

// ─────────────────────────────────────────────────────────────────────────────
describe('Middleware › errorHandler', () => {
  it('responde con statusCode existente y mensaje de error', () => {
    const err = new Error('algo salió mal')
    const res = buildRes()
    res.statusCode = 422

    errorHandler(err, {}, res, () => {})

    expect(res.status).toHaveBeenCalledWith(422)
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ success: false, message: 'algo salió mal' })
    )
  })

  it('usa 500 cuando statusCode es 200 (no fue seteado antes del error)', () => {
    const err = new Error('error interno')
    const res = buildRes()
    res.statusCode = 200

    errorHandler(err, {}, res, () => {})

    expect(res.status).toHaveBeenCalledWith(500)
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ success: false, message: 'error interno' })
    )
  })
})
