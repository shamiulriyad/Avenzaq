import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";

function homeByRole(role) {
  if (role === "Admin") return "/admin/dashboard";
  if (role === "Seller") return "/seller/dashboard";
  return "/";
}

export function RequireAuth({ children }) {
  const location = useLocation();
  const { isAuthenticated, isAuthLoading } = useAuth();

  if (isAuthLoading) {
    return null;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return children;
}

export function RequireRole({ allowedRoles, children }) {
  const { user, isAuthenticated, isAuthLoading } = useAuth();

  if (isAuthLoading) {
    return null;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (!user?.role || !allowedRoles.includes(user.role)) {
    return <Navigate to={homeByRole(user?.role)} replace />;
  }

  return children;
}
