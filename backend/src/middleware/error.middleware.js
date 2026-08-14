import { env } from "../config/env.js";
import { ApiError } from "../utils/ApiError.js";

export function notFoundHandler(req, _res, next) {
  next(new ApiError(404, `Ruta no encontrada: ${req.method} ${req.originalUrl}`));
}

// eslint-disable-next-line no-unused-vars
export function errorHandler(err, _req, res, _next) {
  const isApiError = err instanceof ApiError;
  const statusCode = isApiError ? err.statusCode : 500;
  const message = isApiError ? err.message : "Error interno del servidor";

  if (!isApiError) {
    console.error("[error]", err);
  }

  res.status(statusCode).json({
    error: {
      message,
      details: isApiError ? err.details : undefined,
      stack: env.nodeEnv === "development" && !isApiError ? err.stack : undefined,
    },
  });
}
