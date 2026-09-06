import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import pool from '../config/db.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';

function signToken(user) {
  return jwt.sign(
    { id: user.id, organizationId: user.organizationId, rol: user.rol },
    process.env.JWT_SECRET || 'secret_key_demo',
    { expiresIn: '8h' }
  );
}

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new ApiError(400, "Email y contraseña son requeridos.");
  }

  const result = await pool.query(
    `SELECT id, nombre, email, password_hash, rol, organizacion_id AS "organizationId"
     FROM usuarios WHERE email = $1`,
    [email]
  );

  if (result.rows.length === 0) {
    throw new ApiError(401, "Credenciales inválidas.");
  }

  const user = result.rows[0];
  const validPassword = await bcrypt.compare(password, user.password_hash);

  if (!validPassword) {
    throw new ApiError(401, "Credenciales inválidas.");
  }

  const token = signToken(user);

  res.json({
    token,
    user: {
      id: user.id,
      nombre: user.nombre,
      email: user.email,
      // "role" (inglés) es el nombre que usa todo el frontend
      // (App.jsx, AppShell.jsx, MisFlujos.jsx, Configuracion.jsx) para
      // decidir qué mostrar/permitir según el rol del usuario logueado.
      role: user.rol,
      organizationId: user.organizationId,
    },
  });
});

// POST /api/auth/register
// El frontend (AuthContext.jsx) manda { nombre_completo, username, email, password }.
// "username" no existe como columna en la tabla usuarios (solo nombre/email),
// así que se ignora aquí — solo se guarda el nombre completo.
// Todo usuario que se registra solo (sin invitación de un admin) entra con
// rol "usuario" y se asigna a la primera organización existente, porque este
// proyecto todavía no tiene una pantalla para elegir/crear organización al
// registrarse.
export const register = asyncHandler(async (req, res) => {
  const { nombre_completo, nombre, email, password } = req.body;
  const nombreFinal = nombre_completo || nombre;

  if (!nombreFinal || !email || !password) {
    throw new ApiError(400, "Nombre, correo y contraseña son requeridos.");
  }

  const existing = await pool.query(`SELECT id FROM usuarios WHERE email = $1`, [email]);
  if (existing.rows.length > 0) {
    throw new ApiError(409, "Ya existe una cuenta con ese correo.");
  }

  const orgResult = await pool.query(
    `SELECT id FROM organizaciones ORDER BY creado_en ASC LIMIT 1`
  );
  if (orgResult.rows.length === 0) {
    throw new ApiError(
      500,
      "No hay ninguna organización creada todavía. Pide a un administrador que cree una antes de registrarte."
    );
  }
  const organizacionId = orgResult.rows[0].id;

  const passwordHash = await bcrypt.hash(password, 10);

  const insertResult = await pool.query(
    `INSERT INTO usuarios (nombre, email, password_hash, rol, organizacion_id)
     VALUES ($1, $2, $3, 'usuario', $4)
     RETURNING id, nombre, email, rol, organizacion_id AS "organizationId"`,
    [nombreFinal, email, passwordHash, organizacionId]
  );

  const user = insertResult.rows[0];
  const token = signToken(user);

  res.status(201).json({
    token,
    user: {
      id: user.id,
      nombre: user.nombre,
      email: user.email,
      role: user.rol,
      organizationId: user.organizationId,
    },
  });
});

// Devuelve los datos del usuario autenticado actual
export const me = asyncHandler(async (req, res) => {
  res.json({ user: req.user });
});