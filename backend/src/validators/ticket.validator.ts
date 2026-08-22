import { z } from "zod";

export const createTicketSchema = z.object({
  title: z
    .string()
    .min(3)
    .max(200),

  description: z
    .string()
    .min(10),

  priority: z
    .enum(["LOW", "MEDIUM", "HIGH", "URGENT"])
    .default("MEDIUM"),
});

export const updateStatusSchema = z.object({
  status: z.enum([
    "OPEN",
    "ASSIGNED",
    "IN_PROGRESS",
    "COMPLETED",
    "CANCELLED",
  ]),
});

export const assignTicketSchema = z.object({
  technicianId: z.number().int().positive(),
});

export const createCommentSchema = z.object({
  comment: z.string().min(1).max(2000),
});

export type CreateTicketInput =
  z.infer<typeof createTicketSchema>;

export type UpdateStatusInput =
  z.infer<typeof updateStatusSchema>;

export type AssignTicketInput =
  z.infer<typeof assignTicketSchema>;

export type CreateCommentInput =
  z.infer<typeof createCommentSchema>;