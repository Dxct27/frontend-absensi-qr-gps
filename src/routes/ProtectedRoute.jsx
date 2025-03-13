import { Navigate, Outlet } from "react-router-dom";
import { useContext, useEffect } from "react";
import { AuthContext } from "../context/AuthContext";

const ProtectedRoute = ({ allowedRoles }) => {
  const { user } = useContext(AuthContext);

  useEffect(() => {
  }, [user, allowedRoles]);

  if (!user) {
    return <Navigate to="/" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.group)) {
    return <Navigate to={user.group === "admin" ? "/adminPanel" : "/dashboard"} replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
