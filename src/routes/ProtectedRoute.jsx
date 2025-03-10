import { Navigate, Outlet } from "react-router-dom";
import { useContext, useEffect } from "react";
import { AuthContext } from "../context/AuthContext";

const ProtectedRoute = ({ allowedRoles }) => {
  const { user } = useContext(AuthContext);

  useEffect(() => {
    // console.log("ProtectedRoute Check - User:", user);
    // console.log("Allowed Roles:", allowedRoles);
  }, [user, allowedRoles]);

  if (!user) {
    // console.log("No user found, redirecting to login...");
    return <Navigate to="/" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.group)) {
    // console.log(`Unauthorized: Redirecting user (${user.group})...`);
    return <Navigate to={user.group === "admin" ? "/adminPanel" : "/dashboard"} replace />;
  }

  // console.log("Access granted to:", user.group);
  return <Outlet />;
};

export default ProtectedRoute;
