import { Routes, Route } from "react-router-dom";
import "./index.css";
import { useContext } from "react";
import { AuthContext } from "./context/AuthContext";

import Login from "./pages/Login";
import DashboardAdmin from "./pages/Admin/Dashboard";
import QRCodePage from "./pages/Admin/QRCodeHome";
import DashboardUser from "./pages/User/Dashboard";
import LeavePermission from "./pages/User/LeavePermission";
import AttendanceHistory from "./pages/User/AttendanceHistory";
import QRCodeCreate from "./pages/Admin/QRCodeCreate";
import Clipboard from "./pages/Clipboard";
import ProtectedRoute from "./routes/ProtectedRoute";
import AuthCallback from "./pages/AuthCallback"; // Import Google OAuth Callback Page

function App() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<Login />} />
      <Route path="/clipboard" element={<Clipboard />} />
      <Route path="/auth/google/callback" element={<AuthCallback />} /> {/* Google OAuth Callback */}

      {/* Admin Routes (Protected) */}
      <Route element={<ProtectedRoute allowedRoles={["admin"]} />}>
        <Route path="/adminPanel" element={<DashboardAdmin />} />
        <Route path="/qrcode" element={<QRCodePage />} />
        <Route path="/qrcode/create" element={<QRCodeCreate />} />
        <Route path="/qrcode/edit/:id" element={<QRCodeCreate />} />
      </Route>

      {/* User Routes (Protected) */}
      <Route element={<ProtectedRoute allowedRoles={["user"]} />}>
        <Route path="/dashboard" element={<DashboardUser />} />
        <Route path="/leavePermission" element={<LeavePermission />} />
        <Route path="/attendanceHistory" element={<AttendanceHistory />} />
      </Route>
    </Routes>
  );
}

export default App;
