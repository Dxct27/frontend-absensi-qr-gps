import { useEffect, useState } from "react";
import SuperAdminLayout from "../../components/Layout/SuperAdmin";
import { fetchAPI } from "../../utils/api";

const SuperAdminDashboard = () => {
  const [summary, setSummary] = useState({
    totalUsers: 0,
    totalAttendance: 0,
    totalQRCodes: 0,
  });

  useEffect(() => {
    fetchAPI("/superadmin/summary")
      .then((data) => {
        setSummary({
          totalUsers: data.total_users || 0,
          totalAttendance: data.total_attendance || 0,
          totalQRCodes: data.total_qrcodes || 0,
        });
      })
      .catch((error) => ("Error fetching summary:", error));
  }, []);

  return (
    <SuperAdminLayout>
      <h1 className="text-2xl font-bold mb-4">Superadmin Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <DashboardCard title="Total Users" value={summary.totalUsers} />
        <DashboardCard title="Total Attendance" value={summary.totalAttendance} />
        <DashboardCard title="Total QR Codes" value={summary.totalQRCodes} />
      </div>
    </SuperAdminLayout>
  );
};

const DashboardCard = ({ title, value }) => (
  <div className="p-6 bg-white rounded-md shadow-md">
    <h2 className="text-lg font-semibold">{title}</h2>
    <p className="text-3xl font-bold">{value}</p>
  </div>
);

export default SuperAdminDashboard;
