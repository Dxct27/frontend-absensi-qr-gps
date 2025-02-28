import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import LayoutAdmin from "../../components/Layout/Admin";
import RectangleButton from "../../components/RectangleButton";
import QRCodeComponent from "../../components/QRCodeComponent";
import axios from "axios";

const API_URL = import.meta.env.VITE_BASE_URL_API;

const QRCodePage = () => {
  const [qrCodes, setQrCodes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 3;

  useEffect(() => {
    const fetchQRCodes = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(`${API_URL}/qrcodes`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const now = new Date();
        const updatedQRCodes = response.data
          .sort((a, b) => new Date(b.created_at) - new Date(a.created_at)) // Sort by newest first
          .map((qr) => ({
            ...qr,
            isExpired: new Date(qr.waktu_akhir) <= now, // Flag expired QR codes
          }));

        setQrCodes(updatedQRCodes);
      } catch (err) {
        setError("Failed to fetch QR codes");
      }
      setLoading(false);
    };

    fetchQRCodes(); // Initial fetch

    const interval = setInterval(() => {
      fetchQRCodes(); // Refresh QR codes every 30 seconds
    }, 30000);

    return () => clearInterval(interval); // Cleanup interval on unmount
  }, []);

  const formatDateTime = (dateString) => {
    if (!dateString) return "Invalid Date";
    const date = new Date(dateString);

    const time = date.toLocaleTimeString("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
    });

    const formattedDate = date.toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });

    return `${time} ${formattedDate}`; // Time first, then date
  };

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = qrCodes.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(qrCodes.length / itemsPerPage);

  return (
    <LayoutAdmin>
      <div className="flex justify-between items-center mb-5">
        <h2 className="text-2xl font-bold">QR Codes</h2>
        <Link to="/qrcodecreate">
          <RectangleButton>Buat kode QR baru</RectangleButton>
        </Link>
      </div>

      {loading && <p>Loading...</p>}
      {error && <p className="text-red-500">{error}</p>}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {currentItems.length > 0 ? (
          currentItems.map((qr) => (
            <div key={qr.id} className="border p-4 bg-white rounded-lg shadow">
              <h3 className="text-lg font-bold">{qr.name}</h3>
              {!qr.isExpired && <QRCodeComponent qrCodeId={qr.id} />}
              <p className="text-sm text-gray-600">
                Lokasi: {qr.latitude}, {qr.longitude}{" "}
              </p>
              <p className="text-sm text-gray-600">
                Radius: {qr.radius} meters
              </p>
              <p className="text-sm text-gray-600">
                Valid: {formatDateTime(qr.waktu_awal)} -{" "}
                {formatDateTime(qr.waktu_akhir)}
              </p>
              {qr.isExpired && <p className="text-red-500">Expired</p>}
            </div>
          ))
        ) : (
          <p>No QR Codes found.</p>
        )}
      </div>

      {/* Pagination Controls */}
      {qrCodes.length > itemsPerPage && (
        <div className="flex justify-center mt-5 space-x-2">
          <button
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className={`px-4 py-2 rounded ${currentPage === 1 ? "bg-gray-300" : "bg-blue-500 text-white"}`}
          >
            Prev
          </button>
          <span className="px-4 py-2">
            {currentPage} / {totalPages}
          </span>
          <button
            onClick={() =>
              setCurrentPage((prev) => Math.min(prev + 1, totalPages))
            }
            disabled={currentPage === totalPages}
            className={`px-4 py-2 rounded ${currentPage === totalPages ? "bg-gray-300" : "bg-blue-500 text-white"}`}
          >
            Next
          </button>
        </div>
      )}
    </LayoutAdmin>
  );
};

export default QRCodePage;
