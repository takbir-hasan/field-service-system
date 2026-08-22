import express from "express";
import cors from "cors";
import helmet from "helmet";
import authRoutes from "./routes/auth.routes";
import ticketRoutes from "./routes/ticket.routes";

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());

app.get("/api/health", (_req, res) => {
  res.json({
    success: true,
    message: "Field Service API is running",
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/tickets", ticketRoutes);

export default app;