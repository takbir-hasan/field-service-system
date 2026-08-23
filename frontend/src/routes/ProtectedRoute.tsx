import { Navigate, Outlet } from "react-router-dom";

import { useAuth } from "../features/auth/AuthContext";

type UserRole = "ADMIN" | "TECHNICIAN";

interface ProtectedRouteProps {
  allowedRoles?: UserRole[];
}

export default function ProtectedRoute({
  allowedRoles,
}: ProtectedRouteProps) {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (
    allowedRoles &&
    (!user || !allowedRoles.includes(user.role))
  ) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
}