import { Navigate, Route, Routes } from "react-router-dom";

export default function AppRoutes() {
  return (
    <Routes>
      <Route
        path="/login"
        element={<div>Login Page</div>}
      />

      <Route
        path="/dashboard"
        element={<div>Dashboard Page</div>}
      />

      <Route
        path="/tickets"
        element={<div>Tickets Page</div>}
      />

      <Route
        path="/"
        element={<Navigate to="/dashboard" replace />}
      />

      <Route
        path="*"
        element={<Navigate to="/dashboard" replace />}
      />
    </Routes>
  );
}