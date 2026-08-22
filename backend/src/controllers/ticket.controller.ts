import { Request, Response } from "express";

import {
  createTicket,
  getTicketList,
  getTicket,
  changeTicketStatus,
  assignTicket,
  addComment,
  getComments,
} from "../services/ticket.service";

import {
  createTicketSchema,
  updateStatusSchema,
  assignTicketSchema,
  createCommentSchema,
} from "../validators/ticket.validator";
import { AppError } from "../errors/AppError";



export const createTicketController = async (
  req: Request,
  res: Response
) => {
  if (!req.user) {
    throw new AppError(
      401,
      "Unauthorized"
    );
  }

  const ticketId = await createTicket(
    req.body.title,
    req.body.description,
    req.body.priority,
    req.user.userId
  );

  return res.status(201).json({
    success: true,
    data: {
      id: ticketId,
    },
  });
};

export const getTicketsController = async (
  req: Request,
  res: Response
) => {
  const page = Math.max(
    Number(req.query.page) || 1,
    1
  );

  const limit = Math.min(
    Number(req.query.limit) || 10,
    50
  );

  const search =
    req.query.search as string | undefined;

  const status =
    req.query.status as string | undefined;

  const priority =
    req.query.priority as string | undefined;

  const tickets = await getTicketList({
    search,
    status,
    priority,
    page,
    limit,
  });

  return res.status(200).json({
    success: true,
    data: tickets,
    meta: {
      page,
      limit,
    },
  });
};

export const getTicketController = async (
  req: Request,
  res: Response
) => {
  const ticketId = Number(req.params.id);

  if (!Number.isInteger(ticketId) || ticketId <= 0) {
    throw new AppError(
      400,
      "Invalid ticket ID"
    );
  }

  const ticket = await getTicket(ticketId);

  return res.status(200).json({
    success: true,
    data: ticket,
  });
};

export const updateStatusController = async (
  req: Request,
  res: Response
) => {
  if (!req.user) {
    throw new AppError(
      401,
      "Unauthorized"
    );
  }

  const ticketId = Number(req.params.id);

  if (!Number.isInteger(ticketId) || ticketId <= 0) {
    throw new AppError(
      400,
      "Invalid ticket ID"
    );
  }

  const result = await changeTicketStatus(
    ticketId,
    req.body.status,
    req.user.userId
  );

  return res.status(200).json({
    success: true,
    data: result,
  });
};

export const assignTicketController = async (
  req: Request,
  res: Response
) => {
  const ticketId = Number(req.params.id);

  if (!Number.isInteger(ticketId) || ticketId <= 0) {
    throw new AppError(
      400,
      "Invalid ticket ID"
    );
  }

  const result = await assignTicket(
    ticketId,
    req.body.technicianId
  );

  return res.status(200).json({
    success: true,
    data: result,
  });
};

export const createCommentController = async (
  req: Request,
  res: Response
) => {
  if (!req.user) {
    throw new AppError(
      401,
      "Unauthorized"
    );
  }

  const ticketId = Number(req.params.id);

  if (!Number.isInteger(ticketId) || ticketId <= 0) {
    throw new AppError(
      400,
      "Invalid ticket ID"
    );
  }

  const commentId = await addComment(
    ticketId,
    req.user.userId,
    req.body.comment
  );

  return res.status(201).json({
    success: true,
    data: {
      id: commentId,
    },
  });
};

export const getCommentsController = async (
  req: Request,
  res: Response
) => {
  const ticketId = Number(req.params.id);

  if (!Number.isInteger(ticketId) || ticketId <= 0) {
    throw new AppError(
      400,
      "Invalid ticket ID"
    );
  }

  const comments = await getComments(ticketId);

  return res.status(200).json({
    success: true,
    data: comments,
  });
};

