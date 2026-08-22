import pool from "../config/database";

export const getDashboardSummary = async () => {
  const [rows] = await pool.execute(`
    SELECT
      COUNT(*) AS total_tickets,

      SUM(
        CASE
          WHEN status = 'OPEN'
          THEN 1
          ELSE 0
        END
      ) AS open_tickets,

      SUM(
        CASE
          WHEN status = 'ASSIGNED'
          THEN 1
          ELSE 0
        END
      ) AS assigned_tickets,

      SUM(
        CASE
          WHEN status = 'IN_PROGRESS'
          THEN 1
          ELSE 0
        END
      ) AS in_progress_tickets,

      SUM(
        CASE
          WHEN status = 'COMPLETED'
          THEN 1
          ELSE 0
        END
      ) AS completed_tickets,

      SUM(
        CASE
          WHEN status = 'CANCELLED'
          THEN 1
          ELSE 0
        END
      ) AS cancelled_tickets,

      SUM(
        CASE
          WHEN priority = 'URGENT'
          THEN 1
          ELSE 0
        END
      ) AS urgent_tickets,

      SUM(
        CASE
          WHEN priority = 'HIGH'
          THEN 1
          ELSE 0
        END
      ) AS high_priority_tickets

    FROM tickets
  `);

  return (rows as any[])[0];
};

export const getTechnicianStatistics = async () => {
  const [rows] = await pool.execute(`
    SELECT
      u.id,
      u.name,
      u.email,

      COUNT(t.id) AS total_assigned,

      SUM(
        CASE
          WHEN t.status = 'ASSIGNED'
          THEN 1
          ELSE 0
        END
      ) AS assigned,

      SUM(
        CASE
          WHEN t.status = 'IN_PROGRESS'
          THEN 1
          ELSE 0
        END
      ) AS in_progress,

      SUM(
        CASE
          WHEN t.status = 'COMPLETED'
          THEN 1
          ELSE 0
        END
      ) AS completed,

      SUM(
        CASE
          WHEN t.status = 'CANCELLED'
          THEN 1
          ELSE 0
        END
      ) AS cancelled

    FROM users u

    LEFT JOIN tickets t
      ON u.id = t.assigned_to

    WHERE u.role = 'TECHNICIAN'

    GROUP BY
      u.id,
      u.name,
      u.email

    ORDER BY total_assigned DESC
  `);

  return rows;
};