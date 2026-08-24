import { Link, Outlet, useLocation } from "react-router-dom";

import { useAuth } from "../features/auth/AuthContext";

const secondaryButtonClass =
  "inline-flex h-10 cursor-pointer items-center rounded-xl border-2 border-slate-200 bg-white px-4 text-sm font-bold text-slate-600 transition-all duration-200 hover:-translate-y-0.5 hover:border-violet-300 hover:bg-violet-50 hover:text-violet-700 hover:shadow-md hover:shadow-violet-100 active:translate-y-0 active:bg-violet-100";

const navLinkClass =
  "inline-flex h-10 items-center rounded-xl px-4 text-sm font-bold transition";

export default function ProtectedLayout() {
  const { user, logout } = useAuth();
  const location = useLocation();

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-violet-50 to-fuchsia-50">
      <header className="border-b border-white/80 bg-white/70 backdrop-blur">
        <div className="mx-auto flex max-w-6xl justify-end px-4 py-4 sm:px-6 lg:px-8">
          <nav className="flex flex-wrap items-center justify-end gap-2" aria-label="Main navigation">
            <Link
              to="/dashboard"
              className={`${navLinkClass} ${
                location.pathname === "/dashboard"
                  ? "bg-violet-100 text-violet-700"
                  : "text-slate-600 hover:bg-violet-50 hover:text-violet-700"
              }`}
            >
              Dashboard
            </Link>
            <Link
              to="/tickets"
              className={`${navLinkClass} ${
                location.pathname.startsWith("/tickets")
                  ? "bg-violet-100 text-violet-700"
                  : "text-slate-600 hover:bg-violet-50 hover:text-violet-700"
              }`}
            >
              Tickets
            </Link>
            <span className="hidden rounded-full border-2 border-violet-200 bg-violet-50 px-3 py-1 text-xs font-bold uppercase tracking-wide text-violet-700 sm:inline-flex">
              {user?.role}
            </span>
            <button
              type="button"
              onClick={logout}
              className={secondaryButtonClass}
            >
              Logout
            </button>
          </nav>
        </div>
      </header>

      <Outlet />
    </div>
  );
}