import express from "express";
import http from "http";
// import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import compression from "compression";
import cors from "cors";
import authRoutes from "./routes/auth.routes";
import { authMiddleware } from "./middlewares/auth.middleware";

const app = express();

app.use(cors({
    credentials: true,
}));
app.use(express.urlencoded({ extended: true }));
app.use(compression());
app.use(cookieParser());
app.use(express.json());
// app.use(bodyParser.json());  
const router = express.Router();

app.use("/auth", authRoutes);

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

server.listen(8080, () => {
    console.log("server is running on http://localhost:8080/");
}) 