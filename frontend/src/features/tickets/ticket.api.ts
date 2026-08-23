import api from "../../api/axios";

import type {
  Ticket,
  TicketComment,
  TicketPriority,
  TicketStatus,
} from "./ticket.types";

export interface CreateTicketPayload {
  title: string;
  description: string;
  priority: TicketPriority;
}

export const getTickets = async (): Promise<Ticket[]> => {
  const response = await api.get<{
    success: boolean;
    data: Ticket[];
  }>("/tickets");

  return response.data.data;
};

export const createTicket = async (
  payload: CreateTicketPayload,
): Promise<{ id: number }> => {
  const response = await api.post<{
    success: boolean;
    data: {
      id: number;
    };
  }>("/tickets", payload);

  return response.data.data;
};

export const getTicket = async (
  ticketId: number,
): Promise<Ticket> => {
  const response = await api.get<{
    success: boolean;
    data: Ticket;
  }>(`/tickets/${ticketId}`);

  return response.data.data;
};

export const getTicketComments = async (
  ticketId: number,
): Promise<TicketComment[]> => {
  const response = await api.get<{
    success: boolean;
    data: TicketComment[];
  }>(`/tickets/${ticketId}/comments`);

  return response.data.data;
};

export const createTicketComment = async (
  ticketId: number,
  comment: string,
): Promise<{ id: number }> => {
  const response = await api.post<{
    success: boolean;
    data: {
      id: number;
    };
  }>(`/tickets/${ticketId}/comments`, {
    comment,
  });

  return response.data.data;
};

export const assignTicket = async (
  ticketId: number,
  technicianId: number,
) => {
  const response = await api.post(
    `/tickets/${ticketId}/assign`,
    {
      technicianId,
    },
  );

  return response.data;
};

export const updateTicketStatus = async (
  ticketId: number,
  status: TicketStatus,
) => {
  const response = await api.patch(
    `/tickets/${ticketId}/status`,
    {
      status,
    },
  );

  return response.data;
};