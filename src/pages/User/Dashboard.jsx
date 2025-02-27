import { useEffect, useState, useContext } from "react";
import { Link } from "react-router-dom";
import LayoutUser from "../../components/Layout/User";
import QrReader from "../../components/QrReader";
import LeafletUser from "../../components/Leaflet/User";
import RectangleButton from "../../components/RectangleButton";
import { AuthContext } from "../../context/AuthContext"; // Import Auth Context

const DashboardUser = () => {
  const { user } = useContext(AuthContext);
  const [currentDate, setCurrentDate] = useState("");

  useEffect(() => {
    console.log("ProtectedRoute: User Data:", user);
    const today = new Date();
    const formattedDate = today.toLocaleDateString("id-ID", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });
    setCurrentDate(formattedDate);
  }, []);

  return (
    <LayoutUser>
      <div className="flex justify-between items-center p-4 bg-gray-100 rounded-lg shadow-md">
        <h2 className="text-lg font-semibold">Halo, {user?.name || "User"} 👋</h2>
        <h3 className="text-md font-medium text-gray-700">{currentDate}</h3>
      </div>

      <div className="flex flex-col md:grid md:grid-cols-3 gap-4 mt-5">
        {/* Left Section - QR & Buttons */}
        <div className="col-span-1 flex flex-col px-5 gap-4">
          <QrReader />
          <Link to="/leavePermission">
            <RectangleButton>Ajukan Ijin</RectangleButton>
          </Link>
          <Link to="/attendanceHistory">
            <RectangleButton>Riwayat Absen</RectangleButton>
          </Link>
        </div>

        {/* Right Section - Map */}
        <div className="col-span-2 px-5">
          <LeafletUser />
        </div>
      </div>
    </LayoutUser>
  );
};

export default DashboardUser;
