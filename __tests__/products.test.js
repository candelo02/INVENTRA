/**
 * SUITE: Gestión de Productos
 * Cubre: createProduct, getProducts, getProductById, updateProduct, deleteProduct
 */

import { jest } from '@jest/globals'

jest.unstable_mockModule('../src/models/Product.js', () => ({
  default: { create: jest.fn(), find: jest.fn(), findById: jest.fn() },
}))

const { createProduct, getProducts, getProductById, updateProduct, deleteProduct } =
  await import('../src/controllers/productController.js')
const { default: Product } = await import('../src/models/Product.js')

// ── Helper: simula asyncHandler capturando throw → next(err) ──────────────────
const run = (controller, req, res) =>
  new Promise((resolve) => {
    const next = (err) => { res.__err = err; resolve({ err }) }
    Promise.resolve(controller(req, res, next))
      .then(() => resolve({}))
      .catch((err) => { next(err); resolve({ err }) })
  })

const buildRes = () => {
  const res = { statusCode: 200, __err: null }
  res.status = jest.fn((code) => { res.statusCode = code; return res })
  res.json   = jest.fn().mockReturnValue(res)
  return res
}

const ownerUser = { _id: 'owner123' }
const otherUser = { _id: 'other456' }

const fakeProduct = {
  _id: 'prod001',
  user: { toString: () => 'owner123' },
  name: 'Camiseta',
  quantity: 10,
  price: 25000,
  save: jest.fn(),
  deleteOne: jest.fn(),
}

// ─────────────────────────────────────────────────────────────────────────────
describe('PRODUCTS › createProduct', () => {
  afterEach(() => jest.clearAllMocks())

  it('201 → crea producto correctamente', async () => {
    Product.create.mockResolvedValue(fakeProduct)
    const res = buildRes()
    await run(createProduct, { body: { name: 'Camiseta', quantity: 10, price: 25000 }, user: ownerUser }, res)

    expect(res.status).toHaveBeenCalledWith(201)
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: true }))
  })
})

describe('PRODUCTS › getProducts', () => {
  afterEach(() => jest.clearAllMocks())

  it('200 → devuelve lista de productos del usuario', async () => {
    Product.find.mockResolvedValue([fakeProduct])
    const res = buildRes()
    await run(getProducts, { user: ownerUser }, res)

    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: true, data: expect.any(Array) }))
  })
})

describe('PRODUCTS › getProductById', () => {
  afterEach(() => jest.clearAllMocks())

  it('200 → devuelve producto al dueño', async () => {
    Product.findById.mockResolvedValue(fakeProduct)
    const res = buildRes()
    await run(getProductById, { params: { id: 'prod001' }, user: ownerUser }, res)

    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: true }))
  })

  it('403 → usuario diferente intenta acceder', async () => {
    Product.findById.mockResolvedValue(fakeProduct)
    const res = buildRes()
    await run(getProductById, { params: { id: 'prod001' }, user: otherUser }, res)

    expect(res.status).toHaveBeenCalledWith(403)
    expect(res.__err).toBeInstanceOf(Error)
  })

  it('404 → producto no existe', async () => {
    Product.findById.mockResolvedValue(null)
    const res = buildRes()
    await run(getProductById, { params: { id: 'nonexistent' }, user: ownerUser }, res)

    expect(res.status).toHaveBeenCalledWith(404)
    expect(res.__err).toBeInstanceOf(Error)
  })
})

describe('PRODUCTS › updateProduct', () => {
  afterEach(() => jest.clearAllMocks())

  it('200 → actualiza producto del dueño', async () => {
    const saveable = { ...fakeProduct, save: jest.fn().mockResolvedValue(fakeProduct) }
    Product.findById.mockResolvedValue(saveable)
    const res = buildRes()
    await run(updateProduct, { params: { id: 'prod001' }, body: { name: 'Nuevo' }, user: ownerUser }, res)

    expect(saveable.save).toHaveBeenCalled()
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: true }))
  })

  it('403 → usuario sin permiso intenta actualizar', async () => {
    Product.findById.mockResolvedValue(fakeProduct)
    const res = buildRes()
    await run(updateProduct, { params: { id: 'prod001' }, body: { name: 'Hack' }, user: otherUser }, res)

    expect(res.status).toHaveBeenCalledWith(403)
    expect(res.__err).toBeInstanceOf(Error)
  })

  it('404 → producto no encontrado al actualizar', async () => {
    Product.findById.mockResolvedValue(null)
    const res = buildRes()
    await run(updateProduct, { params: { id: 'nope' }, body: {}, user: ownerUser }, res)

    expect(res.status).toHaveBeenCalledWith(404)
    expect(res.__err).toBeInstanceOf(Error)
  })
})

describe('PRODUCTS › deleteProduct', () => {
  afterEach(() => jest.clearAllMocks())

  it('200 → elimina producto del dueño', async () => {
    const deleteable = { ...fakeProduct, deleteOne: jest.fn().mockResolvedValue(true) }
    Product.findById.mockResolvedValue(deleteable)
    const res = buildRes()
    await run(deleteProduct, { params: { id: 'prod001' }, user: ownerUser }, res)

    expect(deleteable.deleteOne).toHaveBeenCalled()
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: true }))
  })

  it('403 → usuario sin permiso intenta eliminar', async () => {
    Product.findById.mockResolvedValue(fakeProduct)
    const res = buildRes()
    await run(deleteProduct, { params: { id: 'prod001' }, user: otherUser }, res)

    expect(res.status).toHaveBeenCalledWith(403)
    expect(res.__err).toBeInstanceOf(Error)
  })

  it('404 → producto no encontrado', async () => {
    Product.findById.mockResolvedValue(null)
    const res = buildRes()
    await run(deleteProduct, { params: { id: 'nonexistent' }, user: ownerUser }, res)

    expect(res.status).toHaveBeenCalledWith(404)
    expect(res.__err).toBeInstanceOf(Error)
  })
})
