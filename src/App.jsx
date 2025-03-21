import { Routes, Route, Navigate } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "./context/AuthContext";
import "./index.css";

import Login from "./pages/Login";
import DashboardAdmin from "./pages/Admin/Dashboard";
import QRCodePage from "./pages/Admin/QRCodeHome";
import QRCodeList from "./pages/Admin/QRCodeList";
import DashboardUser from "./pages/User/Dashboard";
import AttendanceHistory from "./pages/User/AttendanceHistory";
import Clipboard from "./pages/Clipboard";
import ProtectedRoute from "./routes/ProtectedRoute";
import AuthCallback from "./pages/AuthCallback";
import SuperAdminDashboard from "./pages/Superadmin/Dashboard";
import SuperAdminUsers from "./pages/Superadmin/Users";
import ScanHandler from "./pages/ScanHandler";
import { ToastContainer } from "react-toastify";

const NotFoundRedirect = () => {
  const { user } = useContext(AuthContext);

  const redirectPath = user
    ? user.group === "admin"
      ? "/adminPanel"
      : user.group === "superadmin"
        ? "/superadmin"
        : "/dashboard"
    : "/";

  return <Navigate to={redirectPath} replace />;
};

function App() {
  return (
    <>
      <ToastContainer />
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/clipboard" element={<Clipboard />} />
        <Route path="/auth/google/callback" element={<AuthCallback />} />
        <Route path="/auth/yahoo/callback" element={<AuthCallback />} />

        <Route path="/scan" element={<ScanHandler />} />

        <Route element={<ProtectedRoute allowedRoles={["superadmin"]} />}>
          <Route path="/superadmin" element={<SuperAdminDashboard />} />
          <Route path="/superadmin/users" element={<SuperAdminUsers />} />
        </Route>

        <Route element={<ProtectedRoute allowedRoles={["admin"]} />}>
          <Route path="/adminPanel" element={<DashboardAdmin />} />
          <Route
            path="/admin/attendanceHistory"
            element={<AttendanceHistory />}
          />
          <Route path="/qrcode/scan" element={<DashboardUser />} />
          <Route path="/qrcode" element={<QRCodePage />} />
          <Route path="/qrcode/list" element={<QRCodeList />} />
        </Route>

        <Route element={<ProtectedRoute allowedRoles={["user"]} />}>
          <Route path="/dashboard" element={<DashboardUser />} />
          <Route path="/attendanceHistory" element={<AttendanceHistory />} />
        </Route>

        {/* Catch-all route for invalid URLs */}
        <Route path="*" element={<NotFoundRedirect />} />
      </Routes>
    </>
  );
}

export default App;
