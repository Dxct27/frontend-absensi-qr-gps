import { useState } from "react";
import { Routes, Route } from "react-router-dom";
import "./index.css";
import Login from "./pages/Login";
import DashboardAdmin from "./pages/Admin/Dashboard";
import QRCodePage from "./pages/Admin/QRCodeHome";
import Attendance from "./pages/Admin/Attendance";
import DashboardUser from "./pages/User/Dashboard";
import Clipboard from "./pages/Clipboard";
import LeavePermission from "./pages/User/LeavePermission";
import AttendanceHistory from "./pages/User/AttendanceHistory";
import QRCodeCreate from "./pages/Admin/QRCodeCreate";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/admin" element={<DashboardAdmin />} />
      <Route path="/qrcode" element={<QRCodePage/>}/>
      <Route path="/attendance" element={<Attendance/>}/>
      <Route path="/user" element={<DashboardUser />} />
      <Route path="/leavePermission" element={<LeavePermission />} />
      <Route path="/attendanceHistory" element={<AttendanceHistory />} />
      <Route path="/qrcodecreate" element={<QRCodeCreate />} />
      <Route path="/clipboard" element={<Clipboard />} />
    </Routes>
  );
}

export default App;
