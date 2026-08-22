import pool from "../config/database";
import { ResultSetHeader, RowDataPacket } from "mysql2";

export interface TicketRow extends RowDataPacket {
  id: number;
  title: string;
  description: string;
  priority: string;
  status: string;
  created_by: number;
  assigned_to: number | null;
  created_at: Date;
  updated_at: Date;
  creator_name: string;
  creator_email: string;
  technician_name: string | null;
}

export const createTicket = async (
  title: string,
  description: string,
  priority: string,
  createdBy: number
) => {
  const [result] = await pool.execute<ResultSetHeader>(
    `
      INSERT INTO tickets
      (
        title,
        description,
        priority,
        created_by
      )
      VALUES (?, ?, ?, ?)
    `,
    [
      title,
      description,
      priority,
      createdBy,
    ]
  );

  return result.insertId;
};

export const getTickets = async ({
  search,
  status,
  priority,
  page,
  limit,
}: {
  search?: string;
  status?: string;
  priority?: string;
  page: number;
  limit: number;
}) => {
  const offset = (page - 1) * limit;

  const conditions: string[] = [];
  const values: any[] = [];

  if (search) {
    conditions.push(`
      (
        t.title LIKE ?
        OR t.description LIKE ?
      )
    `);

    values.push(
      `%${search}%`,
      `%${search}%`
    );
  }

  if (status) {
    conditions.push(`t.status = ?`);
    values.push(status);
  }

  if (priority) {
    conditions.push(`t.priority = ?`);
    values.push(priority);
  }

  const whereClause =
    conditions.length > 0
      ? `WHERE ${conditions.join(" AND ")}`
      : "";

  const [rows] = await pool.execute<TicketRow[]>(
    `
      SELECT
        t.id,
        t.title,
        t.description,
        t.priority,
        t.status,
        t.created_by,
        t.assigned_to,
        t.created_at,
        t.updated_at,

        creator.name AS creator_name,
        creator.email AS creator_email,

        technician.name AS technician_name

      FROM tickets t

      INNER JOIN users creator
        ON t.created_by = creator.id

      LEFT JOIN users technician
        ON t.assigned_to = technician.id

      ${whereClause}

      ORDER BY t.created_at DESC

      LIMIT ? OFFSET ?
    `,
    [...values, limit, offset]
  );

  return rows;
};

export const findTicketById = async (
  ticketId: number
) => {
  const [rows] = await pool.execute<TicketRow[]>(
    `
      SELECT
        t.id,
        t.title,
        t.description,
        t.priority,
        t.status,
        t.created_by,
        t.assigned_to,
        t.created_at,
        t.updated_at,

        creator.name AS creator_name,
        creator.email AS creator_email,

        technician.name AS technician_name

      FROM tickets t

      INNER JOIN users creator
        ON t.created_by = creator.id

      LEFT JOIN users technician
        ON t.assigned_to = technician.id

      WHERE t.id = ?

      LIMIT 1
    `,
    [ticketId]
  );

  return rows.length > 0 ? rows[0] : null;
};

export const updateTicketStatus = async (
  ticketId: number,
  status: string
) => {
  const [result] =
    await pool.execute<ResultSetHeader>(
      `
        UPDATE tickets
        SET status = ?
        WHERE id = ?
      `,
      [status, ticketId]
    );

  return result.affectedRows > 0;
};

export const assignTechnician = async (
  ticketId: number,
  technicianId: number
) => {
  const [result] =
    await pool.execute<ResultSetHeader>(
      `
        UPDATE tickets
        SET
          assigned_to = ?,
          status = 'ASSIGNED'
        WHERE id = ?
      `,
      [
        technicianId,
        ticketId,
      ]
    );

  return result.affectedRows > 0;
};

