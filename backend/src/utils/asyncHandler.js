// Envuelve controladores async para no repetir try/catch en cada uno
export const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);
