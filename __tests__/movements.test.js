/**
 * SUITE: Movimientos de Inventario
 * Cubre: createMovement, getMovements, getMovementById
 * Módulos críticos: 403 (recurso ajeno), 404, flujo de stock
 */

import { jest } from '@jest/globals';

jest.unstable_mockModule('../src/models/Product.js', () => ({
  default: { findById: jest.fn() },
}));

jest.unstable_mockModule('../src/models/Movement.js', () => ({
  default: {
    create: jest.fn(),
    find: jest.fn(),
    findById: jest.fn(),
  },
}));

const { createMovement, getMovements, getMovementById } = await import(
  '../src/controllers/movementController.js'
);
const ProductModule = await import('../src/models/Product.js');
const MovementModule = await import('../src/models/Movement.js');
const Product = ProductModule.default;
const Movement = MovementModule.default;

const buildRes = () => {
  const res = { statusCode: 200 };
  res.status = jest.fn((code) => { res.statusCode = code; return res; });
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

const ownerUser = { _id: 'owner123' };
const otherUser = { _id: 'other456' };

const makeProduct = (qty = 20) => ({
  _id: 'prod001',
  user: { toString: () => 'owner123' },
  name: 'Camiseta',
  quantity: qty,
  save: jest.fn().mockResolvedValue(true),
});

const fakeMovement = {
  _id: 'mov001',
  product: { _id: 'prod001', name: 'Camiseta' },
  user: { toString: () => 'owner123' },
  type: 'entrada',
  quantity: 5,
  note: '',
  populate: jest.fn().mockReturnThis(),
};

// ─────────────────────────────────────────────────────────────────────────────
describe('MOVEMENTS › createMovement', () => {
  afterEach(() => jest.clearAllMocks());

  it('201 → entrada aumenta stock', async () => {
    const prod = makeProduct(10);
    Product.findById.mockResolvedValue(prod);
    Movement.create.mockResolvedValue({ ...fakeMovement, type: 'entrada', quantity: 5 });

    const req = {
      body: { productId: 'prod001', type: 'entrada', quantity: 5 },
      user: ownerUser,
    };
    const res = buildRes();

    await createMovement(req, res, jest.fn());

    expect(prod.quantity).toBe(15);
    expect(prod.save).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(201);
  });

  it('201 → salida reduce stock', async () => {
    const prod = makeProduct(20);
    Product.findById.mockResolvedValue(prod);
    Movement.create.mockResolvedValue({ ...fakeMovement, type: 'salida', quantity: 8 });

    const req = {
      body: { productId: 'prod001', type: 'salida', quantity: 8 },
      user: ownerUser,
    };
    const res = buildRes();

    await createMovement(req, res, jest.fn());

    expect(prod.quantity).toBe(12);
    expect(res.status).toHaveBeenCalledWith(201);
  });

  it('400 → stock insuficiente para salida', async () => {
    const prod = makeProduct(3);
    Product.findById.mockResolvedValue(prod);

    const req = {
      body: { productId: 'prod001', type: 'salida', quantity: 10 },
      user: ownerUser,
    };
    const res = buildRes();
    const next = jest.fn();

    await createMovement(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(next).toHaveBeenCalledWith(expect.any(Error));
  });

  it('403 → usuario ajeno intenta registrar movimiento', async () => {
    Product.findById.mockResolvedValue(makeProduct());

    const req = {
      body: { productId: 'prod001', type: 'entrada', quantity: 5 },
      user: otherUser,
    };
    const res = buildRes();
    const next = jest.fn();

    await createMovement(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(next).toHaveBeenCalledWith(expect.any(Error));
  });

  it('404 → producto no existe', async () => {
    Product.findById.mockResolvedValue(null);

    const req = {
      body: { productId: 'nonexistent', type: 'entrada', quantity: 5 },
      user: ownerUser,
    };
    const res = buildRes();
    const next = jest.fn();

    await createMovement(req, res, next);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(next).toHaveBeenCalledWith(expect.any(Error));
  });
});

// ─────────────────────────────────────────────────────────────────────────────
describe('MOVEMENTS › getMovements', () => {
  afterEach(() => jest.clearAllMocks());

  it('200 → devuelve movimientos del usuario', async () => {
    const chainable = { sort: jest.fn().mockResolvedValue([fakeMovement]) };
    const populatable = { populate: jest.fn().mockReturnValue(chainable) };
    Movement.find.mockReturnValue(populatable);

    const req = { user: ownerUser };
    const res = buildRes();

    await getMovements(req, res, jest.fn());

    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ success: true, data: expect.any(Array) })
    );
  });
});

// ─────────────────────────────────────────────────────────────────────────────
describe('MOVEMENTS › getMovementById', () => {
  afterEach(() => jest.clearAllMocks());

  it('200 → devuelve movimiento al dueño', async () => {
    const chainable = { populate: jest.fn().mockResolvedValue(fakeMovement) };
    Movement.findById.mockReturnValue(chainable);

    const req = { params: { id: 'mov001' }, user: ownerUser };
    const res = buildRes();

    await getMovementById(req, res, jest.fn());

    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: true }));
  });

  it('403 → usuario ajeno intenta ver movimiento', async () => {
    const chainable = { populate: jest.fn().mockResolvedValue(fakeMovement) };
    Movement.findById.mockReturnValue(chainable);

    const req = { params: { id: 'mov001' }, user: otherUser };
    const res = buildRes();
    const next = jest.fn();

    await getMovementById(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(next).toHaveBeenCalledWith(expect.any(Error));
  });

  it('404 → movimiento no encontrado', async () => {
    const chainable = { populate: jest.fn().mockResolvedValue(null) };
    Movement.findById.mockReturnValue(chainable);

    const req = { params: { id: 'nonexistent' }, user: ownerUser };
    const res = buildRes();
    const next = jest.fn();

    await getMovementById(req, res, next);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(next).toHaveBeenCalledWith(expect.any(Error));
  });
});
