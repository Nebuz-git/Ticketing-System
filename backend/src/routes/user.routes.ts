import { Router } from "express";
import { getAllUsers, createSupportUser, updateUserRole } from "../controllers/user.controller";
import { authMiddleware } from "../middlewares/auth.middleware";
import { requireRole } from "../middlewares/role.middleware";

const router = Router();

router.get("/", authMiddleware, requireRole("admin"), getAllUsers);
router.post("/support", authMiddleware, requireRole("admin"), createSupportUser);
router.patch("/:id/role", authMiddleware, requireRole("admin"), updateUserRole);

export default router;