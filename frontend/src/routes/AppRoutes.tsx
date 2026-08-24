import { Navigate, Route, Routes } from "react-router-dom";

import LoginPage from "../pages/LoginPage";
import ProtectedRoute from "./ProtectedRoute";
import DashboardPage from "../pages/DashboardPage";
import TicketsPage from "../pages/TicketsPage";
import CreateTicketPage from "../pages/CreateTicketPage";
import TicketDetailsPage from "../pages/TicketDetailsPage";
import ProtectedLayout from "../layouts/ProtectedLayout";

export default function AppRoutes() {
  return (
    <Routes>
      {/* Public */}
      <Route
        path="/login"
        element={<LoginPage />}
      />

      {/* Protected */}
      <Route element={<ProtectedRoute />}>
        <Route element={<ProtectedLayout />}>
          <Route
            path="/dashboard"
            element={<DashboardPage />}
          />

        <Route
          path="/tickets"
          element={<TicketsPage />}
        />

        <Route
            path="/tickets/:id"
            element={<TicketDetailsPage />}
          />

          <Route element={<ProtectedRoute allowedRoles={["ADMIN"]} />}>
            <Route
              path="/tickets/new"
              element={<CreateTicketPage />}
            />
          </Route>
        </Route>
      </Route>

      {/* Default */}
      <Route
        path="/"
        element={
          <Navigate
            to="/dashboard"
            replace
          />
        }
      />

      {/* <Route
        path="*"
        element={
          <Navigate
            to="/dashboard"
            replace
          />
        }
      /> */}
    </Routes>
  );
}