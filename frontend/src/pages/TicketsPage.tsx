import { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";

import { useAuth } from "../features/auth/AuthContext";
import { getTickets, type GetTicketsParams } from "../features/tickets/ticket.api";
import type {
  Ticket,
  TicketPriority,
  TicketStatus,
} from "../features/tickets/ticket.types";

const STATUS_OPTIONS: TicketStatus[] = [
  "OPEN",
  "ASSIGNED",
  "IN_PROGRESS",
  "COMPLETED",
  "CANCELLED",
];

const PRIORITY_OPTIONS: TicketPriority[] = [
  "LOW",
  "MEDIUM",
  "HIGH",
  "URGENT",
];

const STATUS_BADGE_CLASS: Record<string, string> = {
  OPEN: "border-sky-300 bg-sky-50 text-sky-700",
  ASSIGNED: "border-violet-300 bg-violet-50 text-violet-700",
  IN_PROGRESS:
    "border-amber-300 bg-amber-50 text-amber-700",
  COMPLETED:
    "border-emerald-300 bg-emerald-50 text-emerald-700",
  CANCELLED:
    "border-rose-300 bg-rose-50 text-rose-700",
};

const PRIORITY_BADGE_CLASS: Record<string, string> = {
  LOW: "border-emerald-300 bg-emerald-50 text-emerald-700",
  MEDIUM: "border-amber-300 bg-amber-50 text-amber-700",
  HIGH: "border-orange-300 bg-orange-50 text-orange-700",
  URGENT: "border-rose-300 bg-rose-50 text-rose-700",
};

const cardClassName =
  "rounded-3xl border border-white bg-white/80 shadow-lg shadow-violet-100 backdrop-blur";

function badgeClass(extra: string) {
  return `inline-flex items-center rounded-full border-2 px-3 py-1 text-xs font-bold uppercase tracking-wide ${extra}`;
}

function formatDateTime(value: string) {
  return new Date(value).toLocaleString();
}

const filterInputClassName =
  "w-full rounded-xl border-2 border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none transition focus:border-violet-500 focus:ring-4 focus:ring-violet-100";

export default function TicketsPage() {
  const { user } = useAuth();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<TicketStatus | "">("");
  const [priority, setPriority] = useState<TicketPriority | "">("");
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState("");

  const isAdmin = user?.role === "ADMIN";
  const hasLoadedTickets = useRef(false);

  const loadTickets = useCallback(async (filters: GetTicketsParams = {}) => {
    try {
      if (hasLoadedTickets.current) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }
      setError("");

      const data = await getTickets({
        search: filters.search?.trim() || undefined,
        status: filters.status || undefined,
        priority: filters.priority || undefined,
        limit: 100,
      });
      setTickets(data);
      hasLoadedTickets.current = true;
    } catch {
      setError("Failed to load tickets");
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      loadTickets({
        search,
        status: status || undefined,
        priority: priority || undefined,
      });
    }, 300);

    return () => window.clearTimeout(timeoutId);
  }, [loadTickets, priority, search, status]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-indigo-50 via-violet-50 to-fuchsia-50">
        <div className="text-center">
          <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-violet-200 border-t-violet-600" />

          <p className="text-sm font-semibold text-slate-500">
            Loading tickets...
          </p>
        </div>
      </div>
    );
  }

  if (error && tickets.length === 0) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-indigo-50 via-violet-50 to-fuchsia-50 px-4">
        <div
          className={`${cardClassName} w-full max-w-md p-6 text-center`}
        >
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-rose-100 text-lg font-bold text-rose-600">
            !
          </div>

          <h2 className="mt-4 text-lg font-extrabold text-slate-900">
            Something went wrong
          </h2>

          <p className="mt-2 text-sm text-rose-600">
            {error}
          </p>

          <button
            type="button"
            onClick={() =>
              loadTickets({
                search,
                status: status || undefined,
                priority: priority || undefined,
              })
            }
            className="mt-5 rounded-2xl bg-gradient-to-r from-violet-600 to-fuchsia-600 px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-violet-200 transition hover:-translate-y-0.5 hover:shadow-xl"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-violet-50 to-fuchsia-50 px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl space-y-8">
        {/* Header */}
        <header className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="mb-2 text-sm font-bold uppercase tracking-widest text-violet-600">
              Field Service Management
            </p>

            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
              Tickets
            </h1>

            <p className="mt-2 text-sm text-slate-500">
              Manage and monitor all service tickets.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Link
              to="/dashboard"
              className="inline-flex items-center justify-center rounded-2xl border-2 border-violet-200 bg-white px-5 py-3 text-sm font-bold text-violet-700 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-violet-300 hover:bg-violet-50 hover:shadow-md"
            >
              Dashboard
            </Link>

            {isAdmin && (
              <Link
                to="/tickets/new"
                className="inline-flex items-center justify-center rounded-2xl bg-gradient-to-r from-violet-600 to-fuchsia-600 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-violet-200 transition-all duration-200 hover:-translate-y-0.5 hover:from-violet-500 hover:to-fuchsia-500 hover:shadow-xl hover:shadow-violet-300"
              >
                <span className="mr-2 text-lg">+</span>
                Create Ticket
              </Link>
            )}
          </div>
        </header>

        {/* Summary */}
        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div className={`${cardClassName} p-5`}>
            <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
              Total Tickets
            </p>

            <p className="mt-2 text-3xl font-extrabold text-slate-900">
              {tickets.length}
            </p>
          </div>

          {STATUS_OPTIONS.map((status) => (
            <div key={status} className={`${cardClassName} p-5`}>
              <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                {status.replace("_", " ")}
              </p>

              <p className="mt-2 text-3xl font-extrabold text-violet-600">
                {tickets.filter((ticket) => ticket.status === status).length}
              </p>
            </div>
          ))}
        </section>

        {/* Tickets */}
        <section>
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-extrabold text-slate-900">
                All Tickets
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                {tickets.length} ticket
                {tickets.length !== 1 ? "s" : ""} found
              </p>
            </div>
            {isRefreshing && (
              <p className="text-xs font-semibold text-violet-600">
                Updating...
              </p>
            )}
          </div>

          <div className={`${cardClassName} mb-5 grid grid-cols-1 gap-3 p-4 sm:grid-cols-2 lg:grid-cols-4`}>
            <label className="lg:col-span-2">
              <span className="sr-only">Search tickets</span>
              <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search tickets..."
                className={filterInputClassName}
              />
            </label>

            <label>
              <span className="sr-only">Filter by status</span>
              <select
                value={status}
                onChange={(event) =>
                  setStatus(event.target.value as TicketStatus | "")
                }
                className={filterInputClassName}
              >
                <option value="">All statuses</option>
                {STATUS_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                    {option.replace("_", " ")}
                  </option>
                ))}
              </select>
            </label>

            <label>
              <span className="sr-only">Filter by priority</span>
              <select
                value={priority}
                onChange={(event) =>
                  setPriority(event.target.value as TicketPriority | "")
                }
                className={filterInputClassName}
              >
                <option value="">All priorities</option>
                {PRIORITY_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </label>
          </div>

          {tickets.length === 0 ? (
            <div
              className={`${cardClassName} p-10 text-center`}
            >
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-violet-100 text-2xl text-violet-600">
                🎫
              </div>

              <h3 className="mt-4 text-lg font-extrabold text-slate-900">
                No tickets found
              </h3>

              <p className="mt-2 text-sm text-slate-500">
                There are currently no service tickets.
              </p>

              {isAdmin && (
                <Link
                  to="/tickets/new"
                  className="mt-5 inline-flex rounded-2xl bg-violet-600 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-violet-700"
                >
                  Create Your First Ticket
                </Link>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
              {tickets.map((ticket) => (
                <article
                  key={ticket.id}
                  className={`${cardClassName} group p-6 transition-all duration-200 hover:-translate-y-1 hover:shadow-xl hover:shadow-violet-200`}
                >
                  {/* Ticket Header */}
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <p className="text-xs font-bold uppercase tracking-wider text-violet-600">
                        Ticket #{ticket.id}
                      </p>

                      <Link
                        to={`/tickets/${ticket.id}`}
                        className="mt-1 block"
                      >
                        <h3 className="truncate text-lg font-extrabold text-slate-900 transition-colors group-hover:text-violet-700">
                          {ticket.title}
                        </h3>
                      </Link>
                    </div>

                    <Link
                      to={`/tickets/${ticket.id}`}
                      className="shrink-0 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-600 transition hover:border-violet-300 hover:bg-violet-50 hover:text-violet-700"
                    >
                      View
                    </Link>
                  </div>

                  {/* Description */}
                  <p className="mt-4 line-clamp-2 text-sm leading-relaxed text-slate-600">
                    {ticket.description}
                  </p>

                  {/* Badges */}
                  <div className="mt-5 flex flex-wrap gap-2">
                    <span
                      className={badgeClass(
                        PRIORITY_BADGE_CLASS[
                          ticket.priority
                        ] ??
                          "border-slate-300 bg-slate-50 text-slate-700",
                      )}
                    >
                      {ticket.priority}
                    </span>

                    <span
                      className={badgeClass(
                        STATUS_BADGE_CLASS[
                          ticket.status
                        ] ??
                          "border-slate-300 bg-slate-50 text-slate-700",
                      )}
                    >
                      {ticket.status.replace(
                        "_",
                        " ",
                      )}
                    </span>
                  </div>

                  {/* Footer */}
                  <div className="mt-6 flex flex-col gap-3 border-t border-slate-100 pt-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                        Created
                      </p>

                      <p className="mt-1 text-sm font-semibold text-slate-600">
                        {formatDateTime(
                          ticket.created_at,
                        )}
                      </p>
                    </div>

                    <Link
                      to={`/tickets/${ticket.id}`}
                      className="text-sm font-bold text-violet-700 transition hover:text-violet-900 hover:underline hover:underline-offset-4"
                    >
                      View Details →
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
