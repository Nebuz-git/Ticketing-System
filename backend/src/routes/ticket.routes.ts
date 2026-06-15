import express from "express";
import {
  createTicket,
  deleteTicket,
  getTicketById,
  getTickets,
  updateTicket,
} from "../controllers/ticket.controller";
import { authMiddleware } from "../middlewares/auth.middleware";
import { requireRole } from "../middlewares/role.middleware";

const router = express.Router();

router.get("/", authMiddleware, requireRole("employee", "support", "admin"), getTickets);
router.get("/:id", authMiddleware, requireRole("employee", "support", "admin"), getTicketById);
router.post("/", authMiddleware, requireRole("employee"), createTicket);
router.put("/:id", authMiddleware, requireRole("employee", "support", "admin"), updateTicket);
router.delete("/:id", authMiddleware, requireRole("employee", "support", "admin"), deleteTicket);
export default router;