export type TicketPriority =
  | "LOW"
  | "MEDIUM"
  | "HIGH"
  | "URGENT";

export type TicketStatus =
  | "OPEN"
  | "ASSIGNED"
  | "IN_PROGRESS"
  | "COMPLETED"
  | "CANCELLED";

export interface Ticket {
  id: number;

  title: string;

  description: string;

  priority: TicketPriority;

  status: TicketStatus;

  created_by: number;

  assigned_to: number | null;

  created_at: string;

  updated_at: string;

  creator_id: number;

  creator_name: string;

  creator_email: string;

  technician_id: number | null;

  technician_name: string | null;

  technician_email: string | null;

  comment_count: number;

  history_count: number;
}

export interface TicketComment {
  id: number;
  ticket_id: number;
  comment: string;
  created_at: string;
  user_id: number;
  user_name: string;
  user_role: "ADMIN" | "TECHNICIAN";
}