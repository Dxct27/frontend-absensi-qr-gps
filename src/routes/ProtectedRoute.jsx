import { Navigate, Outlet } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";

const ProtectedRoute = ({ allowedRoles }) => {
  const { user, loading } = useContext(AuthContext);

  if (loading) return <div>Loading...</div>;
  if (!user) return <Navigate to="/" replace />;

  if (allowedRoles && !allowedRoles.includes(user.group)) {
    const redirectPath = user
      ? user.group === "admin"
        ? "/adminPanel"
        : user.group === "superadmin"
        ? "/superadmin"
        : "/dashboard"
      : "/";
    return <Navigate to={redirectPath} replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
