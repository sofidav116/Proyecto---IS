import { users } from "../data/store.js";
import { ApiError } from "../utils/ApiError.js";

// Nota: esto es un placeholder simple mientras solo tenemos Express.
// Más adelante se reemplaza por JWT real (jsonwebtoken) + hashing (bcrypt) + PostgreSQL.
// Por ahora el "token" es `demo-token::<userId>` generado en el login.

export function requireAuth(req, _res, next) {
  const header = req.headers.authorization || "";
  const [scheme, token] = header.split(" ");

  if (scheme !== "Bearer" || !token || !token.startsWith("demo-token::")) {
    return next(new ApiError(401, "No autenticado. Falta el token Bearer."));
  }

  const userId = token.split("::")[1];
  const user = users.find((u) => u.id === userId);

  if (!user) {
    return next(new ApiError(401, "Token inválido."));
  }

  req.user = {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    organizationId: user.organizationId,
  };
  return next();
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
