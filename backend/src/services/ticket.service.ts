import { AppError } from "../errors/AppError";
import {
  createTicket as insertTicket,
  getTickets as fetchTickets,
  findTicketById,
  assignTechnician,
  updateTicketStatusWithHistory,
  createComment as insertComment,
  getTicketComments as fetchTicketComments,
} from "../repositories/ticket.repository";

export const createTicket = async (
  title: string,
  description: string,
  priority: string,
  createdBy: number
) => {
  return insertTicket(
    title,
    description,
    priority,
    createdBy
  );
};

export const getTicketList = async (params: {
  search?: string;
  status?: string;
  priority?: string;
  page: number;
  limit: number;
}) => {
  return fetchTickets(params);
};

export const getTicket = async (
  ticketId: number
) => {
  const ticket = await findTicketById(ticketId);

  if (!ticket) {
    throw new AppError(
      404,
      "Ticket not found"
    );
  }
  return ticket;
};

export const changeTicketStatus = async (
  ticketId: number,
  status: string,
  changedBy: number,
  role: "ADMIN" | "TECHNICIAN"
) => {
  const ticket = await findTicketById(ticketId);

  if (!ticket) {
    throw new AppError(
      404,
      "Ticket not found"
    );
  }

  if (
    role === "TECHNICIAN" &&
    ticket.technician_id !== changedBy
  ) {
    throw new AppError(
      403,
      "You can only update tickets assigned to you"
    );
  }

  return updateTicketStatusWithHistory(
    ticketId,
    status,
    changedBy
  );
};

export const assignTicket = async (
  ticketId: number,
  technicianId: number
) => {
  const ticket = await findTicketById(ticketId);

  if (!ticket) {
    throw new Error("Ticket not found");
  }

  return assignTechnician(
    ticketId,
    technicianId
  );
};

export const addComment = async (
  ticketId: number,
  userId: number,
  comment: string
) => {
  const ticket = await findTicketById(ticketId);

  if (!ticket) {
    throw new AppError(
      404,
      "Ticket not found"
    );
  }

  const commentId = await insertComment(
    ticketId,
    userId,
    comment
  );

  return commentId;
};

export const getComments = async (
  ticketId: number
) => {
  const ticket = await findTicketById(ticketId);

  if (!ticket) {
    throw new AppError(
      404,
      "Ticket not found"
    );
  }

  return fetchTicketComments(ticketId);
};

