import { Router } from "express";
import { getKpis, getRecentFlows } from "../controllers/dashboard.controller.js";
import { requireAuth } from "../middleware/auth.middleware.js";

const router = Router();

router.get("/kpis", requireAuth, getKpis);
router.get("/recent-flows", requireAuth, getRecentFlows);

export default router;
