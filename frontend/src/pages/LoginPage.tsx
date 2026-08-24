import { useCallback, useState } from "react";
import { useNavigate } from "react-router-dom";

import { useAuth } from "../features/auth/AuthContext";

const inputClassName =
  "w-full rounded-2xl border-2 border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-violet-500 focus:ring-4 focus:ring-violet-100";

const primaryButtonClass =
  "w-full rounded-2xl bg-gradient-to-r from-violet-600 to-fuchsia-600 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-violet-200 transition-all duration-200 hover:-translate-y-0.5 hover:from-violet-500 hover:to-fuchsia-500 hover:shadow-xl hover:shadow-violet-300 active:translate-y-0 active:shadow-md disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0 disabled:hover:shadow-none";

function getErrorMessage(error: unknown): string {
  const status =
    typeof error === "object" &&
    error !== null &&
    "response" in error &&
    typeof (error as any).response?.status === "number"
      ? (error as any).response.status
      : undefined;

  // Only map known, safe status codes to a friendly message.
  // Never surface the raw backend/server message — it can leak internal
  // details (stack traces, query info, infra hints) to the client.
  switch (status) {
    case 400:
      return "Please check your email and password and try again.";
    case 401:
    case 403:
      return "Invalid email or password.";
    case 404:
      return "We couldn't find an account with that email.";
    case 429:
      return "Too many attempts. Please wait a moment and try again.";
    case 500:
    case 502:
    case 503:
      return "Something went wrong on our end. Please try again shortly.";
    default:
      return "Invalid email or password.";
  }
}

export default function LoginPage() {
  const navigate = useNavigate();
  const { loginUser, isLoading } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = useCallback(
    async (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      if (isLoading) return;

      setError("");

      try {
        await loginUser({ email, password });
        navigate("/dashboard");
      } catch (err: unknown) {
        setError(getErrorMessage(err));
      }
    },
    [email, password, isLoading, loginUser, navigate],
  );

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-indigo-50 via-violet-50 to-fuchsia-50 px-4 py-10">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
            Welcome back
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Sign in to manage your service tickets.
          </p>
        </div>

        {/* Form Card */}
        <div className="relative overflow-hidden rounded-3xl border border-white bg-white/80 p-6 shadow-xl shadow-violet-100 backdrop-blur sm:p-8">
          <div className="pointer-events-none absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r from-violet-500 via-fuchsia-500 to-rose-400" />

          <form onSubmit={handleSubmit} className="space-y-6" noValidate>
            {/* Email */}
            <div>
              <label
                htmlFor="email"
                className="mb-2 block text-sm font-bold text-slate-800"
              >
                Email
              </label>

              <input
                id="email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="you@company.com"
                autoComplete="email"
                required
                className={inputClassName}
              />
            </div>

            {/* Password */}
            <div>
              <label
                htmlFor="password"
                className="mb-2 block text-sm font-bold text-slate-800"
              >
                Password
              </label>

              <input
                id="password"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="••••••••"
                autoComplete="current-password"
                required
                className={inputClassName}
              />
            </div>

            {/* Error */}
            {error && (
              <div
                role="alert"
                className="flex items-start gap-3 rounded-2xl border-2 border-rose-200 bg-rose-50 px-4 py-3"
              >
                <span
                  className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-rose-500 text-xs font-bold text-white"
                  aria-hidden="true"
                >
                  !
                </span>
                <p className="text-sm font-semibold leading-snug text-rose-700">
                  {error}
                </p>
              </div>
            )}

            {/* Submit */}
            <button type="submit" disabled={isLoading} className={primaryButtonClass}>
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  Logging in...
                </span>
              ) : (
                "Login"
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}