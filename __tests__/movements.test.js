/**
 * SUITE: Movimientos
 * - createMovement: admin con role correcto, vendedor solo salidas
 * - getMovements: doble populate().populate().sort()
 * - getMovementById: doble populate().populate(), acceso por role
 */
import { jest } from '@jest/globals'

jest.unstable_mockModule('../src/models/Product.js', () => ({
  default: { findById: jest.fn() },
}))

jest.unstable_mockModule('../src/models/Movement.js', () => ({
  default: { create: jest.fn(), find: jest.fn(), findById: jest.fn() },
}))

const { createMovement, getMovements, getMovementById } =
  await import('../src/controllers/movementController.js')
const { default: Product  } = await import('../src/models/Product.js')
const { default: Movement } = await import('../src/models/Movement.js')

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

const adminUser  = { _id: 'owner123', role: 'admin' }
const otherAdmin = { _id: 'other456', role: 'admin' }
const vendorUser = { _id: 'vendor789', role: 'user' }

const makeProduct = (qty = 20) => ({
  _id:      'prod001',
  user:     { toString: () => 'owner123' },
  name:     'Camiseta',
  quantity: qty,
  save:     jest.fn().mockResolvedValue(true),
})

// fakeMovement.user tiene _id para comparar con req.user._id
const fakeMovement = {
  _id:      'mov001',
  product:  { _id: 'prod001', name: 'Camiseta' },
  user:     { _id: 'owner123', toString: () => 'owner123', name: 'Admin' },
  type:     'entrada',
  quantity: 5,
  note:     '',
}

// Helper: mock de doble .populate().populate().sort()
const mockFindChain = (result) =>
  Movement.find.mockReturnValue({
    populate: jest.fn().mockReturnValue({
      populate: jest.fn().mockReturnValue({
        sort: jest.fn().mockResolvedValue(result),
      }),
    }),
  })

// Helper: mock de .findById().populate().populate()
const mockFindByIdChain = (result) =>
  Movement.findById.mockReturnValue({
    populate: jest.fn().mockReturnValue({
      populate: jest.fn().mockResolvedValue(result),
    }),
  })

// ── createMovement ────────────────────────────────────────────────────────────
describe('MOVEMENTS › createMovement', () => {
  afterEach(() => jest.clearAllMocks())

  it('201 → admin registra entrada aumenta stock', async () => {
    const prod = makeProduct(10)
    Product.findById.mockResolvedValue(prod)
    Movement.create.mockResolvedValue(fakeMovement)

    const res = buildRes()
    await run(createMovement, {
      body: { productId: 'prod001', type: 'entrada', quantity: 5 },
      user: adminUser,
    }, res)

    expect(res.__err).toBeNull()
    expect(prod.quantity).toBe(15)
    expect(prod.save).toHaveBeenCalled()
    expect(res.status).toHaveBeenCalledWith(201)
  })

  it('201 → vendedor registra salida reduce stock', async () => {
    const prod = makeProduct(20)
    Product.findById.mockResolvedValue(prod)
    Movement.create.mockResolvedValue({ ...fakeMovement, type: 'salida', quantity: 8 })

    const res = buildRes()
    await run(createMovement, {
      body: { productId: 'prod001', type: 'salida', quantity: 8 },
      user: vendorUser,
    }, res)

    expect(res.__err).toBeNull()
    expect(prod.quantity).toBe(12)
    expect(res.status).toHaveBeenCalledWith(201)
  })

  it('403 → vendedor intenta registrar entrada', async () => {
    const res = buildRes()
    await run(createMovement, {
      body: { productId: 'prod001', type: 'entrada', quantity: 5 },
      user: vendorUser,
    }, res)

    expect(res.status).toHaveBeenCalledWith(403)
    expect(res.__err).toBeInstanceOf(Error)
  })

  it('403 → admin intenta mover producto ajeno', async () => {
    Product.findById.mockResolvedValue(makeProduct())

    const res = buildRes()
    await run(createMovement, {
      body: { productId: 'prod001', type: 'entrada', quantity: 5 },
      user: otherAdmin,
    }, res)

    expect(res.status).toHaveBeenCalledWith(403)
    expect(res.__err).toBeInstanceOf(Error)
  })

  it('400 → stock insuficiente para salida', async () => {
    Product.findById.mockResolvedValue(makeProduct(3))

    const res = buildRes()
    await run(createMovement, {
      body: { productId: 'prod001', type: 'salida', quantity: 10 },
      user: vendorUser,
    }, res)

    expect(res.status).toHaveBeenCalledWith(400)
    expect(res.__err).toBeInstanceOf(Error)
  })

  it('404 → producto no existe', async () => {
    Product.findById.mockResolvedValue(null)

    const res = buildRes()
    await run(createMovement, {
      body: { productId: 'nope', type: 'salida', quantity: 5 },
      user: vendorUser,
    }, res)

    expect(res.status).toHaveBeenCalledWith(404)
    expect(res.__err).toBeInstanceOf(Error)
  })
})

// ── getMovements ──────────────────────────────────────────────────────────────
describe('MOVEMENTS › getMovements', () => {
  afterEach(() => jest.clearAllMocks())

  it('200 → admin ve todos los movimientos', async () => {
    mockFindChain([fakeMovement])
    const res = buildRes()
    await run(getMovements, { user: adminUser }, res)

    expect(res.__err).toBeNull()
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ success: true, data: expect.any(Array) })
    )
  })

  it('200 → vendedor ve solo sus movimientos', async () => {
    mockFindChain([fakeMovement])
    const res = buildRes()
    await run(getMovements, { user: vendorUser }, res)

    expect(res.__err).toBeNull()
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ success: true, data: expect.any(Array) })
    )
  })
})

// ── getMovementById ───────────────────────────────────────────────────────────
describe('MOVEMENTS › getMovementById', () => {
  afterEach(() => jest.clearAllMocks())

  it('200 → admin ve cualquier movimiento', async () => {
    mockFindByIdChain(fakeMovement)
    const res = buildRes()
    await run(getMovementById, { params: { id: 'mov001' }, user: adminUser }, res)

    expect(res.__err).toBeNull()
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: true }))
  })

  it('200 → vendedor ve su propio movimiento', async () => {
    // movimiento cuyo user._id coincide con vendorUser._id
    const vendorMovement = { ...fakeMovement, user: { _id: 'vendor789', toString: () => 'vendor789' } }
    mockFindByIdChain(vendorMovement)
    const res = buildRes()
    await run(getMovementById, { params: { id: 'mov001' }, user: vendorUser }, res)

    expect(res.__err).toBeNull()
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: true }))
  })

  it('403 → vendedor intenta ver movimiento ajeno', async () => {
    mockFindByIdChain(fakeMovement) // user._id = 'owner123', vendorUser._id = 'vendor789'
    const res = buildRes()
    await run(getMovementById, { params: { id: 'mov001' }, user: vendorUser }, res)

    expect(res.status).toHaveBeenCalledWith(403)
    expect(res.__err).toBeInstanceOf(Error)
  })

  it('404 → movimiento no encontrado', async () => {
    mockFindByIdChain(null)
    const res = buildRes()
    await run(getMovementById, { params: { id: 'nope' }, user: adminUser }, res)

    expect(res.status).toHaveBeenCalledWith(404)
    expect(res.__err).toBeInstanceOf(Error)
  })
})
