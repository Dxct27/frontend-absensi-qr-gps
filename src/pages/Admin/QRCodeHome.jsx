import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import LayoutAdmin from "../../components/Layout/Admin";
import RectangleButton from "../../components/RectangleButton";
import QRCodeComponent from "../../components/QRCodeComponent";
import QRFormModal from "../../components/Modal/QRFormModal";
import ConfirmModal from "../../components/Modal/ConfirmModal";
import { fetchQRCodes, fetchAPI } from "../../utils/api";
import { toast } from "react-toastify";
import QRCodeCard from "../../components/Card/QRCodeCard";
import { formattedTimeDate } from "../../utils/date";
import { IoAdd, IoList } from "react-icons/io5";

const QRCodePage = () => {
  const [qrCodes, setQrCodes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedQrId, setSelectedQrId] = useState(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [qrToDelete, setQrToDelete] = useState(null);
  const [clonedData, setClonedData] = useState(null);

  const itemsPerPage = 3;
  const navigate = useNavigate();

  useEffect(() => {
    loadQRCodes();
  }, []);

  const loadQRCodes = async () => {
    setLoading(true);
    try {
      const response = await fetchQRCodes("/qrcodes", {
        type: "daily",
        onlyValid: true,
      });
      setQrCodes(response);
      setCurrentPage(1);
    } catch (err) {
      "Error fetching QR codes:", err;
      setError("Failed to fetch QR codes");
    } finally {
      setLoading(false);
    }
  };

  const openCreateModal = () => {
    setSelectedQrId(null);
    setIsModalOpen(true);
  };

  const openEditModal = (qrId) => {
    setSelectedQrId(qrId);
    setIsModalOpen(true);
  };

  const openCloneModal = (qrData) => {
    setClonedData(qrData);
    setSelectedQrId(null);
    setIsModalOpen(true);
  };

  const closeModal = async () => {
    setIsModalOpen(false);
    setSelectedQrId(null);
    await loadQRCodes();
    setRefreshTrigger((prev) => prev + 1);
  };

  const openConfirmDelete = (id) => {
    setQrToDelete(id);
    setIsConfirmOpen(true);
  };

  const handleDelete = async () => {
    if (!qrToDelete) return;
    try {
      await fetchAPI(`/qrcodes/${qrToDelete}`, "DELETE");
      setQrCodes(qrCodes.filter((qr) => qr.id !== qrToDelete));
    } catch (err) {
      "Error deleting QR code:", err;
      toast.error("Failed to delete QR code");
    }
    loadQRCodes();
    setIsConfirmOpen(false);
    setQrToDelete(null);
  };

  const copyToClipboard = (text) => {
    navigator.clipboard
      .writeText(text)
      .then(() => {
        toast.success("Copied to clipboard!");
      })
      .catch(() => {
        toast.error("Failed to copy.");
      });
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
        clonedData={clonedData}
        type={"qrForm"}
      />

      <ConfirmModal
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        title="Konfirmasi Hapus"
        message="Apakah Anda yakin ingin menghapus QR Code ini?"
        confirmText="Hapus"
        confirmButtonStyles="bg-red-500 hover:bg-red-600"
        cancelText="Cancel"
        onConfirm={handleDelete}
      />

      <div className="flex justify-between items-center mb-5">
        <h2 className="text-2xl font-bold">QR Codes</h2>
        <div className="flex gap-2">
          <RectangleButton
            className={"p-2"}
            onClick={() => navigate("/qrcode/list")}
          >
            <IoList className="mr-2" />
            List QR
          </RectangleButton>
          <RectangleButton className={"p-2 bg-blue-500 text-white"} onClick={openCreateModal}>
            <IoAdd className="mr-2" />
            Buat kode QR baru
          </RectangleButton>
        </div>
      </div>

      {loading && <p>Loading...</p>}
      {error && <p className="text-red-500">{error}</p>}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {currentItems.length > 0 ? (
          currentItems.map((qr) => (
            <QRCodeCard
              key={qr.id}
              qr={qr}
              refreshTrigger={refreshTrigger}
              formatDateTime={formattedTimeDate}
              copyToClipboard={copyToClipboard}
              openCloneModal={openCloneModal}
            />
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
            className={`px-4 py-2 rounded ${
              currentPage === 1 ? "bg-gray-300" : "bg-blue-500 text-white"
            }`}
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
            className={`px-4 py-2 rounded ${
              currentPage === totalPages
                ? "bg-gray-300"
                : "bg-blue-500 text-white"
            }`}
          >
            Next
          </button>
        </div>
      )}
    </LayoutAdmin>
  );
};

export default QRCodePage;
