import { Router } from "express";

import {
  createTicketController,
  getTicketsController,
  getTicketController,
  updateStatusController,
  assignTicketController,
  getCommentsController,
  createCommentController,
} from "../controllers/ticket.controller";

import { authenticate } from "../middlewares/auth.middleware";
import { authorize } from "../middlewares/role.middleware";
import { validate } from "../middlewares/validate.middleware";
import { asyncHandler } from "../middlewares/async.middleware";

import {
  createTicketSchema,
  updateStatusSchema,
  assignTicketSchema,
  createCommentSchema,
} from "../validators/ticket.validator";

const router = Router();

router.use(authenticate);

router.post(
  "/",
  authorize("ADMIN"),
  validate(createTicketSchema),
  asyncHandler(createTicketController),
);
  
router.get(
  "/",
  asyncHandler(getTicketsController)
);

router.post(
  "/:id/comments",
  validate(createCommentSchema),
  asyncHandler(createCommentController)
);

router.get(
  "/:id/comments",
  asyncHandler(getCommentsController)
);

router.post(
  "/:id/assign",
  authorize("ADMIN"),
  validate(assignTicketSchema),
  asyncHandler(assignTicketController)
);

router.patch(
  "/:id/status",
  authorize("ADMIN", "TECHNICIAN"),
  validate(updateStatusSchema),
  asyncHandler(updateStatusController)
);

router.get(
  "/:id",
  asyncHandler(getTicketController)
);

export default router;