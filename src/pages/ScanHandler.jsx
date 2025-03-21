import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { toast } from "react-toastify";

const ScanHandler = () => {
  const { user, loading } = useAuth();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const code = searchParams.get("code");

  useEffect(() => {
    if (!code) {
      toast.error("Invalid QR Code!");
      navigate("/");
      return;
    }

    if (loading) return;

    if (!user) {
      toast.error("Mohon login terlebih dahulu.");
      localStorage.setItem("pending_scan", code);
      navigate("/");
    } else {
      localStorage.setItem("pending_scan", code);
      toast.info("Kode QR terdeteksi, memproses absen pada dashboard.");
      navigate("/dashboard");
    }
  }, [user, loading, code, navigate]);

  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <p className="text-gray-600">Redirecting to dashboard...</p>
    </div>
  );
};

export default ScanHandler;
