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
  requesterId,
  requesterRole,
}: {
  search?: string;
  status?: string;
  priority?: string;
  page: number;
  limit: number;
  requesterId: number;
  requesterRole: "ADMIN" | "TECHNICIAN";
}) => {
  // Validate pagination values
  const safePage = Math.max(1, Number(page) || 1);

  const safeLimit = Math.min(
    100,
    Math.max(1, Number(limit) || 10)
  );

  const offset = (safePage - 1) * safeLimit;

  const conditions: string[] = [];
  const values: Array<string | number> = [];

  if (requesterRole === "TECHNICIAN") {
    conditions.push("t.assigned_to = ?");
    values.push(requesterId);
  }

  // Search
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

  // Status filter
  if (status) {
    conditions.push(`t.status = ?`);
    values.push(status);
  }

  // Priority filter
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

      LIMIT ${safeLimit} OFFSET ${offset}
    `,
    values
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
        t.created_at,
        t.updated_at,

        creator.id AS creator_id,
        creator.name AS creator_name,
        creator.email AS creator_email,

        technician.id AS technician_id,
        technician.name AS technician_name,
        technician.email AS technician_email,

        COUNT(DISTINCT tc.id) AS comment_count,
        COUNT(DISTINCT tsh.id) AS history_count

      FROM tickets t

      INNER JOIN users creator
        ON t.created_by = creator.id

      LEFT JOIN users technician
        ON t.assigned_to = technician.id

      LEFT JOIN ticket_comments tc
        ON t.id = tc.ticket_id

      LEFT JOIN ticket_status_history tsh
        ON t.id = tsh.ticket_id

      WHERE t.id = ?

      GROUP BY
        t.id,
        t.title,
        t.description,
        t.priority,
        t.status,
        t.created_at,
        t.updated_at,

        creator.id,
        creator.name,
        creator.email,

        technician.id,
        technician.name,
        technician.email

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


export const updateTicketStatusWithHistory = async (
  ticketId: number,
  newStatus: string,
  changedBy: number
) => {
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const [ticketRows]: any = await connection.execute(
      `
        SELECT status
        FROM tickets
        WHERE id = ?
        FOR UPDATE
      `,
      [ticketId]
    );

    if (ticketRows.length === 0) {
      throw new Error("Ticket not found");
    }

    const oldStatus = ticketRows[0].status;

    await connection.execute(
      `
        UPDATE tickets
        SET status = ?
        WHERE id = ?
      `,
      [newStatus, ticketId]
    );

    await connection.execute(
      `
        INSERT INTO ticket_status_history
        (
          ticket_id,
          changed_by,
          old_status,
          new_status
        )
        VALUES (?, ?, ?, ?)
      `,
      [
        ticketId,
        changedBy,
        oldStatus,
        newStatus,
      ]
    );

    await connection.commit();

    return {
      oldStatus,
      newStatus,
    };
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};


export const createComment = async (
  ticketId: number,
  userId: number,
  comment: string
) => {
  const [result] = await pool.execute<ResultSetHeader>(
    `
      INSERT INTO ticket_comments
      (
        ticket_id,
        user_id,
        comment
      )
      VALUES (?, ?, ?)
    `,
    [ticketId, userId, comment]
  );

  return result.insertId;
};


export const getTicketComments = async (
  ticketId: number
) => {
  const [rows] = await pool.execute(
    `
      SELECT
        tc.id,
        tc.ticket_id,
        tc.comment,
        tc.created_at,

        u.id AS user_id,
        u.name AS user_name,
        u.role AS user_role

      FROM ticket_comments tc

      INNER JOIN users u
        ON tc.user_id = u.id

      WHERE tc.ticket_id = ?

      ORDER BY tc.created_at ASC
    `,
    [ticketId]
  );

  return rows;
};