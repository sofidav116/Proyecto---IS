import { flows, generateFlowId } from "../data/store.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

// GET /api/flows
export const listFlows = asyncHandler(async (_req, res) => {
  res.json({ flows });
});

// GET /api/flows/:id
export const getFlow = asyncHandler(async (req, res) => {
  const flow = flows.find((f) => f.id === req.params.id);
  if (!flow) throw new ApiError(404, "Flujo no encontrado.");
  res.json({ flow });
});

// POST /api/flows  (crea/guarda un flujo, ej. después de generarlo con IA)
export const createFlow = asyncHandler(async (req, res) => {
  const { nombre, pasos = 0, estado = "Borrador", nodes = [], edges = [], aiInsight = null } = req.body;

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
    ownerId: req.user?.id ?? null,
  };

  flows.push(flow);
  res.status(201).json({ flow });
});

// PUT /api/flows/:id
export const updateFlow = asyncHandler(async (req, res) => {
  const flow = flows.find((f) => f.id === req.params.id);
  if (!flow) throw new ApiError(404, "Flujo no encontrado.");

  Object.assign(flow, req.body, { id: flow.id });
  res.json({ flow });
});

// DELETE /api/flows/:id
export const deleteFlow = asyncHandler(async (req, res) => {
  const index = flows.findIndex((f) => f.id === req.params.id);
  if (index === -1) throw new ApiError(404, "Flujo no encontrado.");

  flows.splice(index, 1);
  res.status(204).send();
});
