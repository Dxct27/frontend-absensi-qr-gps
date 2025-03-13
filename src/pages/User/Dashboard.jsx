import { useEffect, useState, useContext, useRef } from "react";
import { Link } from "react-router-dom";
import LayoutUser from "../../components/Layout/User";
import QrReader from "../../components/QrReader";
import LeafletUser from "../../components/Leaflet/User";
import RectangleButton from "../../components/RectangleButton";
import { AuthContext } from "../../context/AuthContext";
import { fetchAPI } from "../../utils/api";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import SetPasswordModal from "../../components/Modal/SetPasswordModal";

const DashboardUser = () => {
  const { user } = useContext(AuthContext);
  const [currentDate, setCurrentDate] = useState("");
  const [scannedQr, setScannedQr] = useState(null);
  const [location, setLocation] = useState(null);
  const [loading, setLoading] = useState(false);
  const hasSubmitted = useRef(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const shouldShowModal = localStorage.getItem("showSetPasswordModal");
    if (shouldShowModal === "true") {
      setIsModalOpen(true);
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

  const handleCloseModal = () => {
    setIsModalOpen(false);
    localStorage.removeItem("showSetPasswordModal");
  };

  // DELETE LATER: for debugging modal only also delete Modal button
  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const handleSuccessModal = () => {
    toast.success("Password berhasil disimpan");
    setIsModalOpen(false);
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

      console.log("Attendance Submitted:", response);
      toast.success("Absen berhasil!");
    } catch (error) {
      console.error("Attendance Error:", error);

      if (error.response?.status === 400) {
        const message = error.response.data?.message;
        if (message && message.includes("Anda sudah absen sebelumnya")) {
          toast.warning("Anda sudah absen sebelumnya!");
        } else {
          toast.error("Absen gagal! " + message);
        }
      } else {
        toast.error("Absen gagal! " + (error.message || "Terjadi kesalahan."));
      }

      hasSubmitted.current = false;
    } finally {
      setLoading(false);
    }
  };

  return (
    <LayoutUser>
      {isModalOpen && (
        <SetPasswordModal isOpen={isModalOpen} onClose={handleCloseModal} onSuccess={handleSuccessModal} />
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
          <Link to="/leavePermission">
            <RectangleButton>Ajukan Ijin</RectangleButton>
          </Link>
          <Link to="/attendanceHistory">
            <RectangleButton>Riwayat Absen</RectangleButton>
          </Link>
          {/* Modal Button */}
          <RectangleButton onClick={handleOpenModal}>Modal</RectangleButton>
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
