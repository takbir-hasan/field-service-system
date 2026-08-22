import { Router } from "express";

import {
  getDashboardSummaryController,
  getTechnicianStatisticsController,
} from "../controllers/dashboard.controller";

import { authenticate } from "../middlewares/auth.middleware";
import { authorize } from "../middlewares/role.middleware";
import { asyncHandler } from "../middlewares/async.middleware";

const router = Router();

router.use(authenticate);

router.get(
  "/summary",
  authorize("ADMIN"),
  asyncHandler(getDashboardSummaryController),  
);

router.get(
  "/technicians",
  authorize("ADMIN"),
  asyncHandler(getTechnicianStatisticsController),
);

export default router;