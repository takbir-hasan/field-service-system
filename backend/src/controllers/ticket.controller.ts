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

export const createTicketController = async (
  req: Request,
  res: Response
) => {
  try {
    const data = createTicketSchema.parse(
      req.body
    );

    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const ticketId = await createTicket(
      data.title,
      data.description,
      data.priority,
      req.user.userId
    );

    return res.status(201).json({
      success: true,
      data: {
        id: ticketId,
      },
    });
  } catch (error: any) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export const getTicketsController = async (
  req: Request,
  res: Response
) => {
  try {
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
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getTicketController = async (
  req: Request,
  res: Response
) => {
  try {
    const ticketId = Number(req.params.id);

    if (!Number.isInteger(ticketId) || ticketId <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid ticket ID",
      });
    }

    const ticket = await getTicket(ticketId);

    return res.status(200).json({
      success: true,
      data: ticket,
    });
  } catch (error: any) {
    return res.status(404).json({
      success: false,
      message: error.message,
    });
  }
};

export const updateStatusController = async (
  req: Request,
  res: Response
) => {
  try {
    const ticketId = Number(req.params.id);

    const data =
      updateStatusSchema.parse(req.body);

      if (!req.user) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized",
    });
    }

  const result =
    await changeTicketStatus(
      ticketId,
      data.status,
      req.user.userId
    );

    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export const assignTicketController = async (
  req: Request,
  res: Response
) => {
  try {
    const ticketId = Number(req.params.id);

    const data =
      assignTicketSchema.parse(req.body);

    const result =
      await assignTicket(
        ticketId,
        data.technicianId
      );

    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export const createCommentController = async (
  req: Request,
  res: Response
) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const ticketId = Number(req.params.id);

    if (!Number.isInteger(ticketId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid ticket ID",
      });
    }

    const data = createCommentSchema.parse(
      req.body
    );

    const commentId = await addComment(
      ticketId,
      req.user.userId,
      data.comment
    );

    return res.status(201).json({
      success: true,
      data: {
        id: commentId,
      },
    });
  } catch (error: any) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export const getCommentsController = async (
  req: Request,
  res: Response
) => {
  try {
    const ticketId = Number(req.params.id);

    if (!Number.isInteger(ticketId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid ticket ID",
      });
    }

    const comments = await getComments(ticketId);

    return res.status(200).json({
      success: true,
      data: comments,
    });
  } catch (error: any) {
    return res.status(404).json({
      success: false,
      message: error.message,
    });
  }
};

