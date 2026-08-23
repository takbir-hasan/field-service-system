import { Router } from "express";

import { authenticate } from "../middlewares/auth.middleware";
import { authorize } from "../middlewares/role.middleware";
import { asyncHandler } from "../middlewares/async.middleware";

import {
  getTechniciansController,
} from "../controllers/user.controller";

const router = Router();

router.use(authenticate);

router.get(
  "/technicians",
  authorize("ADMIN"),
  asyncHandler(getTechniciansController)
);

export default router;