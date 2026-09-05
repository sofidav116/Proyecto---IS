import { Router } from "express";
import { getMyOrganization, createOrganization, updateMyHierarchy } from "../controllers/organizations.controller.js";
import { requireAuth, requireRole } from "../middleware/auth.middleware.js";
import { ROLES } from "../data/store.js";

const router = Router();

router.get("/me", requireAuth, getMyOrganization);
router.post("/", requireAuth, requireRole(ROLES.ADMIN), createOrganization);
router.put("/me/jerarquia", requireAuth, requireRole(ROLES.ADMIN), updateMyHierarchy);

export default router;
