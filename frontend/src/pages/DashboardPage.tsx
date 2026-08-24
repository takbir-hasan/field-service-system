import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

import { useAuth } from "../features/auth/AuthContext";
import {
  getAdminDashboardSummary,
  getTechnicianDashboardSummary,
  type DashboardSummary,
} from "../features/dashboard/dashboard.api";
import { getTickets } from "../features/tickets/ticket.api";
import { getTechnicians, type Technician } from "../features/users/user.api";

type StatCard = {
  label: string;
  value: number;
  accentClass: string;
};

const cardClassName =
  "rounded-3xl border border-white bg-white/80 p-5 shadow-lg shadow-violet-100 backdrop-blur";

const primaryButtonClass =
  "rounded-2xl bg-gradient-to-r from-violet-600 to-fuchsia-600 px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-violet-200 transition-all duration-200 hover:-translate-y-0.5 hover:from-violet-500 hover:to-fuchsia-500 hover:shadow-xl hover:cursor-pointer hover:shadow-violet-300 active:translate-y-0 active:shadow-md";

const secondaryButtonClass =
  "rounded-2xl border-2 border-slate-200 bg-white px-5 py-2.5 text-sm font-bold text-slate-600 transition-all duration-200 hover:-translate-y-0.5 hover:border-violet-300 hover:cursor-pointer hover:bg-violet-50 hover:text-violet-700 hover:shadow-md hover:shadow-violet-100 active:translate-y-0 active:bg-violet-100";

function toDashboardSummary(data: DashboardSummary): DashboardSummary {
  return {
    ...data,
    total_tickets: Number(data.total_tickets),
    open_tickets:
      data.open_tickets !== undefined ? Number(data.open_tickets) : undefined,
    assigned_tickets: Number(data.assigned_tickets),
    in_progress_tickets: Number(data.in_progress_tickets),
    completed_tickets: Number(data.completed_tickets),
    cancelled_tickets: Number(data.cancelled_tickets),
    urgent_tickets: Number(data.urgent_tickets),
    high_priority_tickets:
      data.high_priority_tickets !== undefined
        ? Number(data.high_priority_tickets)
        : undefined,
  };
}

async function buildFallbackSummary(): Promise<DashboardSummary> {
  const tickets = await getTickets();

  return {
    total_tickets: tickets.length,
    assigned_tickets: tickets.filter((t) => t.status === "ASSIGNED").length,
    in_progress_tickets: tickets.filter((t) => t.status === "IN_PROGRESS")
      .length,
    completed_tickets: tickets.filter((t) => t.status === "COMPLETED")
      .length,
    cancelled_tickets: tickets.filter((t) => t.status === "CANCELLED")
      .length,
    urgent_tickets: tickets.filter((t) => t.priority === "URGENT").length,
  };
}

function StatCardView({ label, value, accentClass }: StatCard) {
  return (
    <div
      className={`${cardClassName} transition-all duration-200 hover:-translate-y-1 hover:shadow-xl hover:shadow-violet-200`}
    >
      <div className={`mb-3 h-1.5 w-10 rounded-full ${accentClass}`} />
      <p className="text-sm font-semibold text-slate-500">{label}</p>
      <strong className="mt-1 block text-3xl font-extrabold text-slate-900">
        {value}
      </strong>
    </div>
  );
}

export default function DashboardPage() {
  const { user } = useAuth();

  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [technicians, setTechnicians] = useState<Technician[]>([]);

  const [isLoading, setIsLoading] = useState(true);
  const [isTechniciansLoading, setIsTechniciansLoading] = useState(false);
  const [error, setError] = useState("");
  const [techniciansError, setTechniciansError] = useState("");

  const isAdmin = user?.role === "ADMIN";

  const loadSummary = useCallback(async () => {
    if (!user) return;

    try {
      setIsLoading(true);
      setError("");

      const data = isAdmin
        ? await getAdminDashboardSummary()
        : await getTechnicianDashboardSummary().catch(buildFallbackSummary);

      setSummary(toDashboardSummary(data));
    } catch {
      setError("Failed to load dashboard");
    } finally {
      setIsLoading(false);
    }
  }, [isAdmin, user]);

  const loadTechnicians = useCallback(async () => {
    if (!isAdmin) {
      setTechnicians([]);
      setTechniciansError("");
      return;
    }

    try {
      setIsTechniciansLoading(true);
      setTechniciansError("");

      const data = await getTechnicians();
      setTechnicians(data);
    } catch {
      setTechniciansError("Failed to load technicians");
    } finally {
      setIsTechniciansLoading(false);
    }
  }, [isAdmin]);

  useEffect(() => {
    loadSummary();
  }, [loadSummary]);

  useEffect(() => {
    loadTechnicians();
  }, [loadTechnicians]);

  const stats = useMemo<StatCard[]>(() => {
    if (!summary) return [];

    const base: StatCard[] = [
      {
        label: "Total Tickets",
        value: summary.total_tickets,
        accentClass: "bg-violet-500",
      },
    ];

    if (isAdmin) {
      return [
        ...base,
        {
          label: "Open Tickets",
          value: summary.open_tickets ?? 0,
          accentClass: "bg-sky-500",
        },
        {
          label: "In Progress",
          value: summary.in_progress_tickets,
          accentClass: "bg-amber-500",
        },
        {
          label: "Completed",
          value: summary.completed_tickets,
          accentClass: "bg-emerald-500",
        },
      ];
    }

    return [
      ...base,
      {
        label: "Assigned",
        value: summary.assigned_tickets,
        accentClass: "bg-sky-500",
      },
      {
        label: "In Progress",
        value: summary.in_progress_tickets,
        accentClass: "bg-amber-500",
      },
      {
        label: "Completed",
        value: summary.completed_tickets,
        accentClass: "bg-emerald-500",
      },
      {
        label: "Cancelled",
        value: summary.cancelled_tickets,
        accentClass: "bg-rose-500",
      },
    ];
  }, [summary, isAdmin]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-violet-50 to-fuchsia-50 px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        {/* Header */}
        <header className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
              Field Service Management
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Welcome, {user?.name}
            </p>
          </div>

        </header>

        <main className="space-y-8">
          {/* Title + actions */}
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <h2 className="text-xl font-extrabold text-slate-900">
              {isAdmin ? "Dashboard" : "Technician Dashboard"}
            </h2>

            {!isAdmin ? (
              <Link to="/tickets">
                <button type="button" className={primaryButtonClass}>
                  View Assigned Tickets
                </button>
              </Link>
            ) : (
              <div className="flex flex-wrap gap-3">
                <Link to="/tickets">
                  <button type="button" className={secondaryButtonClass}>
                    View All Tickets
                  </button>
                </Link>
                <Link to="/tickets/new">
                  <button type="button" className={primaryButtonClass}>
                    Create New Ticket
                  </button>
                </Link>
              </div>
            )}
          </div>

          {!isAdmin && (
            <p className="text-sm text-slate-500">
              You can only view tickets assigned to you.
            </p>
          )}

          {/* Summary */}
          {isLoading && (
            <p className="text-sm font-medium text-slate-500">
              Loading dashboard...
            </p>
          )}

          {error && (
            <div
              role="alert"
              className="rounded-2xl border-2 border-rose-200 bg-rose-50 px-4 py-3"
            >
              <p className="text-sm font-semibold text-rose-700">{error}</p>
            </div>
          )}

          {!isLoading && !error && !summary && (
            <p className="text-sm text-slate-500">No dashboard data found.</p>
          )}

          {!isLoading && !error && summary && (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              {stats.map((stat) => (
                <StatCardView key={stat.label} {...stat} />
              ))}
            </div>
          )}

          {/* Technicians */}
          {isAdmin && (
            <section className={cardClassName}>
              <h3 className="mb-4 text-lg font-extrabold text-slate-900">
                All Technicians
              </h3>

              {isTechniciansLoading && (
                <p className="text-sm font-medium text-slate-500">
                  Loading technicians...
                </p>
              )}

              {techniciansError && (
                <p className="text-sm font-semibold text-rose-700">
                  {techniciansError}
                </p>
              )}

              {!isTechniciansLoading &&
                !techniciansError &&
                technicians.length === 0 && (
                  <p className="text-sm text-slate-500">
                    No technicians found.
                  </p>
                )}

              {!isTechniciansLoading &&
                !techniciansError &&
                technicians.length > 0 && (
                  <ul className="divide-y divide-slate-100">
                    {technicians.map((technician) => (
                      <li
                        key={technician.id}
                        className="flex flex-col justify-between gap-1 rounded-xl px-2 py-3 transition-colors duration-150 hover:bg-violet-50 sm:flex-row sm:items-center"
                      >
                        <span className="text-sm font-bold text-slate-800">
                          {technician.name}
                        </span>
                        <span className="text-sm text-slate-500">
                          {technician.email}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
            </section>
          )}
        </main>
      </div>
    </div>
  );
}