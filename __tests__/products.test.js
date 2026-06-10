/**
 * SUITE: Gestión de Productos
 * Cubre: createProduct, getProducts, getProductById, updateProduct, deleteProduct
 * Módulos críticos: 401 (sin auth), 403 (sin permiso sobre recurso), 404
 */

import { jest } from '@jest/globals';

jest.unstable_mockModule('../src/models/Product.js', () => ({
  default: {
    create: jest.fn(),
    find: jest.fn(),
    findById: jest.fn(),
  },
}));

const {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct,
} = await import('../src/controllers/productController.js');

const ProductModule = await import('../src/models/Product.js');
const Product = ProductModule.default;

const buildRes = () => {
  const res = { statusCode: 200 };
  res.status = jest.fn((code) => { res.statusCode = code; return res; });
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

const ownerUser = { _id: 'owner123' };
const otherUser = { _id: 'other456' };

const fakeProduct = {
  _id: 'prod001',
  user: { toString: () => 'owner123' },
  name: 'Camiseta',
  quantity: 10,
  price: 25000,
  save: jest.fn(),
  deleteOne: jest.fn(),
};

// ─────────────────────────────────────────────────────────────────────────────
describe('PRODUCTS › createProduct', () => {
  afterEach(() => jest.clearAllMocks());

  it('201 → crea producto correctamente', async () => {
    Product.create.mockResolvedValue(fakeProduct);
    const req = { body: { name: 'Camiseta', quantity: 10, price: 25000 }, user: ownerUser };
    const res = buildRes();

    await createProduct(req, res, jest.fn());

    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: true }));
  });
});

describe('PRODUCTS › getProducts', () => {
  afterEach(() => jest.clearAllMocks());

  it('200 → devuelve lista de productos del usuario', async () => {
    Product.find.mockResolvedValue([fakeProduct]);
    const req = { user: ownerUser };
    const res = buildRes();

    await getProducts(req, res, jest.fn());

    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ success: true, data: expect.any(Array) })
    );
  });
});

describe('PRODUCTS › getProductById', () => {
  afterEach(() => jest.clearAllMocks());

  it('200 → devuelve producto al dueño', async () => {
    Product.findById.mockResolvedValue(fakeProduct);
    const req = { params: { id: 'prod001' }, user: ownerUser };
    const res = buildRes();

    await getProductById(req, res, jest.fn());

    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: true }));
  });

  it('403 → usuario diferente intenta acceder', async () => {
    Product.findById.mockResolvedValue(fakeProduct);
    const req = { params: { id: 'prod001' }, user: otherUser };
    const res = buildRes();
    const next = jest.fn();

    await getProductById(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(next).toHaveBeenCalledWith(expect.any(Error));
  });

  it('404 → producto no existe', async () => {
    Product.findById.mockResolvedValue(null);
    const req = { params: { id: 'nonexistent' }, user: ownerUser };
    const res = buildRes();
    const next = jest.fn();

    await getProductById(req, res, next);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(next).toHaveBeenCalledWith(expect.any(Error));
  });
});

describe('PRODUCTS › updateProduct', () => {
  afterEach(() => jest.clearAllMocks());

  it('200 → actualiza producto del dueño', async () => {
    const saveable = { ...fakeProduct, save: jest.fn().mockResolvedValue(fakeProduct) };
    Product.findById.mockResolvedValue(saveable);

    const req = { params: { id: 'prod001' }, body: { name: 'Nuevo Nombre' }, user: ownerUser };
    const res = buildRes();

    await updateProduct(req, res, jest.fn());

    expect(saveable.save).toHaveBeenCalled();
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: true }));
  });

  it('403 → usuario sin permiso intenta actualizar', async () => {
    Product.findById.mockResolvedValue(fakeProduct);
    const req = { params: { id: 'prod001' }, body: { name: 'Hack' }, user: otherUser };
    const res = buildRes();
    const next = jest.fn();

    await updateProduct(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(next).toHaveBeenCalledWith(expect.any(Error));
  });
});

describe('PRODUCTS › deleteProduct', () => {
  afterEach(() => jest.clearAllMocks());

  it('200 → elimina producto del dueño', async () => {
    const deleteable = { ...fakeProduct, deleteOne: jest.fn().mockResolvedValue(true) };
    Product.findById.mockResolvedValue(deleteable);

    const req = { params: { id: 'prod001' }, user: ownerUser };
    const res = buildRes();

    await deleteProduct(req, res, jest.fn());

    expect(deleteable.deleteOne).toHaveBeenCalled();
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: true }));
  });

  it('403 → usuario sin permiso intenta eliminar', async () => {
    Product.findById.mockResolvedValue(fakeProduct);
    const req = { params: { id: 'prod001' }, user: otherUser };
    const res = buildRes();
    const next = jest.fn();

    await deleteProduct(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(next).toHaveBeenCalledWith(expect.any(Error));
  });

  it('404 → producto no encontrado', async () => {
    Product.findById.mockResolvedValue(null);
    const req = { params: { id: 'nonexistent' }, user: ownerUser };
    const res = buildRes();
    const next = jest.fn();

    await deleteProduct(req, res, next);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(next).toHaveBeenCalledWith(expect.any(Error));
  });
});
