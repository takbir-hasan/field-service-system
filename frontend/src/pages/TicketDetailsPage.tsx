import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";

import {
  assignTicket,
  createTicketComment,
  getTicket,
  getTicketComments,
  updateTicketStatus,
} from "../features/tickets/ticket.api";
import { getTechnicians, type Technician } from "../features/users/user.api";
import { useAuth } from "../features/auth/AuthContext";
import type {
  Ticket,
  TicketComment,
  TicketStatus,
} from "../features/tickets/ticket.types";

const STATUS_OPTIONS: TicketStatus[] = [
  "OPEN",
  "ASSIGNED",
  "IN_PROGRESS",
  "COMPLETED",
  "CANCELLED",
];

const STATUS_BADGE_CLASS: Record<TicketStatus, string> = {
  OPEN: "border-sky-300 bg-sky-50 text-sky-700",
  ASSIGNED: "border-violet-300 bg-violet-50 text-violet-700",
  IN_PROGRESS: "border-amber-300 bg-amber-50 text-amber-700",
  COMPLETED: "border-emerald-300 bg-emerald-50 text-emerald-700",
  CANCELLED: "border-rose-300 bg-rose-50 text-rose-700",
};

const PRIORITY_BADGE_CLASS: Record<string, string> = {
  LOW: "border-emerald-300 bg-emerald-50 text-emerald-700",
  MEDIUM: "border-amber-300 bg-amber-50 text-amber-700",
  HIGH: "border-orange-300 bg-orange-50 text-orange-700",
  URGENT: "border-rose-300 bg-rose-50 text-rose-700",
};

const cardClassName =
  "rounded-3xl border border-white bg-white/80 p-6 shadow-lg shadow-violet-100 backdrop-blur";

const inputClassName =
  "w-full rounded-2xl border-2 border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-violet-500 focus:ring-4 focus:ring-violet-100";

const primaryButtonClass =
  "rounded-2xl bg-gradient-to-r hover:cursor-pointer from-violet-600 to-fuchsia-600 px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-violet-200 transition-all duration-200 hover:-translate-y-0.5 hover:from-violet-500 hover:to-fuchsia-500 hover:shadow-xl hover:shadow-violet-300 active:translate-y-0 active:shadow-md disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0 disabled:hover:shadow-none";

function badgeClass(extra: string) {
  return `inline-flex items-center rounded-full border-2 px-3 py-1 text-xs font-bold uppercase tracking-wide ${extra}`;
}

function formatDateTime(value: string) {
  return new Date(value).toLocaleString();
}

function ErrorNotice({ message }: { message: string }) {
  return (
    <div
      role="alert"
      className="mt-3 flex items-start gap-3 rounded-2xl border-2 border-rose-200 bg-rose-50 px-4 py-3"
    >
      <span
        className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-rose-500 text-xs font-bold text-white"
        aria-hidden="true"
      >
        !
      </span>
      <p className="text-sm font-semibold leading-snug text-rose-700">
        {message}
      </p>
    </div>
  );
}

export default function TicketDetailsPage() {
  const { id } = useParams();
  const { user } = useAuth();

  const ticketId = Number(id);
  const isValidTicketId = Number.isInteger(ticketId) && ticketId > 0;

  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [comments, setComments] = useState<TicketComment[]>([]);
  const [technicians, setTechnicians] = useState<Technician[]>([]);
  const [selectedTechnician, setSelectedTechnician] = useState("");
  const [statusDraft, setStatusDraft] = useState<TicketStatus | null>(null);
  const [comment, setComment] = useState("");

  const [isLoading, setIsLoading] = useState(true);
  const [isCommentLoading, setIsCommentLoading] = useState(false);
  const [isAssigning, setIsAssigning] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  const [error, setError] = useState("");
  const [commentError, setCommentError] = useState("");
  const [assignError, setAssignError] = useState("");
  const [statusError, setStatusError] = useState("");

  const isAdmin = user?.role === "ADMIN";
  const isTechnician = user?.role === "TECHNICIAN";
  const canUpdateStatus =
    isAdmin || (isTechnician && ticket?.technician_id === user?.id);

  const refreshTicket = useCallback(async () => {
    const ticketData = await getTicket(ticketId);

    setTicket(ticketData);
    setStatusDraft(ticketData.status);
    setSelectedTechnician(
      ticketData.technician_id ? String(ticketData.technician_id) : "",
    );
  }, [ticketId]);

  const loadTicketDetails = useCallback(async () => {
    if (!isValidTicketId) {
      setError("Invalid ticket ID");
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError("");

      const [ticketData, commentsData] = await Promise.all([
        getTicket(ticketId),
        getTicketComments(ticketId),
      ]);

      setTicket(ticketData);
      setComments(commentsData);
      setStatusDraft(ticketData.status);
      setSelectedTechnician(
        ticketData.technician_id ? String(ticketData.technician_id) : "",
      );
    } catch {
      setError("Failed to load ticket details");
    } finally {
      setIsLoading(false);
    }
  }, [isValidTicketId, ticketId]);

  useEffect(() => {
    loadTicketDetails();
  }, [loadTicketDetails]);

  // Load technicians for ADMIN
  useEffect(() => {
    if (!isAdmin) return;

    getTechnicians()
      .then(setTechnicians)
      .catch(() => setAssignError("Failed to load technicians"));
  }, [isAdmin]);

  const handleAssignTechnician = useCallback(async () => {
    if (!selectedTechnician) {
      setAssignError("Please select a technician");
      return;
    }

    try {
      setIsAssigning(true);
      setAssignError("");

      await assignTicket(ticketId, Number(selectedTechnician));
      await refreshTicket();
    } catch {
      setAssignError("Failed to assign technician");
    } finally {
      setIsAssigning(false);
    }
  }, [selectedTechnician, ticketId, refreshTicket]);

  const handleCommentSubmit = useCallback(
    async (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();

      const trimmedComment = comment.trim();
      if (!trimmedComment) return;

      try {
        setIsCommentLoading(true);
        setCommentError("");

        await createTicketComment(ticketId, trimmedComment);

        const [updatedComments] = await Promise.all([
          getTicketComments(ticketId),
          refreshTicket(),
        ]);
        setComments(updatedComments);
        setComment("");
      } catch {
        setCommentError("Failed to add comment");
      } finally {
        setIsCommentLoading(false);
      }
    },
    [comment, ticketId, refreshTicket],
  );

  const handleStatusUpdate = useCallback(
    async (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      if (!ticket || !statusDraft) return;

      try {
        setIsUpdatingStatus(true);
        setStatusError("");

        await updateTicketStatus(ticket.id, statusDraft);
        await refreshTicket();
      } catch {
        setStatusError("Failed to update status");
      } finally {
        setIsUpdatingStatus(false);
      }
    },
    [ticket, statusDraft, refreshTicket],
  );

  const sortedComments = useMemo(
    () =>
      [...comments].sort(
        (a, b) =>
          new Date(a.created_at).getTime() -
          new Date(b.created_at).getTime(),
      ),
    [comments],
  );

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-indigo-50 via-violet-50 to-fuchsia-50">
        <p className="text-sm font-medium text-slate-500">
          Loading ticket...
        </p>
      </div>
    );
  }

  if (error || !ticket) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-indigo-50 via-violet-50 to-fuchsia-50 px-4">
        <div className={`${cardClassName} max-w-sm text-center`}>
          <p className="text-sm font-semibold text-rose-700">
            {error || "Ticket not found."}
          </p>
          <Link
            to="/tickets"
            className="mt-4 inline-block text-sm font-bold text-violet-700 hover:text-violet-900 hover:underline hover:underline-offset-4"
          >
            Back to Tickets
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-violet-50 to-fuchsia-50 px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl space-y-6">
        {/* Header */}
        <div>
          <Link
            to="/tickets"
            className="mb-3 inline-block text-sm font-semibold text-violet-700 transition-colors duration-200 hover:text-violet-900 hover:underline hover:underline-offset-4"
          >
            ← Back to Tickets
          </Link>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
            Ticket #{ticket.id}
          </h1>
        </div>

        {/* Ticket Details */}
        <section className={cardClassName}>
          <div className="mb-2 h-1.5 w-10 rounded-full bg-violet-500" />
          <h2 className="text-xl font-extrabold text-slate-900">
            {ticket.title}
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-slate-600">
            {ticket.description}
          </p>

          <div className="mt-4 flex flex-wrap gap-2">
            <span
              className={badgeClass(
                PRIORITY_BADGE_CLASS[ticket.priority] ??
                  "border-slate-300 bg-slate-50 text-slate-700",
              )}
            >
              {ticket.priority}
            </span>
            <span
              className={badgeClass(
                STATUS_BADGE_CLASS[ticket.status] ??
                  "border-slate-300 bg-slate-50 text-slate-700",
              )}
            >
              {ticket.status.replace("_", " ")}
            </span>
          </div>

          {canUpdateStatus && (
            <form
              onSubmit={handleStatusUpdate}
              className="mt-5 flex flex-col gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:items-end"
            >
              <div className="flex-1">
                <label
                  htmlFor="status"
                  className="mb-2 block text-sm font-bold text-slate-800"
                >
                  Update Status
                </label>
                <select
                  id="status"
                  value={statusDraft ?? ticket.status}
                  onChange={(event) =>
                    setStatusDraft(event.target.value as TicketStatus)
                  }
                  className={inputClassName}
                >
                  {STATUS_OPTIONS.map((status) => (
                    <option key={status} value={status}>
                      {status.replace("_", " ")}
                    </option>
                  ))}
                </select>
              </div>

              <button
                type="submit"
                disabled={isUpdatingStatus}
                className={primaryButtonClass}
              >
                {isUpdatingStatus ? "Updating..." : "Update Status"}
              </button>
            </form>
          )}
          {statusError && <ErrorNotice message={statusError} />}

          <div className="mt-5 grid grid-cols-1 gap-2 border-t border-slate-100 pt-5 text-sm text-slate-500 sm:grid-cols-2">
            <p>
              <span className="font-semibold text-slate-700">Created:</span>{" "}
              {formatDateTime(ticket.created_at)}
            </p>
            <p>
              <span className="font-semibold text-slate-700">
                Last Updated:
              </span>{" "}
              {formatDateTime(ticket.updated_at)}
            </p>
          </div>
        </section>

        {/* Creator + Technician */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <section className={cardClassName}>
            <h3 className="mb-3 text-sm font-extrabold uppercase tracking-wide text-slate-500">
              Created By
            </h3>
            <p className="text-sm font-bold text-slate-800">
              {ticket.creator_name}
            </p>
            <p className="text-sm text-slate-500">{ticket.creator_email}</p>
          </section>

          <section className={cardClassName}>
            <h3 className="mb-3 text-sm font-extrabold uppercase tracking-wide text-slate-500">
              Assigned Technician
            </h3>
            {ticket.technician_id ? (
              <>
                <p className="text-sm font-bold text-slate-800">
                  {ticket.technician_name}
                </p>
                <p className="text-sm text-slate-500">
                  {ticket.technician_email}
                </p>
              </>
            ) : (
              <p className="text-sm text-slate-400">Not assigned</p>
            )}
          </section>
        </div>

        {/* ADMIN Assignment */}
        {isAdmin && (
          <section className={cardClassName}>
            <h3 className="mb-4 text-sm font-extrabold uppercase tracking-wide text-slate-500">
              Assign Technician
            </h3>

            <div className="flex flex-col gap-3 sm:flex-row">
              <select
                value={selectedTechnician}
                onChange={(event) =>
                  setSelectedTechnician(event.target.value)
                }
                className={`${inputClassName} sm:flex-1`}
              >
                <option value="">Select technician</option>
                {technicians.map((technician) => (
                  <option key={technician.id} value={technician.id}>
                    {technician.name} ({technician.email})
                  </option>
                ))}
              </select>

              <button
                type="button"
                onClick={handleAssignTechnician}
                disabled={isAssigning || !selectedTechnician}
                className={primaryButtonClass}
              >
                {isAssigning ? "Assigning..." : "Assign Technician"}
              </button>
            </div>
            {assignError && <ErrorNotice message={assignError} />}
          </section>
        )}

        {/* Activity */}
        <section className={cardClassName}>
          <h3 className="mb-4 text-sm font-extrabold uppercase tracking-wide text-slate-500">
            Activity
          </h3>
          <div className="flex gap-8">
            <div>
              <p className="text-2xl font-extrabold text-slate-900">
                {ticket.comment_count}
              </p>
              <p className="text-xs font-semibold text-slate-500">
                Comments
              </p>
            </div>
            <div>
              <p className="text-2xl font-extrabold text-slate-900">
                {ticket.history_count}
              </p>
              <p className="text-xs font-semibold text-slate-500">
                Status Changes
              </p>
            </div>
          </div>
        </section>

        {/* Comments */}
        <section className={cardClassName}>
          <h3 className="mb-4 text-sm font-extrabold uppercase tracking-wide text-slate-500">
            Comments
          </h3>

          {sortedComments.length === 0 ? (
            <p className="text-sm text-slate-400">No comments yet.</p>
          ) : (
            <div className="space-y-4">
              {sortedComments.map((item) => (
                <div
                  key={item.id}
                  className="rounded-2xl border border-slate-100 bg-slate-50/60 p-4"
                >
                  <div className="flex flex-wrap items-baseline gap-2">
                    <strong className="text-sm font-bold text-slate-800">
                      {item.user_name}
                    </strong>
                    <span className="text-xs font-semibold uppercase tracking-wide text-violet-500">
                      {item.user_role}
                    </span>
                  </div>
                  <p className="mt-1 text-sm leading-relaxed text-slate-600">
                    {item.comment}
                  </p>
                  <small className="mt-2 block text-xs text-slate-400">
                    {formatDateTime(item.created_at)}
                  </small>
                </div>
              ))}
            </div>
          )}

          {/* Add Comment */}
          <form
            onSubmit={handleCommentSubmit}
            className="mt-6 space-y-3 border-t border-slate-100 pt-6"
          >
            <div>
              <label
                htmlFor="comment"
                className="mb-2 block text-sm font-bold text-slate-800"
              >
                Add Comment
              </label>
              <textarea
                id="comment"
                value={comment}
                onChange={(event) => setComment(event.target.value)}
                placeholder="Write a comment..."
                rows={4}
                required
                className={`resize-y ${inputClassName}`}
              />
            </div>

            {commentError && <ErrorNotice message={commentError} />}

            <button
              type="submit"
              disabled={isCommentLoading || !comment.trim()}
              className={primaryButtonClass}
            >
              {isCommentLoading ? "Adding..." : "Add Comment"}
            </button>
          </form>
        </section>
      </div>
    </div>
  );
}