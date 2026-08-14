import { Router } from "express";
import { generateFlow } from "../controllers/ai.controller.js";
import { requireAuth } from "../middleware/auth.middleware.js";

const router = Router();

router.post("/generate-flow", requireAuth, generateFlow);

export default router;
