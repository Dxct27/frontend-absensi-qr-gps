import { Routes, Route } from "react-router-dom";
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

function App() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/clipboard" element={<Clipboard />} />
      <Route path="/auth/google/callback" element={<AuthCallback />} />
      <Route path="/auth/yahoo/callback" element={<AuthCallback />} />

      <Route element={<ProtectedRoute allowedRoles={["admin"]} />}>
        <Route path="/adminPanel" element={<DashboardAdmin />} />
        <Route path="/qrcode" element={<QRCodePage />} />
        <Route path="/qrcode/list" element={<QRCodeList />} />
      </Route>

      <Route element={<ProtectedRoute allowedRoles={["user"]} />}>
        <Route path="/dashboard" element={<DashboardUser />} />
        <Route path="/attendanceHistory" element={<AttendanceHistory />} />
      </Route>
    </Routes>
  );
}

export default App;
