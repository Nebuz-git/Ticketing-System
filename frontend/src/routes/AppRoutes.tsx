import { Routes, Route, Navigate } from "react-router-dom";
import Login from "../pages/login";
import Register from "../pages/register";
import ProtectedRoute from "./ProtectedRoute";
import RoleRoute from "./RoleRoute";
import DashboardLayout from "@/components/layout/DashboardLayout";
import Dashboard from "../pages/Dashboard";
import Tickets from "../pages/Tickets";
import Users from "../pages/Users";
import AuditLogs from "../pages/AuditLogs";
import TicketDetail from "../pages/TicketDetail";

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/tickets" element={<Tickets />} />
        <Route path="/tickets/:id" element={<TicketDetail />} />
        <Route
          path="/users"
          element={
            <RoleRoute roles={["admin"]}>
              <Users />
            </RoleRoute>
          }
        />
        <Route
          path="/audit-logs"
          element={
            <RoleRoute roles={["admin"]}>
              <AuditLogs />
            </RoleRoute>
          }
        />
      </Route>
    </Routes>
  );
}