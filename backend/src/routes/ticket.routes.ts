import { Router } from "express";

import {
  createTicketController,
  getTicketsController,
  getTicketController,
  updateStatusController,
  assignTicketController,
} from "../controllers/ticket.controller";

import { authenticate } from "../middlewares/auth.middleware";
import { authorize } from "../middlewares/role.middleware";

const router = Router();

router.use(authenticate);

router.post(
  "/",
  createTicketController
);

router.get(
  "/",
  getTicketsController
);

router.get(
  "/:id",
  getTicketController
);

router.patch(
  "/:id/status",
  authorize("ADMIN", "TECHNICIAN"),
  updateStatusController
);

router.post(
  "/:id/assign",
  authorize("ADMIN"),
  assignTicketController
);

export default router;