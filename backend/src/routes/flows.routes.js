import { Router } from "express";
import { listFlows, getFlow, createFlow, updateFlow, deleteFlow } from "../controllers/flows.controller.js";
import { requireAuth } from "../middleware/auth.middleware.js";

const router = Router();

router.get("/", requireAuth, listFlows);
router.get("/:id", requireAuth, getFlow);
router.post("/", requireAuth, createFlow);
router.put("/:id", requireAuth, updateFlow);
router.delete("/:id", requireAuth, deleteFlow);

export default router;
