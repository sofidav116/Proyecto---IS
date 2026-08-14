import { Router } from "express";
import { listUsers } from "../controllers/users.controller.js";
import { requireAuth } from "../middleware/auth.middleware.js";

const router = Router();

router.get("/", requireAuth, listUsers);

export default router;
