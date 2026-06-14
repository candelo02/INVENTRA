/**
 * SUITE: Movimientos — sin lógica de roles
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

const ownerUser = { _id: 'owner123' }
const otherUser = { _id: 'other456' }

const makeProduct = (qty = 20) => ({
  _id:      'prod001',
  user:     { toString: () => 'owner123' },
  name:     'Camiseta',
  quantity: qty,
  save:     jest.fn().mockResolvedValue(true),
})

const fakeMovement = {
  _id:      'mov001',
  product:  { _id: 'prod001', name: 'Camiseta' },
  user:     { _id: 'owner123', toString: () => 'owner123' },
  type:     'entrada',
  quantity: 5,
  note:     '',
}

const mockFindChain = (result) =>
  Movement.find.mockReturnValue({
    populate: jest.fn().mockReturnValue({
      populate: jest.fn().mockReturnValue({
        sort: jest.fn().mockResolvedValue(result),
      }),
    }),
  })

const mockFindByIdChain = (result) =>
  Movement.findById.mockReturnValue({
    populate: jest.fn().mockReturnValue({
      populate: jest.fn().mockResolvedValue(result),
    }),
  })

describe('MOVEMENTS › createMovement', () => {
  afterEach(() => jest.clearAllMocks())

  it('201 → entrada aumenta stock', async () => {
    const prod = makeProduct(10)
    Product.findById.mockResolvedValue(prod)
    Movement.create.mockResolvedValue(fakeMovement)

    const res = buildRes()
    await run(createMovement, { body: { productId: 'prod001', type: 'entrada', quantity: 5 }, user: ownerUser }, res)

    expect(res.__err).toBeNull()
    expect(prod.quantity).toBe(15)
    expect(res.status).toHaveBeenCalledWith(201)
  })

  it('201 → salida reduce stock', async () => {
    const prod = makeProduct(20)
    Product.findById.mockResolvedValue(prod)
    Movement.create.mockResolvedValue({ ...fakeMovement, type: 'salida', quantity: 8 })

    const res = buildRes()
    await run(createMovement, { body: { productId: 'prod001', type: 'salida', quantity: 8 }, user: ownerUser }, res)

    expect(res.__err).toBeNull()
    expect(prod.quantity).toBe(12)
    expect(res.status).toHaveBeenCalledWith(201)
  })

  it('400 → stock insuficiente', async () => {
    Product.findById.mockResolvedValue(makeProduct(3))

    const res = buildRes()
    await run(createMovement, { body: { productId: 'prod001', type: 'salida', quantity: 10 }, user: ownerUser }, res)

    expect(res.status).toHaveBeenCalledWith(400)
    expect(res.__err).toBeInstanceOf(Error)
  })

  it('403 → usuario diferente intenta mover producto ajeno', async () => {
    Product.findById.mockResolvedValue(makeProduct())

    const res = buildRes()
    await run(createMovement, { body: { productId: 'prod001', type: 'entrada', quantity: 5 }, user: otherUser }, res)

    expect(res.status).toHaveBeenCalledWith(403)
    expect(res.__err).toBeInstanceOf(Error)
  })

  it('404 → producto no existe', async () => {
    Product.findById.mockResolvedValue(null)

    const res = buildRes()
    await run(createMovement, { body: { productId: 'nope', type: 'entrada', quantity: 5 }, user: ownerUser }, res)

    expect(res.status).toHaveBeenCalledWith(404)
    expect(res.__err).toBeInstanceOf(Error)
  })
})

describe('MOVEMENTS › getMovements', () => {
  afterEach(() => jest.clearAllMocks())

  it('200 → devuelve movimientos del usuario', async () => {
    mockFindChain([fakeMovement])
    const res = buildRes()
    await run(getMovements, { user: ownerUser }, res)

    expect(res.__err).toBeNull()
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: true, data: expect.any(Array) }))
  })
})

describe('MOVEMENTS › getMovementById', () => {
  afterEach(() => jest.clearAllMocks())

  it('200 → devuelve movimiento al dueño', async () => {
    mockFindByIdChain(fakeMovement)
    const res = buildRes()
    await run(getMovementById, { params: { id: 'mov001' }, user: ownerUser }, res)

    expect(res.__err).toBeNull()
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: true }))
  })

  it('403 → usuario diferente intenta ver movimiento ajeno', async () => {
    mockFindByIdChain(fakeMovement)
    const res = buildRes()
    await run(getMovementById, { params: { id: 'mov001' }, user: otherUser }, res)

    expect(res.status).toHaveBeenCalledWith(403)
    expect(res.__err).toBeInstanceOf(Error)
  })

  it('404 → movimiento no encontrado', async () => {
    mockFindByIdChain(null)
    const res = buildRes()
    await run(getMovementById, { params: { id: 'nope' }, user: ownerUser }, res)

    expect(res.status).toHaveBeenCalledWith(404)
    expect(res.__err).toBeInstanceOf(Error)
  })
})
