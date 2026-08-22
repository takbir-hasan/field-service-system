import express from "express";
import cors from "cors";
import helmet from "helmet";
import authRoutes from "./routes/auth.routes";

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


import { authorize } from "./middlewares/role.middleware";
import { authenticate } from "./middlewares/auth.middleware";

app.get(
  "/api/admin-test",
  authenticate,
  authorize("ADMIN"),
  (_req, res) => {
    res.json({
      success: true,
      message: "You are an admin",
    });
  }
);

export default app;