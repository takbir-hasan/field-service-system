import { useCallback, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import { createTicket } from "../features/tickets/ticket.api";
import type { TicketPriority } from "../features/tickets/ticket.types";

const TITLE_MAX_LENGTH = 200;

const PRIORITY_OPTIONS: {
  value: TicketPriority;
  label: string;
  dotClass: string;
  activeClass: string;
}[] = [
  {
    value: "LOW",
    label: "Low",
    dotClass: "bg-emerald-500",
    activeClass: "border-emerald-400 bg-emerald-50 text-emerald-700 ring-emerald-200",
  },
  {
    value: "MEDIUM",
    label: "Medium",
    dotClass: "bg-amber-500",
    activeClass: "border-amber-400 bg-amber-50 text-amber-700 ring-amber-200",
  },
  {
    value: "HIGH",
    label: "High",
    dotClass: "bg-orange-500",
    activeClass: "border-orange-400 bg-orange-50 text-orange-700 ring-orange-200",
  },
  {
    value: "URGENT",
    label: "Urgent",
    dotClass: "bg-rose-500",
    activeClass: "border-rose-400 bg-rose-50 text-rose-700 ring-rose-200",
  },
];

const inputClassName =
  "w-full rounded-2xl border-2 border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-violet-500 focus:ring-4 focus:ring-violet-100";

export default function CreateTicketPage() {
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<TicketPriority>("MEDIUM");

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const trimmedTitle = title.trim();
  const trimmedDescription = description.trim();
  const isFormValid = trimmedTitle.length > 0 && trimmedDescription.length > 0;

  const goToTickets = useCallback(() => navigate("/tickets"), [navigate]);

  const handleSubmit = useCallback(
    async (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      if (!isFormValid || isLoading) return;

      setError("");
      setIsLoading(true);

      try {
        await createTicket({
          title: trimmedTitle,
          description: trimmedDescription,
          priority,
        });

        navigate("/tickets");
      } catch {
        setError("Failed to create ticket. Please try again.");
      } finally {
        setIsLoading(false);
      }
    },
    [isFormValid, isLoading, trimmedTitle, trimmedDescription, priority, navigate],
  );

  const priorityButtons = useMemo(
    () =>
      PRIORITY_OPTIONS.map(({ value, label, dotClass, activeClass }) => {
        const isActive = priority === value;
        return (
          <button
            key={value}
            type="button"
            onClick={() => setPriority(value)}
            aria-pressed={isActive}
            className={`flex flex-1 items-center hover:cursor-pointer justify-center gap-2 rounded-2xl border-2 px-3 py-3 text-sm font-semibold transition ${
              isActive
                ? `${activeClass} ring-4`
                : "border-slate-200 bg-white text-slate-500 hover:border-slate-300 hover:bg-slate-50"
            }`}
          >
            <span className={`h-2 w-2 rounded-full ${dotClass}`} aria-hidden="true" />
            {label}
          </button>
        );
      }),
    [priority],
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-violet-50 to-fuchsia-50 px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl">
        {/* Header */}
        <div className="mb-8">
          <button
            type="button"
            onClick={goToTickets}
            className="mb-5 inline-flex hover:cursor-pointer items-center gap-2 text-sm font-semibold text-violet-700 transition hover:text-violet-900"
          >
            <span aria-hidden="true">←</span>
            Back to Tickets
          </button>

          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
            Create Ticket
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Tell us what's wrong — we'll route it to the right team.
          </p>
        </div>

        {/* Form Card */}
        <div className="relative overflow-hidden rounded-3xl border border-white bg-white/80 p-6 shadow-xl shadow-violet-100 backdrop-blur sm:p-8">
          <div className="pointer-events-none absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r from-violet-500 via-fuchsia-500 to-rose-400" />

          <form onSubmit={handleSubmit} className="space-y-7" noValidate>
            {/* Title */}
            <div>
              <label
                htmlFor="title"
                className="mb-2 block text-sm font-bold text-slate-800"
              >
                Ticket Title
              </label>

              <input
                id="title"
                type="text"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                placeholder="e.g. Laptop is not turning on"
                required
                maxLength={TITLE_MAX_LENGTH}
                className={inputClassName}
              />

              <div className="mt-2 flex justify-end">
                <span className="text-xs font-medium text-slate-400">
                  {title.length}/{TITLE_MAX_LENGTH}
                </span>
              </div>
            </div>

            {/* Description */}
            <div>
              <label
                htmlFor="description"
                className="mb-2 block text-sm font-bold text-slate-800"
              >
                Description
              </label>

              <textarea
                id="description"
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                placeholder="Describe the issue in detail..."
                required
                rows={6}
                className={`resize-y ${inputClassName}`}
              />

              <p className="mt-2 text-xs text-slate-400">
                Include useful information such as the problem, affected
                device, and any error messages.
              </p>
            </div>

            {/* Priority */}
            <div>
              <label className="mb-2 block text-sm font-bold text-slate-800">
                Priority
              </label>

              <div className="flex gap-2" role="group" aria-label="Priority">
                {priorityButtons}
              </div>
            </div>

            {/* Error */}
            {error && (
              <div
                role="alert"
                className="rounded-2xl border-2 border-rose-200 bg-rose-50 px-4 py-3"
              >
                <p className="text-sm font-semibold text-rose-700">{error}</p>
              </div>
            )}

            {/* Actions */}
            <div className="flex flex-col-reverse gap-3 border-t border-slate-100 pt-6 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={goToTickets}
                disabled={isLoading}
                className="rounded-2xl border-2 border-slate-200 hover:cursor-pointer bg-white px-5 py-3 text-sm font-bold text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={isLoading || !isFormValid}
                className="rounded-2xl bg-gradient-to-r hover:cursor-pointer from-violet-600 to-fuchsia-600 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-violet-200 transition hover:from-violet-700 hover:to-fuchsia-700 focus:outline-none focus:ring-4 focus:ring-violet-200 disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none"
              >
                {isLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                    Creating...
                  </span>
                ) : (
                  "Create Ticket"
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Bottom hint */}
        <p className="mt-4 text-center text-xs text-slate-400">
          After creating the ticket, you will be redirected to the ticket
          list.
        </p>
      </div>
    </div>
  );
}