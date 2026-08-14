import { Router } from "express";
import { getSummary, getBottlenecks } from "../controllers/reports.controller.js";
import { requireAuth } from "../middleware/auth.middleware.js";

const router = Router();

router.get("/summary", requireAuth, getSummary);
router.get("/bottlenecks", requireAuth, getBottlenecks);

export default router;
