import { Router } from "express";
import { getAuditLogs } from "../controllers/audit.controller";
import { authMiddleware } from "../middlewares/auth.middleware";
import { requireRole } from "../middlewares/role.middleware";

const router = Router();

router.get("/", authMiddleware, requireRole("admin"), getAuditLogs);

export default router;