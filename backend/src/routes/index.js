import { Router } from "express";
import authRoutes from "./auth.routes.js";
import flowsRoutes from "./flows.routes.js";
import aiRoutes from "./ai.routes.js";
import dashboardRoutes from "./dashboard.routes.js";
import reportsRoutes from "./reports.routes.js";
import usersRoutes from "./users.routes.js";

const router = Router();

router.get("/health", (_req, res) => res.json({ status: "ok" }));

router.use("/auth", authRoutes);
router.use("/flows", flowsRoutes);
router.use("/ai", aiRoutes);
router.use("/dashboard", dashboardRoutes);
router.use("/reports", reportsRoutes);
router.use("/users", usersRoutes);

export default router;
