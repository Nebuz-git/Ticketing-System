import express from "express";
import http from "http";
import cookieParser from "cookie-parser";
import compression from "compression";
import cors from "cors";
import authRoutes from "./routes/auth.routes";
import { authMiddleware } from "./middlewares/auth.middleware";
import ticketRoutes from "./routes/ticket.routes";
import userRoutes from "./routes/user.routes";
import auditLogRoutes from "./routes/auditLog.routes";

const PORT = process.env.PORT || 8080;

const app = express();

app.use(cors({ credentials: true }));
app.use(express.urlencoded({ extended: true }));
app.use(compression());
app.use(cookieParser());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/tickets", ticketRoutes);
app.use("/api/users", userRoutes);
app.use("/api/audit-logs", auditLogRoutes);

const server = http.createServer(app);

app.get("/", (req, res) => {
  res.send("Server is working");
});

app.get("/profile", authMiddleware, (req, res) => {
  res.json({
    message: "Protected route accessed",
    user: (req as any).user,
  });
});

server.listen(PORT, () => {
  console.log("┌─────────────────────────────────────────┐");
  console.log("│           TicketSys is running           │");
  console.log("├─────────────────────────────────────────┤");
  console.log("│  Frontend:  http://localhost:3000        │");
  console.log("│  Backend:   http://localhost:8080        │");
  console.log("├─────────────────────────────────────────┤");
  console.log("│  admin@ticketsys.com    / Demo123!       │");
  console.log("│  support@ticketsys.com  / Demo123!       │");
  console.log("│  employee@ticketsys.com / Demo123!       │");
  console.log("└─────────────────────────────────────────┘");
});