/**
 * SUITE: Gestión de Productos
 * getProducts ahora llama .populate() → mock encadenado
 * getProductById: role 'admin' + producto ajeno → 403; role 'user' → 200
 */
import { jest } from '@jest/globals'

jest.unstable_mockModule('../src/models/Product.js', () => ({
  default: { create: jest.fn(), find: jest.fn(), findById: jest.fn() },
}))

const { createProduct, getProducts, getProductById, updateProduct, deleteProduct } =
  await import('../src/controllers/productController.js')
const { default: Product } = await import('../src/models/Product.js')

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

// Admin es dueño del producto
const adminUser  = { _id: 'owner123', role: 'admin' }
// Otro admin que NO es dueño
const otherAdmin = { _id: 'other456', role: 'admin' }
// Vendedor (puede ver todos los productos)
const vendorUser = { _id: 'vendor789', role: 'user' }

const fakeProduct = {
  _id:      'prod001',
  user:     { toString: () => 'owner123' },
  name:     'Camiseta',
  quantity: 10,
  price:    25000,
  save:     jest.fn(),
  deleteOne: jest.fn(),
}

// ── createProduct ─────────────────────────────────────────────────────────────
describe('PRODUCTS › createProduct', () => {
  afterEach(() => jest.clearAllMocks())

  it('201 → crea producto correctamente', async () => {
    Product.create.mockResolvedValue(fakeProduct)
    const res = buildRes()
    await run(createProduct, { body: { name: 'Camiseta', quantity: 10, price: 25000 }, user: adminUser }, res)

    expect(res.status).toHaveBeenCalledWith(201)
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: true }))
  })
})

// ── getProducts ───────────────────────────────────────────────────────────────
describe('PRODUCTS › getProducts', () => {
  afterEach(() => jest.clearAllMocks())

  it('200 → admin ve sus productos (con populate)', async () => {
    // find().populate() → array
    Product.find.mockReturnValue({
      populate: jest.fn().mockResolvedValue([fakeProduct]),
    })
    const res = buildRes()
    await run(getProducts, { user: adminUser }, res)

    expect(res.__err).toBeNull()
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: true, data: expect.any(Array) }))
  })

  it('200 → vendedor ve todos los productos (con populate)', async () => {
    Product.find.mockReturnValue({
      populate: jest.fn().mockResolvedValue([fakeProduct]),
    })
    const res = buildRes()
    await run(getProducts, { user: vendorUser }, res)

    expect(res.__err).toBeNull()
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: true, data: expect.any(Array) }))
  })
})

// ── getProductById ────────────────────────────────────────────────────────────
describe('PRODUCTS › getProductById', () => {
  afterEach(() => jest.clearAllMocks())

  it('200 → admin dueño ve su producto', async () => {
    Product.findById.mockResolvedValue(fakeProduct)
    const res = buildRes()
    await run(getProductById, { params: { id: 'prod001' }, user: adminUser }, res)

    expect(res.__err).toBeNull()
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: true }))
  })

  it('200 → vendedor puede ver cualquier producto', async () => {
    Product.findById.mockResolvedValue(fakeProduct)
    const res = buildRes()
    await run(getProductById, { params: { id: 'prod001' }, user: vendorUser }, res)

    expect(res.__err).toBeNull()
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: true }))
  })

  it('403 → admin diferente intenta ver producto ajeno', async () => {
    Product.findById.mockResolvedValue(fakeProduct)
    const res = buildRes()
    await run(getProductById, { params: { id: 'prod001' }, user: otherAdmin }, res)

    expect(res.status).toHaveBeenCalledWith(403)
    expect(res.__err).toBeInstanceOf(Error)
  })

  it('404 → producto no existe', async () => {
    Product.findById.mockResolvedValue(null)
    const res = buildRes()
    await run(getProductById, { params: { id: 'nonexistent' }, user: adminUser }, res)

    expect(res.status).toHaveBeenCalledWith(404)
    expect(res.__err).toBeInstanceOf(Error)
  })
})

// ── updateProduct ─────────────────────────────────────────────────────────────
describe('PRODUCTS › updateProduct', () => {
  afterEach(() => jest.clearAllMocks())

  it('200 → actualiza producto del dueño', async () => {
    const saveable = { ...fakeProduct, save: jest.fn().mockResolvedValue(fakeProduct) }
    Product.findById.mockResolvedValue(saveable)
    const res = buildRes()
    await run(updateProduct, { params: { id: 'prod001' }, body: { name: 'Nuevo' }, user: adminUser }, res)

    expect(saveable.save).toHaveBeenCalled()
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: true }))
  })

  it('403 → admin diferente intenta actualizar', async () => {
    Product.findById.mockResolvedValue(fakeProduct)
    const res = buildRes()
    await run(updateProduct, { params: { id: 'prod001' }, body: { name: 'Hack' }, user: otherAdmin }, res)

    expect(res.status).toHaveBeenCalledWith(403)
    expect(res.__err).toBeInstanceOf(Error)
  })

  it('404 → producto no encontrado', async () => {
    Product.findById.mockResolvedValue(null)
    const res = buildRes()
    await run(updateProduct, { params: { id: 'nope' }, body: {}, user: adminUser }, res)

    expect(res.status).toHaveBeenCalledWith(404)
    expect(res.__err).toBeInstanceOf(Error)
  })
})

// ── deleteProduct ─────────────────────────────────────────────────────────────
describe('PRODUCTS › deleteProduct', () => {
  afterEach(() => jest.clearAllMocks())

  it('200 → elimina producto del dueño', async () => {
    const deleteable = { ...fakeProduct, deleteOne: jest.fn().mockResolvedValue(true) }
    Product.findById.mockResolvedValue(deleteable)
    const res = buildRes()
    await run(deleteProduct, { params: { id: 'prod001' }, user: adminUser }, res)

    expect(deleteable.deleteOne).toHaveBeenCalled()
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: true }))
  })

  it('403 → admin diferente intenta eliminar', async () => {
    Product.findById.mockResolvedValue(fakeProduct)
    const res = buildRes()
    await run(deleteProduct, { params: { id: 'prod001' }, user: otherAdmin }, res)

    expect(res.status).toHaveBeenCalledWith(403)
    expect(res.__err).toBeInstanceOf(Error)
  })

  it('404 → producto no encontrado', async () => {
    Product.findById.mockResolvedValue(null)
    const res = buildRes()
    await run(deleteProduct, { params: { id: 'nonexistent' }, user: adminUser }, res)

    expect(res.status).toHaveBeenCalledWith(404)
    expect(res.__err).toBeInstanceOf(Error)
  })
})
