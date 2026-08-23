import { Navigate, Outlet } from "react-router-dom";

import { useAuth } from "../features/auth/AuthContext";

interface RoleRouteProps {
  allowedRoles: Array<"ADMIN" | "TECHNICIAN">;
}

export default function RoleRoute({
  allowedRoles,
}: RoleRouteProps) {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!allowedRoles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
}