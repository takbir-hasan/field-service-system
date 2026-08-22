import bcrypt from "bcryptjs";
import pool from "../config/database";

const seed = async () => {
  try {
    const adminPassword = await bcrypt.hash("Admin@123", 12);
    const technicianPassword = await bcrypt.hash(
      "Tech@123",
      12
    );

    await pool.execute(
      `
        INSERT INTO users
        (name, email, password_hash, role)
        VALUES (?, ?, ?, ?)
      `,
      [
        "System Admin",
        "admin@example.com",
        adminPassword,
        "ADMIN",
      ]
    );

    await pool.execute(
      `
        INSERT INTO users
        (name, email, password_hash, role)
        VALUES (?, ?, ?, ?)
      `,
      [
        "John Technician",
        "john@example.com",
        technicianPassword,
        "TECHNICIAN",
      ]
    );

    console.log("Users seeded successfully");

    process.exit(0);
  } catch (error) {
    console.error("Seed failed:", error);
    process.exit(1);
  }
};

seed();