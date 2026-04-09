import { Navigate, Outlet } from "react-router-dom";

export function ProtectedRoute({ allowedRoles }) {
  const role = localStorage.getItem("role");


  //if user's role isnt admin go back to login
  if (allowedRoles!==role){
    return <Navigate to="/control_panel" replace />;
  }

  //if not a user, he is a admin, so it redirects to the admin endpoints
  return <Outlet />;
}