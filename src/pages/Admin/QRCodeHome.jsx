import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import LayoutAdmin from "../../components/Layout/Admin";
import RectangleButton from "../../components/RectangleButton";
import QRCodeComponent from "../../components/QRCodeComponent";
import QRFormModal from "../../components/Modal/QRFormModal";
import { fetchQRCodes, fetchAPI } from "../../utils/api";

const QRCodePage = () => {
  const [qrCodes, setQrCodes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedQrId, setSelectedQrId] = useState(null);
  const itemsPerPage = 3;
  const navigate = useNavigate();

  useEffect(() => {
    loadQRCodes();
  }, []);

  const loadQRCodes = async () => {
    setLoading(true);
    try {
      const response = await fetchQRCodes("/qrcodes", { onlyValid: true });
      setQrCodes(response);
      setCurrentPage(1);
    } catch (err) {
      console.error("Error fetching QR codes:", err);
      setError("Failed to fetch QR codes");
    } finally {
      setLoading(false);
    }
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return "Invalid Date";
    const date = new Date(dateString);
    return `${date.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })} 
            ${date.toLocaleDateString("id-ID", { day: "2-digit", month: "2-digit", year: "numeric" })}`;
  };

  const openCreateModal = () => {
    setSelectedQrId(null);
    setIsModalOpen(true);
  };

  const openEditModal = (qrId) => {
    setSelectedQrId(qrId);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedQrId(null);
    loadQRCodes();
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this QR code?"))
      return;
    try {
      await fetchAPI(`/qrcodes/${id}`, "DELETE");
      setQrCodes(qrCodes.filter((qr) => qr.id !== id));
    } catch (err) {
      console.error("Error deleting QR code:", err);
      alert("Failed to delete QR code");
    }
    loadQRCodes();
  };

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = qrCodes.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(qrCodes.length / itemsPerPage);

  return (
    <LayoutAdmin>
      <QRFormModal
        isOpen={isModalOpen}
        onClose={closeModal}
        qrId={selectedQrId}
      />

      <div className="flex justify-between items-center mb-5">
        <h2 className="text-2xl font-bold">QR Codes</h2>
        <div className="flex gap-2">
          <RectangleButton
            className={"p-5"}
            onClick={() => navigate("/qrcode/list")}
          >
            List QR
          </RectangleButton>
          <RectangleButton className={"p-5"} onClick={openCreateModal}>
            Buat kode QR baru
          </RectangleButton>
        </div>
      </div>

      {loading && <p>Loading...</p>}
      {error && <p className="text-red-500">{error}</p>}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {currentItems.length > 0 ? (
          currentItems.map((qr) => (
            <div key={qr.id} className="border p-4 bg-white rounded-lg shadow">
              <h3 className="text-lg font-bold">{qr.name}</h3>
              <QRCodeComponent qrCodeId={qr.id} />
              <p className="text-sm text-gray-600">
                Lokasi: {qr.latitude}, {qr.longitude}
              </p>
              <p className="text-sm text-gray-600">
                Radius: {qr.radius} meters
              </p>
              <p className="text-sm text-gray-600">
                Valid: {formatDateTime(qr.waktu_awal)} -{" "}
                {formatDateTime(qr.waktu_akhir)}
              </p>

              <div className="flex gap-2 mt-3">
                <RectangleButton
                  onClick={() => openEditModal(qr.id)}
                  className="px-3 py-1 bg-blue-500 text-white rounded"
                >
                  Edit
                </RectangleButton>
                <button
                  onClick={() => handleDelete(qr.id)}
                  className="px-3 py-1 bg-red-500 text-white rounded"
                >
                  Delete
                </button>
              </div>
            </div>
          ))
        ) : (
          <p>No valid QR Codes found.</p>
        )}
      </div>

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
