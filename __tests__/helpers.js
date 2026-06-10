/**
 * Helper: crea un mock de res compatible con Express
 */
export const mockRes = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  res.statusCode = 200;
  return res;
};

/**
 * Helper: crea un mock básico de req
 */
export const mockReq = (overrides = {}) => ({
  body: {},
  params: {},
  headers: {},
  user: null,
  ...overrides,
});
