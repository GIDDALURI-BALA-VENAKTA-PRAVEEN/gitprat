import { Navigate, Outlet } from "react-router-dom";

const AdminProtectedRoute = () => {
  // Check for admin authentication
  const isAdminAuthenticated = localStorage.getItem("adminToken") || localStorage.getItem("admin");
  
  return isAdminAuthenticated ? <Outlet /> : <Navigate to="/admin/login" replace />;
};

export default AdminProtectedRoute; 