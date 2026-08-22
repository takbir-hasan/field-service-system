import {
  createTicket as insertTicket,
  getTickets as fetchTickets,
  findTicketById,
  updateTicketStatus,
  assignTechnician,
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
    throw new Error("Ticket not found");
  }

  return ticket;
};

export const changeTicketStatus = async (
  ticketId: number,
  status: string
) => {
  const ticket = await findTicketById(ticketId);

  if (!ticket) {
    throw new Error("Ticket not found");
  }

  await updateTicketStatus(
    ticketId,
    status
  );

  return findTicketById(ticketId);
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