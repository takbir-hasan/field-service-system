import pool from "../config/database";
import { ResultSetHeader, RowDataPacket } from "mysql2";

export interface User {
  id: number;
  name: string;
  email: string;
  password_hash: string;
  role: "ADMIN" | "TECHNICIAN";
  created_at: Date;
}

interface UserRow extends RowDataPacket, User {}

export const findUserByEmail = async (
  email: string
): Promise<User | null> => {
  const [rows] = await pool.execute<UserRow[]>(
    `
      SELECT
        id,
        name,
        email,
        password_hash,
        role,
        created_at
      FROM users
      WHERE email = ?
      LIMIT 1
    `,
    [email]
  );

  return rows.length > 0 ? rows[0] : null;
};

export const findUserById = async (
  id: number
): Promise<User | null> => {
  const [rows] = await pool.execute<UserRow[]>(
    `
      SELECT
        id,
        name,
        email,
        password_hash,
        role,
        created_at
      FROM users
      WHERE id = ?
      LIMIT 1
    `,
    [id]
  );

  return rows.length > 0 ? rows[0] : null;
};