import { useEffect, useState, useContext, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import LayoutUser from "../../components/Layout/User";
import QrReader from "../../components/QrReader";
import LeafletUser from "../../components/Leaflet/User";
import RectangleButton from "../../components/RectangleButton";
import { AuthContext } from "../../context/AuthContext";
import { fetchAPI } from "../../utils/api";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import SetPasswordModal from "../../components/Modal/SetPasswordModal";
import LeavePermissionModal from "../../components/Modal/LeavePermissionModal";

const DashboardUser = () => {
  const { user } = useContext(AuthContext);
  const [currentDate, setCurrentDate] = useState("");
  const [scannedQr, setScannedQr] = useState(null);
  const [location, setLocation] = useState(null);
  const [loading, setLoading] = useState(false);
  const hasSubmitted = useRef(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [isLeaveModalOpen, setIsLeaveModalOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const shouldShowModal = localStorage.getItem("showSetPasswordModal");
    if (shouldShowModal === "true") {
      setIsPasswordModalOpen(true);
    }
    const today = new Date();
    const formattedDate = today.toLocaleDateString("id-ID", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });
    setCurrentDate(formattedDate);
  }, []);

  useEffect(() => {
    if (scannedQr && location && !hasSubmitted.current) {
      hasSubmitted.current = true;
      submitAttendance(scannedQr, location);
    }
  }, [scannedQr, location]);

  const handleClosePasswordModal = () => {
    setIsPasswordModalOpen(false);
    localStorage.removeItem("showSetPasswordModal");
  };

  const handleSuccessPasswordModal = () => {
    toast.success("Password berhasil disimpan");
    setIsPasswordModalOpen(false);
  };

  const handleQrScan = (qrValue) => {
    if (!hasSubmitted.current) {
      setScannedQr(qrValue);
      console.log("Scanned QR:", qrValue);
    }
  };

  const handleLocationUpdate = (coords) => {
    if (!location) {
      setLocation(coords);
      console.log("User Location:", coords);
    }
  };

  const submitAttendance = async (qrCode, coords) => {
    if (!qrCode || !coords) {
      toast.error("QR code atau lokasi belum terdeteksi!");
      hasSubmitted.current = false;
      return;
    }

    setLoading(true);

    try {
      const now = new Date();
      const formattedTime = now.toLocaleTimeString("en-GB");

      const response = await fetchAPI("/attendance", "POST", {
        user_id: user.id,
        opd_id: user.opd_id,
        qrcode_value: qrCode,
        date: now.toISOString().split("T")[0],
        timestamp: formattedTime,
        latitude: coords?.lat,
        longitude: coords?.lng,
      });

      toast.success("Absen berhasil!");
    } catch (error) {
      console.error("Attendance Error:", error);

      if (error.response) {
        const errorData = error.response.data;

        if (errorData.message) {
          toast.error(errorData.message);
        } else if (errorData.error) {
          toast.error(errorData.error);
        } else if (errorData.errors) {
          Object.values(errorData.errors).forEach((msg) => {
            toast.error(msg[0]); // Show the first validation error message
          });
        } else {
          toast.error("Terjadi kesalahan saat absen.");
        }
      } else {
        toast.error("Gagal menghubungi server.");
      }

      hasSubmitted.current = false;
    } finally {
      setLoading(false);
    }
  };

  return (
    <LayoutUser>
      {isPasswordModalOpen && (
        <SetPasswordModal
          isOpen={isPasswordModalOpen}
          onClose={handleClosePasswordModal}
          onSuccess={handleSuccessPasswordModal}
        />
      )}

      {isLeaveModalOpen && (
        <LeavePermissionModal
          isOpen={isLeaveModalOpen}
          onClose={() => setIsLeaveModalOpen(false)}
        />
      )}

      <div className="flex justify-between items-center p-4 bg-gray-100 rounded-lg shadow-md">
        <h2 className="text-lg font-semibold">
          Halo, {user?.name || "User"} 👋
        </h2>
        <h3 className="text-md font-medium text-gray-700">{currentDate}</h3>
      </div>

      <div className="flex flex-col md:grid md:grid-cols-3 gap-4 mt-5">
        <div className="col-span-1 flex flex-col px-5 gap-4">
          <QrReader onScan={handleQrScan} />
          <RectangleButton onClick={() => setIsLeaveModalOpen(true)}>
            Ajukan Ijin
          </RectangleButton>
          <RectangleButton onClick={() => navigate("/attendanceHistory")}>
            Riwayat Absen
          </RectangleButton>
        </div>

        <div className="col-span-2 px-5">
          <LeafletUser onLocationUpdate={handleLocationUpdate} />
        </div>
      </div>

      {loading && (
        <p className="text-center text-blue-500">Mengirim data absen...</p>
      )}

      <ToastContainer />
    </LayoutUser>
  );
};

export default DashboardUser;
