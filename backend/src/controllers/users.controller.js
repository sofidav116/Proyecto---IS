import { users } from "../data/store.js";
import { asyncHandler } from "../utils/asyncHandler.js";

// GET /api/users  (equipo, para la pantalla de Configuración)
export const listUsers = asyncHandler(async (_req, res) => {
  const safeUsers = users.map(({ id, name, email, role }) => ({ id, name, email, role }));
  res.json({ users: safeUsers });
});
