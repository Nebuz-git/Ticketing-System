import { Routes, Route } from "react-router-dom";
import Login from "../pages/login";
import Register from "../pages/register";
import ProtectedRoute from "./ProtectedRoute";
import  Home  from "../pages/Home"

export default function AppRoutes() {
  return (
    <Routes>
        {/* <Route path="/" element={<Navigator to="/login" />} /> */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      <Route path="/" element={
        <ProtectedRoute>
          <Home />
        </ProtectedRoute>
        }
        />
    </Routes>
  );
}