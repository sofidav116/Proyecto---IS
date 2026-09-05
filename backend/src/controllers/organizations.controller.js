import { organizations, generateOrgId } from "../data/store.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

// GET /api/organizations/me
// Devuelve la organización del usuario logueado (admin o usuario normal).
export const getMyOrganization = asyncHandler(async (req, res) => {
  const org = organizations.find((o) => o.id === req.user.organizationId);
  if (!org) throw new ApiError(404, "Organización no encontrada.");
  res.json({ organization: org });
});

// POST /api/organizations  (solo admin, vía requireRole en la ruta)
// Crea una organización nueva con su jerarquía. Esa jerarquía es la que luego
// se le pasa a Vertex AI como contexto para generar flujos específicos (Fase 3).
export const createOrganization = asyncHandler(async (req, res) => {
  const { nombre, tipo_industria = "General", jerarquia = [] } = req.body;

  if (!nombre) throw new ApiError(400, "El campo 'nombre' es requerido.");
  if (!Array.isArray(jerarquia) || jerarquia.length === 0) {
    throw new ApiError(400, "'jerarquia' debe ser un arreglo con al menos un nivel (ej: ['Empleado','Gerencia']).");
  }

  const organization = {
    id: generateOrgId(),
    nombre,
    tipo_industria,
    jerarquia,
  };

  organizations.push(organization);
  res.status(201).json({ organization });
});

// PUT /api/organizations/me/jerarquia  (solo admin)
// Permite ajustar la jerarquía de la propia organización sin crear una nueva.
export const updateMyHierarchy = asyncHandler(async (req, res) => {
  const { jerarquia } = req.body;
  if (!Array.isArray(jerarquia) || jerarquia.length === 0) {
    throw new ApiError(400, "'jerarquia' debe ser un arreglo con al menos un nivel.");
  }

  const org = organizations.find((o) => o.id === req.user.organizationId);
  if (!org) throw new ApiError(404, "Organización no encontrada.");

  org.jerarquia = jerarquia;
  res.json({ organization: org });
});
