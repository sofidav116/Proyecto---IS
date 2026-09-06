import jwt from "jsonwebtoken";
import { ApiError } from "../utils/ApiError.js";

// El login (auth.controller.js) firma un JWT real con { id, organizationId, rol }
// usando process.env.JWT_SECRET (o el fallback 'secret_key_demo'). Aquí lo
// verificamos y reconstruimos req.user a partir del payload del token —
// ya no dependemos del array en memoria de data/store.js ni del viejo
// formato "demo-token::<id>".
export function requireAuth(req, _res, next) {
  const header = req.headers.authorization || "";
  const [scheme, token] = header.split(" ");

  if (scheme !== "Bearer" || !token) {
    return next(new ApiError(401, "No autenticado. Falta el token Bearer."));
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET || "secret_key_demo");

    req.user = {
      id: payload.id,
      organizationId: payload.organizationId,
      // Normalizamos a "role" (inglés) porque así lo espera el resto del
      // backend (requireRole) y el frontend (user.role en AuthContext/App.jsx).
      role: payload.rol,
    };
    return next();
  } catch (err) {
    return next(new ApiError(401, "Token inválido o expirado."));
  }
}

// requireRole("admin") bloquea la ruta si el usuario logueado no tiene ese rol.
// Se usa DESPUÉS de requireAuth (necesita req.user ya poblado).
// Ej: router.post("/", requireAuth, requireRole("admin"), createFlow)
export function requireRole(...allowedRoles) {
  return (req, _res, next) => {
    if (!req.user) {
      return next(new ApiError(401, "No autenticado."));
    }
    if (!allowedRoles.includes(req.user.role)) {
      return next(new ApiError(403, "No tienes permiso para realizar esta acción."));
    }
    return next();
  };
}
