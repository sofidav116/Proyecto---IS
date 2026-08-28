import { Router } from "express";
import { generateFlow, generateReport } from "../controllers/ai.controller.js";

const router = Router();

router.post("/generate-flow", generateFlow);
router.post("/generate-report", generateReport);

export default router;