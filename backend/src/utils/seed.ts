import bcrypt from "bcryptjs";
import pool from "../config/database";

const seed = async () => {
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    console.log(" Starting database seed...");

    // =========================================================
    // 1. PASSWORDS
    // =========================================================

    const adminPassword = await bcrypt.hash("Admin@123", 12);
    const technicianPassword = await bcrypt.hash("Tech@123", 12);

    // =========================================================
    // 2. USERS
    // =========================================================

    const users = [
      // Admins
      {
        name: "System Admin",
        email: "admin@example.com",
        password_hash: adminPassword,
        role: "ADMIN",
      },
      {
        name: "Sarah Admin",
        email: "sarah.admin@example.com",
        password_hash: adminPassword,
        role: "ADMIN",
      },
      {
        name: "Michael Admin",
        email: "michael.admin@example.com",
        password_hash: adminPassword,
        role: "ADMIN",
      },

      // Technicians
      {
        name: "John Technician",
        email: "john@example.com",
        password_hash: technicianPassword,
        role: "TECHNICIAN",
      },
      {
        name: "Alex Johnson",
        email: "alex@example.com",
        password_hash: technicianPassword,
        role: "TECHNICIAN",
      },
      {
        name: "David Wilson",
        email: "david@example.com",
        password_hash: technicianPassword,
        role: "TECHNICIAN",
      },
      {
        name: "Emily Brown",
        email: "emily@example.com",
        password_hash: technicianPassword,
        role: "TECHNICIAN",
      },
      {
        name: "Robert Davis",
        email: "robert@example.com",
        password_hash: technicianPassword,
        role: "TECHNICIAN",
      },
      {
        name: "James Miller",
        email: "james@example.com",
        password_hash: technicianPassword,
        role: "TECHNICIAN",
      },
      {
        name: "Sophia Moore",
        email: "sophia@example.com",
        password_hash: technicianPassword,
        role: "TECHNICIAN",
      },
      {
        name: "Daniel Taylor",
        email: "daniel@example.com",
        password_hash: technicianPassword,
        role: "TECHNICIAN",
      },
      {
        name: "Olivia Anderson",
        email: "olivia@example.com",
        password_hash: technicianPassword,
        role: "TECHNICIAN",
      },
      {
        name: "William Thomas",
        email: "william@example.com",
        password_hash: technicianPassword,
        role: "TECHNICIAN",
      },
    ];

    for (const user of users) {
      await connection.execute(
        `
          INSERT INTO users
            (name, email, password_hash, role)
          VALUES
            (?, ?, ?, ?)
          ON DUPLICATE KEY UPDATE
            name = VALUES(name),
            password_hash = VALUES(password_hash),
            role = VALUES(role)
        `,
        [
          user.name,
          user.email,
          user.password_hash,
          user.role,
        ]
      );
    }

    console.log(` ${users.length} users seeded`);

    // =========================================================
    // 3. GET USER IDS
    // =========================================================

    const [userRows] = await connection.execute(
      `
        SELECT id, email, role
        FROM users
        WHERE email IN (${users.map(() => "?").join(", ")})
      `,
      users.map((user) => user.email)
    );

    const userMap = new Map<
      string,
      {
        id: number;
        email: string;
        role: string;
      }
    >();

    for (const user of userRows as {
      id: number;
      email: string;
      role: string;
    }[]) {
      userMap.set(user.email, user);
    }

    const admin = userMap.get("admin@example.com");
    const sarahAdmin = userMap.get("sarah.admin@example.com");
    const michaelAdmin = userMap.get("michael.admin@example.com");

    const john = userMap.get("john@example.com");
    const alex = userMap.get("alex@example.com");
    const david = userMap.get("david@example.com");
    const emily = userMap.get("emily@example.com");
    const robert = userMap.get("robert@example.com");
    const james = userMap.get("james@example.com");
    const sophia = userMap.get("sophia@example.com");
    const daniel = userMap.get("daniel@example.com");
    const olivia = userMap.get("olivia@example.com");
    const william = userMap.get("william@example.com");

    if (
      !admin ||
      !sarahAdmin ||
      !michaelAdmin ||
      !john ||
      !alex ||
      !david ||
      !emily ||
      !robert ||
      !james ||
      !sophia ||
      !daniel ||
      !olivia ||
      !william
    ) {
      throw new Error("Failed to retrieve seeded users");
    }

    const technicians = [
      john,
      alex,
      david,
      emily,
      robert,
      james,
      sophia,
      daniel,
      olivia,
      william,
    ];

    const creators = [
      admin,
      sarahAdmin,
      michaelAdmin,
    ];

    // =========================================================
    // 4. TICKETS
    // =========================================================

    const tickets = [
      {
        title: "Laptop not powering on",
        description:
          "The technician laptop does not power on even after connecting the charger.",
        priority: "URGENT",
        status: "IN_PROGRESS",
        creatorIndex: 0,
        technicianIndex: 0,
      },
      {
        title: "Office Wi-Fi connection issue",
        description:
          "Several employees are unable to connect to the office Wi-Fi network.",
        priority: "HIGH",
        status: "ASSIGNED",
        creatorIndex: 1,
        technicianIndex: 1,
      },
      {
        title: "Printer not responding",
        description:
          "The finance department printer is not responding to print requests.",
        priority: "MEDIUM",
        status: "OPEN",
        creatorIndex: 2,
        technicianIndex: null,
      },
      {
        title: "Email synchronization problem",
        description:
          "User mailbox is not synchronizing correctly with the desktop email client.",
        priority: "HIGH",
        status: "IN_PROGRESS",
        creatorIndex: 0,
        technicianIndex: 2,
      },
      {
        title: "Install development software",
        description:
          "Install the required development tools on a new employee workstation.",
        priority: "LOW",
        status: "COMPLETED",
        creatorIndex: 1,
        technicianIndex: 3,
      },
      {
        title: "VPN connection failure",
        description:
          "Remote employee cannot establish a connection to the company VPN.",
        priority: "URGENT",
        status: "ASSIGNED",
        creatorIndex: 2,
        technicianIndex: 4,
      },
      {
        title: "Monitor flickering",
        description:
          "External monitor intermittently flickers during normal operation.",
        priority: "MEDIUM",
        status: "OPEN",
        creatorIndex: 0,
        technicianIndex: null,
      },
      {
        title: "Password reset request",
        description:
          "Employee needs assistance resetting their corporate account password.",
        priority: "LOW",
        status: "COMPLETED",
        creatorIndex: 1,
        technicianIndex: 5,
      },
      {
        title: "Server room temperature alert",
        description:
          "Temperature monitoring system reports increased server room temperature.",
        priority: "URGENT",
        status: "IN_PROGRESS",
        creatorIndex: 2,
        technicianIndex: 6,
      },
      {
        title: "Keyboard replacement",
        description:
          "The keyboard assigned to the support desk is no longer functioning.",
        priority: "LOW",
        status: "COMPLETED",
        creatorIndex: 0,
        technicianIndex: 7,
      },
      {
        title: "Slow computer performance",
        description:
          "User reports significant performance degradation during normal work.",
        priority: "MEDIUM",
        status: "ASSIGNED",
        creatorIndex: 1,
        technicianIndex: 8,
      },
      {
        title: "Database access request",
        description:
          "Employee requires access to the internal reporting database.",
        priority: "HIGH",
        status: "OPEN",
        creatorIndex: 2,
        technicianIndex: null,
      },
      {
        title: "Unable to access shared drive",
        description:
          "User cannot access the department shared network drive.",
        priority: "HIGH",
        status: "IN_PROGRESS",
        creatorIndex: 0,
        technicianIndex: 9,
      },
      {
        title: "Operating system update",
        description:
          "Workstation requires the latest approved operating system updates.",
        priority: "MEDIUM",
        status: "COMPLETED",
        creatorIndex: 1,
        technicianIndex: 0,
      },
      {
        title: "Security software warning",
        description:
          "Endpoint security software is reporting a configuration warning.",
        priority: "HIGH",
        status: "ASSIGNED",
        creatorIndex: 2,
        technicianIndex: 1,
      },
      {
        title: "New employee account setup",
        description:
          "Create and configure system accounts for a new employee.",
        priority: "MEDIUM",
        status: "COMPLETED",
        creatorIndex: 0,
        technicianIndex: 2,
      },
      {
        title: "Conference room display issue",
        description:
          "Conference room display does not detect the connected laptop.",
        priority: "MEDIUM",
        status: "OPEN",
        creatorIndex: 1,
        technicianIndex: null,
      },
      {
        title: "Application crash on startup",
        description:
          "Internal business application crashes immediately after launch.",
        priority: "HIGH",
        status: "IN_PROGRESS",
        creatorIndex: 2,
        technicianIndex: 3,
      },
      {
        title: "Mouse replacement",
        description:
          "User's mouse is malfunctioning and needs replacement.",
        priority: "LOW",
        status: "COMPLETED",
        creatorIndex: 0,
        technicianIndex: 4,
      },
      {
        title: "Network outage in second floor",
        description:
          "Multiple workstations on the second floor have lost network connectivity.",
        priority: "URGENT",
        status: "IN_PROGRESS",
        creatorIndex: 1,
        technicianIndex: 5,
      },
        {
        title: "Access card not working",
        description:
          "Employee access card is not opening the main office entrance.",
        priority: "HIGH",
        status: "ASSIGNED",
        creatorIndex: 2,
        technicianIndex: 6,
      },
      {
        title: "Software license request",
        description:
          "Request for an additional software license for the design team.",
        priority: "LOW",
        status: "OPEN",
        creatorIndex: 0,
        technicianIndex: null,
      },
      {
        title: "File server backup failure",
        description:
          "The nightly file server backup did not complete successfully.",
        priority: "URGENT",
        status: "IN_PROGRESS",
        creatorIndex: 1,
        technicianIndex: 7,
      },
      {
        title: "Laptop battery issue",
        description:
          "Laptop battery drains unusually quickly even when fully charged.",
        priority: "MEDIUM",
        status: "ASSIGNED",
        creatorIndex: 2,
        technicianIndex: 8,
      },
      {
        title: "Browser configuration issue",
        description:
          "Corporate browser policies are not being applied correctly.",
        priority: "LOW",
        status: "COMPLETED",
        creatorIndex: 0,
        technicianIndex: 9,
      },
      {
        title: "Critical application unavailable",
        description:
          "A critical internal application is unavailable for multiple users.",
        priority: "URGENT",
        status: "IN_PROGRESS",
        creatorIndex: 1,
        technicianIndex: 0,
      },
      {
        title: "Desk phone not working",
        description:
          "Desk phone cannot make or receive internal calls.",
        priority: "MEDIUM",
        status: "OPEN",
        creatorIndex: 2,
        technicianIndex: null,
      },
      {
        title: "Shared mailbox access",
        description:
          "Employee needs access to the team's shared mailbox.",
        priority: "LOW",
        status: "COMPLETED",
        creatorIndex: 0,
        technicianIndex: 1,
      },
      {
        title: "Authentication service error",
        description:
          "Users are receiving intermittent authentication errors.",
        priority: "URGENT",
        status: "ASSIGNED",
        creatorIndex: 1,
        technicianIndex: 2,
      },
      {
        title: "Desktop overheating",
        description:
          "Desktop workstation becomes unusually hot during normal usage.",
        priority: "HIGH",
        status: "IN_PROGRESS",
        creatorIndex: 2,
        technicianIndex: 3,
      },
      {
        title: "New monitor request",
        description:
          "Employee requests an additional monitor for productivity.",
        priority: "LOW",
        status: "OPEN",
        creatorIndex: 0,
        technicianIndex: null,
      },
      {
        title: "Internal DNS issue",
        description:
          "Internal hostnames cannot be resolved from several workstations.",
        priority: "HIGH",
        status: "ASSIGNED",
        creatorIndex: 1,
        technicianIndex: 4,
      },
      {
        title: "File permission problem",
        description:
          "User cannot edit files in an authorized department folder.",
        priority: "MEDIUM",
        status: "COMPLETED",
        creatorIndex: 2,
        technicianIndex: 5,
      },
      {
        title: "Wireless access point failure",
        description:
          "One wireless access point is offline and requires investigation.",
        priority: "HIGH",
        status: "IN_PROGRESS",
        creatorIndex: 0,
        technicianIndex: 6,
      },
      {
        title: "Backup storage warning",
        description:
          "Backup storage is approaching its configured capacity threshold.",
        priority: "MEDIUM",
        status: "ASSIGNED",
        creatorIndex: 1,
        technicianIndex: 7,
      },
      {
        title: "Employee onboarding support",
        description:
          "Prepare workstation and required system access for a new employee.",
        priority: "MEDIUM",
        status: "COMPLETED",
        creatorIndex: 2,
        technicianIndex: 8,
      },
      {
        title: "Application installation request",
        description:
          "Install an approved business application on the employee workstation.",
        priority: "LOW",
        status: "OPEN",
        creatorIndex: 0,
        technicianIndex: null,
      },
      {
        title: "Network switch warning",
        description:
          "Network switch reports multiple port errors.",
        priority: "HIGH",
        status: "IN_PROGRESS",
        creatorIndex: 1,
        technicianIndex: 9,
      },
      {
        title: "Account locked",
        description:
          "Employee account has been locked after multiple failed login attempts.",
        priority: "HIGH",
        status: "COMPLETED",
        creatorIndex: 2,
        technicianIndex: 0,
      },
      {
        title: "Printer toner replacement",
        description:
          "The department printer requires a toner replacement.",
        priority: "LOW",
        status: "COMPLETED",
        creatorIndex: 0,
        technicianIndex: 1,
      },
      {
        title: "Critical network connectivity issue",
        description:
          "Multiple departments are experiencing severe network connectivity problems.",
        priority: "URGENT",
        status: "IN_PROGRESS",
        creatorIndex: 1,
        technicianIndex: 2,
      },
      {
        title: "Workstation login issue",
        description:
          "Employee cannot log into the assigned workstation.",
        priority: "MEDIUM",
        status: "ASSIGNED",
        creatorIndex: 2,
        technicianIndex: 3,
      },
      {
        title: "Cloud storage access",
        description:
          "User cannot access the company's cloud storage workspace.",
        priority: "HIGH",
        status: "OPEN",
        creatorIndex: 0,
        technicianIndex: null,
      },
      {
        title: "Keyboard input lag",
        description:
          "Wireless keyboard experiences intermittent input delays.",
        priority: "LOW",
        status: "COMPLETED",
        creatorIndex: 1,
        technicianIndex: 4,
      },
      {
        title: "Email delivery delay",
        description:
          "Outgoing emails are experiencing significant delivery delays.",
        priority: "HIGH",
        status: "ASSIGNED",
        creatorIndex: 2,
        technicianIndex: 5,
      },
      {
        title: "Server monitoring alert",
        description:
          "Monitoring system reports unusually high CPU utilization.",
        priority: "URGENT",
        status: "IN_PROGRESS",
        creatorIndex: 0,
        technicianIndex: 6,
      },
      {
        title: "Office application error",
        description:
          "User receives an unexpected error while opening an office document.",
        priority: "MEDIUM",
        status: "COMPLETED",
        creatorIndex: 1,
        technicianIndex: 7,
      },
      {
        title: "Remote desktop connection issue",
        description:
          "Technician cannot connect to a remote workstation using remote desktop.",
        priority: "HIGH",
        status: "ASSIGNED",
        creatorIndex: 2,
        technicianIndex: 8,
      },
      {
        title: "Equipment inventory update",
        description:
          "Update inventory information for recently deployed equipment.",
        priority: "LOW",
        status: "OPEN",
        creatorIndex: 0,
        technicianIndex: null,
      },
      {
        title: "Database connection timeout",
        description:
          "Internal application is intermittently timing out when connecting to the database.",
        priority: "URGENT",
        status: "IN_PROGRESS",
        creatorIndex: 1,
        technicianIndex: 9,
      },
      {
        title: "Desktop software update",
        description:
          "Update approved software packages on several employee desktops.",
        priority: "MEDIUM",
        status: "COMPLETED",
        creatorIndex: 2,
        technicianIndex: 0,
      },
      {
        title: "Network cable replacement",
        description:
          "Damaged network cable needs to be replaced at a workstation.",
        priority: "LOW",
        status: "COMPLETED",
        creatorIndex: 0,
        technicianIndex: 1,
      },
      {
        title: "Security incident investigation",
        description:
          "Investigate unusual login activity reported by the security monitoring system.",
        priority: "URGENT",
        status: "IN_PROGRESS",
        creatorIndex: 1,
        technicianIndex: 2,
      },
    ];

    // =========================================================
    // 5. INSERT TICKETS
    // =========================================================

    for (const ticket of tickets) {
      const creator = creators[ticket.creatorIndex];

      if (!creator) {
        throw new Error("Invalid ticket creator");
      }

      const assignedTo =
        ticket.technicianIndex !== null
          ? technicians[ticket.technicianIndex]
          : null;

      await connection.execute(
        `
          INSERT INTO tickets
          (
            title,
            description,
            priority,
            status,
            created_by,
            assigned_to
          )
          SELECT ?, ?, ?, ?, ?, ?
          WHERE NOT EXISTS (
            SELECT 1
            FROM tickets
            WHERE title = ?
          )
        `,
        [
          ticket.title,
          ticket.description,
          ticket.priority,
          ticket.status,
          creator.id,
          assignedTo?.id ?? null,
          ticket.title,
        ]
      );
    }

    console.log(` ${tickets.length} tickets processed`);

    // =========================================================
    // 6. COMMIT
    // =========================================================

    await connection.commit();

    console.log("====================================");
    console.log(" Database seed completed!");
    console.log("====================================");
    console.log("");
    console.log("Admin accounts:");
    console.log("  admin@example.com / Admin@123");
    console.log("  sarah.admin@example.com / Admin@123");
    console.log("  michael.admin@example.com / Admin@123");
    console.log("");
    console.log("Technician accounts:");
    console.log("  john@example.com / Tech@123");
    console.log("  alex@example.com / Tech@123");
    console.log("  david@example.com / Tech@123");
    console.log("  emily@example.com / Tech@123");
    console.log("  robert@example.com / Tech@123");
    console.log("  james@example.com / Tech@123");
    console.log("  sophia@example.com / Tech@123");
    console.log("  daniel@example.com / Tech@123");
    console.log("  olivia@example.com / Tech@123");
    console.log("  william@example.com / Tech@123");
    console.log("");
    console.log("🎉 Ready for development/testing!");

    process.exit(0);
  } catch (error) {
    await connection.rollback();

    console.error(" Seed failed:", error);

    process.exit(1);
  } finally {
    connection.release();
  }
};

seed();