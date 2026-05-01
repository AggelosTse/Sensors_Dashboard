import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../authContext";

export function ProtectedRoute({ roleAllowed }) {
  const { token, role, loading } = useAuth();


  if (loading) return <div>Loading...</div>;


  if (!token) {
    return <Navigate to="/login" replace />;
  }


  if (roleAllowed && role !== roleAllowed) {

    return <Navigate to="/control_panel" replace />;
  }


  return <Outlet />;
}