import { Router } from "express";
import { listFlows, getFlow, createFlow, updateFlow, deleteFlow } from "../controllers/flows.controller.js";
import { requireAuth, requireRole } from "../middleware/auth.middleware.js";
import { ROLES } from "../data/store.js";

const router = Router();

// Ver flujos: cualquier usuario autenticado (el controlador filtra por su organización).
router.get("/", requireAuth, listFlows);
router.get("/:id", requireAuth, getFlow);

// Crear/editar/borrar flujos: solo admin. Un usuario normal solo consulta.
router.post("/", requireAuth, requireRole(ROLES.ADMIN), createFlow);
router.put("/:id", requireAuth, requireRole(ROLES.ADMIN), updateFlow);
router.delete("/:id", requireAuth, requireRole(ROLES.ADMIN), deleteFlow);

export default router;
