import helmet from "helmet";
import cors from "cors";
import { RequestHandler } from "express";

export const securityMiddleware: RequestHandler[] = [
  helmet(),

  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true,
  }),
];