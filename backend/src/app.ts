import express from "express";

import { securityMiddleware } from "./middlewares/security.middleware";
import { apiLimiter } from "./middlewares/rate-limit.middleware";
import { errorHandler } from "./middlewares/error.middleware";
import authRoutes from "./routes/auth.routes";
import dashboardRoutes from "./routes/dashboard.routes";
import ticketRoutes from "./routes/ticket.routes";

import swaggerUi from "swagger-ui-express";
import { swaggerSpec } from "./config/swagger";

const app = express();

app.use(...securityMiddleware);

app.use(
  express.json({
    limit: "1mb",
  })
);

app.use("/api", apiLimiter);

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.use("/api/health", (req, res) => {
  res.status(200).json({ 
    success: true,
    message: "Server is healthy",
    timestamp: new Date().toISOString(),
   });
});

// routes
app.use("/api/auth", authRoutes);
app.use("/api/tickets", ticketRoutes);
app.use("/api/dashboard", dashboardRoutes);

// global error
app.use(errorHandler);

export default app;