import { Router } from "express";
import { getSummary, getBottlenecks, getInsights, getInsightById } from "../controllers/reports.controller.js";
import { requireAuth } from "../middleware/auth.middleware.js";

const router = Router();

router.get("/summary", requireAuth, getSummary);
router.get("/bottlenecks", requireAuth, getBottlenecks);
router.get("/insights", requireAuth, getInsights);
router.get("/insights/:id", requireAuth, getInsightById);

export default router;
