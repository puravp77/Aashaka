import { Navigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export default function AdminRoute({ children }) {
  const { adminUser } = useAuth();

  if (!adminUser) {
    return <Navigate to="/admin/login" replace />;
  }

  if (adminUser.role !== "admin") {
    return <Navigate to="/" replace />;
  }

  return children;
}
