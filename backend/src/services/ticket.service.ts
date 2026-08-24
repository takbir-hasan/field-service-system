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
  requesterId: number;
  requesterRole: "ADMIN" | "TECHNICIAN";
}) => {
  return fetchTickets(params);
};

export const getTicket = async (
  ticketId: number,
  requesterId: number,
  requesterRole: "ADMIN" | "TECHNICIAN"
) => {
  const ticket = await findTicketById(ticketId);

  if (!ticket) {
    throw new AppError(
      404,
      "Ticket not found"
    );
  }

  if (
    requesterRole === "TECHNICIAN" &&
    ticket.technician_id !== requesterId
  ) {
    throw new AppError(
      403,
      "You can only access tickets assigned to you"
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
  comment: string,
  role: "ADMIN" | "TECHNICIAN"
) => {
  await getTicket(ticketId, userId, role);

  const commentId = await insertComment(
    ticketId,
    userId,
    comment
  );

  return commentId;
};

export const getComments = async (
  ticketId: number,
  requesterId: number,
  requesterRole: "ADMIN" | "TECHNICIAN"
) => {
  await getTicket(
    ticketId,
    requesterId,
    requesterRole
  );

  return fetchTicketComments(ticketId);
};

