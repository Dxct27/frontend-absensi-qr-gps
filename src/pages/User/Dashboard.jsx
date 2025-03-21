import { useEffect, useState, useContext, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import LayoutAdmin from "../../components/Layout/Admin";
import LayoutUser from "../../components/Layout/User";
import QrReader from "../../components/QrReader";
import LeafletUser from "../../components/Leaflet/User";
import RectangleButton from "../../components/RectangleButton";
import { AuthContext } from "../../context/AuthContext";
import { fetchAPI } from "../../utils/api";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import SetPasswordModal from "../../components/Modal/SetPasswordModal";
import LeavePermissionModal from "../../components/Modal/LeavePermissionModal";
import ConfirmModal from "../../components/Modal/ConfirmModal"; // Import your modal

const DashboardUser = () => {
  const { user } = useContext(AuthContext);
  const [currentDate, setCurrentDate] = useState("");
  const [scannedQr, setScannedQr] = useState(null);
  const [location, setLocation] = useState(null);
  const [loading, setLoading] = useState(false);
  const hasSubmitted = useRef(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [isLeaveModalOpen, setIsLeaveModalOpen] = useState(false);
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    onConfirm: null,
    message: "",
  });
  const navigate = useNavigate();
  const Layout = user?.group === "admin" ? LayoutAdmin : LayoutUser;
  const attendanceLink =
    user?.group === "admin" ? "/admin/attendanceHistory" : "/attendanceHistory";

  useEffect(() => {
    const shouldShowModal = localStorage.getItem("showSetPasswordModal");
    if (shouldShowModal === "true") {
      setIsPasswordModalOpen(true);
    }

    const pendingScan = localStorage.getItem("pending_scan");
    if (pendingScan) {
      setConfirmModal({
        isOpen: true,
        message: "Terdapat absen tertunda. Apakah Anda ingin mengirimnya sekarang?",
        onConfirm: () => {
          setScannedQr(pendingScan);
          localStorage.removeItem("pending_scan");
          setConfirmModal({ isOpen: false });
        },
      });
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
      try {
        const scannedUrl = new URL(qrValue);
        const code = scannedUrl.searchParams.get("code") || qrValue;
        setScannedQr(code);
        console.log("Scanned QR:", code);
        if (!location) {
          localStorage.setItem(
            "pending_scan",
            JSON.stringify({ qrCode: code })
          );
        }
      } catch (error) {
        setScannedQr(qrValue);
      }
    }
  };

  const handleLocationUpdate = (coords) => {
    if (!location) {
      setLocation(coords);
      console.log("User Location:", coords);

      const pendingScan = localStorage.getItem("pending_scan");
      if (pendingScan) {
        setConfirmModal({
          isOpen: true,
          message: "Lokasi sudah tersedia. Apakah Anda ingin mengirim absen sekarang?",
          onConfirm: () => {
            setScannedQr(pendingScan);
            localStorage.removeItem("pending_scan");
            setConfirmModal({ isOpen: false });
          },
        });
      }
    }
  };

  const handleLocationError = (error) => {
    console.error("Location Error:", error);

    if (error.code === 1) {
      toast.error("Izin lokasi ditolak! Harap aktifkan GPS.");
    } else if (error.code === 2) {
      toast.error("Lokasi tidak tersedia. Periksa koneksi GPS Anda.");
    } else if (error.code === 3) {
      toast.error("Pengambilan lokasi terlalu lama. Coba lagi.");
    } else {
      toast.error("Terjadi kesalahan dalam mengambil lokasi.");
    }
  };

  const submitAttendance = async (qrCode, coords) => {
    if (!qrCode) {
      toast.error("QR code belum terdeteksi!");
      hasSubmitted.current = false;
      return;
    }

    if (!coords) {
      toast.error("Lokasi tidak ditemukan! Pastikan GPS aktif.");
      hasSubmitted.current = false;
      return;
    }

    setLoading(true);

    try {
      const now = new Date();
      const formattedDate = now
        .toLocaleDateString("id-ID", {
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
        })
        .split("/")
        .reverse()
        .join("-");

      const formattedTime = now.toLocaleTimeString("en-GB", { hour12: false });

      const response = await fetchAPI("/attendance", "POST", {
        user_id: user.id,
        opd_id: user.opd_id,
        qrcode_value: qrCode,
        date: formattedDate,
        timestamp: formattedTime,
        latitude: coords?.lat,
        longitude: coords?.lng,
      });

      toast.success(response?.message || "Absen berhasil!");

      const redirectPath =
        user.group === "admin" ? "/admin/attendancehistory" : "/attendancehistory";
      navigate(redirectPath);
    } catch (error) {
      console.error("Full error response:", error);

      if (error.data?.error) {
        toast.error(error.data.error);
      } else {
        toast.error("Absen gagal! Terjadi kesalahan.");
      }

      hasSubmitted.current = false;
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      {confirmModal.isOpen && (
        <ConfirmModal
          isOpen={confirmModal.isOpen}
          title="Konfirmasi Absen"
          message={confirmModal.message}
          onConfirm={confirmModal.onConfirm}
          onClose={() => setConfirmModal({ isOpen: false })}
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
          <QrReader onScan={handleQrScan} loading={loading} />
          <RectangleButton onClick={() => setIsLeaveModalOpen(true)}>
            Ajukan Ijin
          </RectangleButton>
          <RectangleButton onClick={() => navigate(attendanceLink)}>
            Riwayat Absen
          </RectangleButton>
        </div>

        <div className="col-span-2 px-5">
          <LeafletUser
            onLocationUpdate={handleLocationUpdate}
            onLocationError={handleLocationError}
          />
        </div>
      </div>

      {loading && (
        <p className="text-center text-blue-500">Mengirim data absen...</p>
      )}
    </Layout>
  );
};

export default DashboardUser;
