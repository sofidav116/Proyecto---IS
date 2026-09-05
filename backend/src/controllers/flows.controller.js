import { flows, generateFlowId } from "../data/store.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

// GET /api/flows
// Un usuario (admin o normal) solo ve los flujos DE SU organización.
export const listFlows = asyncHandler(async (req, res) => {
  const orgFlows = flows.filter((f) => f.organizationId === req.user.organizationId);
  res.json({ flows: orgFlows });
});

// GET /api/flows/:id
export const getFlow = asyncHandler(async (req, res) => {
  const flow = flows.find((f) => f.id === req.params.id);
  if (!flow) throw new ApiError(404, "Flujo no encontrado.");
  if (flow.organizationId !== req.user.organizationId) {
    throw new ApiError(403, "Este flujo no pertenece a tu organización.");
  }
  res.json({ flow });
});

// POST /api/flows  (crea/guarda un flujo, ej. después de generarlo con IA)
// Ya pasó por requireRole("admin") en la ruta, así que solo un admin llega aquí.
export const createFlow = asyncHandler(async (req, res) => {
  const {
    nombre,
    pasos = 0,
    estado = "Borrador",
    nodes = [],
    edges = [],
    aiInsight = null,
    tipo = "especifico", // "general" | "especifico" — ver Fase 3
  } = req.body;

  if (!nombre) throw new ApiError(400, "El campo 'nombre' es requerido.");

  const today = new Date();
  const fecha = today.toLocaleDateString("es-GT", { day: "2-digit", month: "2-digit", year: "numeric" });

  const flow = {
    id: generateFlowId(),
    nombre,
    fecha,
    pasos: pasos || nodes.length,
    estado,
    nodes,
    edges,
    aiInsight,
    tipo,
    ownerId: req.user.id,
    organizationId: req.user.organizationId,
  };

  flows.push(flow);
  res.status(201).json({ flow });
});

// PUT /api/flows/:id
export const updateFlow = asyncHandler(async (req, res) => {
  const flow = flows.find((f) => f.id === req.params.id);
  if (!flow) throw new ApiError(404, "Flujo no encontrado.");
  if (flow.organizationId !== req.user.organizationId) {
    throw new ApiError(403, "Este flujo no pertenece a tu organización.");
  }

  Object.assign(flow, req.body, { id: flow.id, organizationId: flow.organizationId });
  res.json({ flow });
});

// DELETE /api/flows/:id
export const deleteFlow = asyncHandler(async (req, res) => {
  const index = flows.findIndex((f) => f.id === req.params.id);
  if (index === -1) throw new ApiError(404, "Flujo no encontrado.");
  if (flows[index].organizationId !== req.user.organizationId) {
    throw new ApiError(403, "Este flujo no pertenece a tu organización.");
  }

  flows.splice(index, 1);
  res.status(204).send();
});
