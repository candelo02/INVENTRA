/**
 * SUITE: Autenticación
 * registerUser eliminado — reemplazado por setupAdmin y loginUser
 */
import { jest } from '@jest/globals'

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

const { setupAdmin, loginUser, getUserProfile } =
  await import('../src/controllers/authController.js')
const { protectHandler } =
  await import('../src/middleware/authMiddleware.js')
const { errorHandler } =
  await import('../src/middleware/errorMiddleware.js')
const { default: generateToken } =
  await import('../src/utils/generateToken.js')
const { default: User } = await import('../src/models/User.js')

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
  res.setHeader = jest.fn()
  return res
}

const makeFakeUser = (matchResult = true) => ({
  _id:           'uid001',
  name:          'Admin',
  email:         'admin@test.com',
  role:          'admin',
  createdAt:     '2024-01-01',
  matchPassword: jest.fn().mockResolvedValue(matchResult),
})

// ── setupAdmin ────────────────────────────────────────────────────────────────
describe('AUTH › setupAdmin', () => {
  afterEach(() => jest.clearAllMocks())

  it('201 → crea primer admin si no existe ninguno', async () => {
    User.findOne.mockResolvedValue(null)
    User.create.mockResolvedValue(makeFakeUser())

    const res = buildRes()
    await run(setupAdmin, { body: { name: 'Admin', email: 'admin@test.com', password: 'pass123' } }, res)

    expect(res.__err).toBeNull()
    expect(res.status).toHaveBeenCalledWith(201)
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ success: true, data: expect.objectContaining({ token: 'tok.mock.jwt' }) })
    )
  })

  it('403 → ya existe un admin en el sistema', async () => {
    User.findOne.mockResolvedValue(makeFakeUser())

    const res = buildRes()
    await run(setupAdmin, { body: { name: 'X', email: 'x@test.com', password: 'pass123' } }, res)

    expect(res.status).toHaveBeenCalledWith(403)
    expect(res.__err).toBeInstanceOf(Error)
  })
})

// ── loginUser ─────────────────────────────────────────────────────────────────
describe('AUTH › loginUser', () => {
  afterEach(() => jest.clearAllMocks())

  it('200 → login exitoso retorna token', async () => {
    User.findOne.mockResolvedValue(makeFakeUser(true))

    const res = buildRes()
    await run(loginUser, { body: { email: 'admin@test.com', password: 'pass123' } }, res)

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
    await run(loginUser, { body: { email: 'admin@test.com', password: 'mala' } }, res)

    expect(res.status).toHaveBeenCalledWith(401)
    expect(res.__err).toBeInstanceOf(Error)
  })
})

// ── getUserProfile ────────────────────────────────────────────────────────────
describe('AUTH › getUserProfile', () => {
  afterEach(() => jest.clearAllMocks())

  it('200 → retorna perfil del usuario autenticado', async () => {
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

// ── protectHandler ────────────────────────────────────────────────────────────
describe('AUTH Middleware › protectHandler', () => {
  afterEach(() => jest.clearAllMocks())

  it('401 → sin header Authorization', async () => {
    const res = buildRes()
    await run(protectHandler, { headers: {} }, res)

    expect(res.status).toHaveBeenCalledWith(401)
    expect(res.__err).toBeInstanceOf(Error)
  })

  it('401 → token malformado', async () => {
    const res = buildRes()
    await run(protectHandler, { headers: { authorization: 'Bearer TOKEN.INVALIDO.XXX' } }, res)

    expect(res.status).toHaveBeenCalledWith(401)
    expect(res.__err).toBeInstanceOf(Error)
  })
})

// ── generateToken ─────────────────────────────────────────────────────────────
describe('Utils › generateToken', () => {
  it('retorna string no vacío', () => {
    generateToken.mockReturnValue('jwt.test.token')
    const token = generateToken('uid001')
    expect(typeof token).toBe('string')
    expect(token.length).toBeGreaterThan(0)
  })
})

// ── errorHandler ──────────────────────────────────────────────────────────────
describe('Middleware › errorHandler', () => {
  it('responde con statusCode y mensaje', () => {
    const err = new Error('algo salió mal')
    const res = buildRes()
    res.statusCode = 422
    errorHandler(err, { method: 'POST', originalUrl: '/test' }, res, () => {})

    expect(res.status).toHaveBeenCalledWith(422)
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: false }))
  })

  it('usa 500 cuando statusCode es 200', () => {
    const err = new Error('error interno')
    const res = buildRes()
    res.statusCode = 200
    errorHandler(err, { method: 'GET', originalUrl: '/test' }, res, () => {})

    expect(res.status).toHaveBeenCalledWith(500)
  })
})
