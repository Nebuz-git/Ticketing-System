import express from "express";
import {
  createTicket,
  deleteTicket,
  getTicketById,
  getTickets,
  updateTicket,
} from "../controllers/ticket.controller";
import { authMiddleware } from "../middlewares/auth.middleware";

const router = express.Router();

router.get("/", authMiddleware, getTickets);
router.get("/:id", authMiddleware, getTicketById);
router.post("/", authMiddleware, createTicket);
router.put("/:id", authMiddleware, updateTicket);
router.delete("/:id", authMiddleware, deleteTicket);

export default router;