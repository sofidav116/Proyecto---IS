import { users } from "../data/store.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

// POST /api/auth/login
export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new ApiError(400, "Correo y contraseña son requeridos.");
  }

  const user = users.find((u) => u.email.toLowerCase() === String(email).toLowerCase());

  if (!user || user.password !== password) {
    throw new ApiError(401, "Correo o contraseña incorrectos.");
  }

  // Nota: token de demostración. Se reemplaza por JWT firmado cuando conectemos
  // jsonwebtoken + bcrypt + PostgreSQL.
  const token = `demo-token::${user.id}`;

  res.json({
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      organizationId: user.organizationId,
    },
  });
});

// GET /api/auth/me
export const me = asyncHandler(async (req, res) => {
  res.json({ user: req.user });
});
