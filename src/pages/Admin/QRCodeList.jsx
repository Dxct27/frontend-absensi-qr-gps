import { useState } from "react";
import LayoutAdmin from "../../components/Layout/Admin";
import QRCodeListTable from "../../components/Table/AdminQRCodeList";
import { downloadMultipleQRsAsPDF } from "../../utils/qrcodeDownload";
import { ClipLoader } from "react-spinners";
import ConfirmModal from "../../components/Modal/ConfirmModal";
import { fetchAPI } from "../../utils/api";

const QRCodeList = () => {
  const [showCheckbox, setShowCheckbox] = useState(false);
  const [selectedQRs, setSelectedQRs] = useState([]);
  const [loadingDownload, setLoadingDownload] = useState(false);
  const [visibleQRs, setVisibleQRs] = useState([]);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [qrToDelete, setQrToDelete] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const isAllVisibleSelected =
    visibleQRs.length > 0 &&
    visibleQRs.every((qr) => selectedQRs.find((s) => s.id === qr.id));

  const toggleSelectAllVisible = () => {
    if (isAllVisibleSelected) {
      const remaining = selectedQRs.filter(
        (sel) => !visibleQRs.some((v) => v.id === sel.id)
      );
      setSelectedQRs(remaining);
    } else {
      const merged = [
        ...selectedQRs,
        ...visibleQRs.filter(
          (v) => !selectedQRs.some((sel) => sel.id === v.id)
        ),
      ];
      setSelectedQRs(merged);
    }
  };

  const handleDownload = async () => {
    if (selectedQRs.length > 0) {
      setLoadingDownload(true);
      await downloadMultipleQRsAsPDF(selectedQRs, "OPD Name");
      setLoadingDownload(false);
    }
  };

  const handleDeleteSelected = async () => {
    if (selectedQRs.length === 0) return;
    try {
      for (const qr of selectedQRs) {
        await fetchAPI(`/qrcodes/${qr.id}`, "DELETE");
      }
      setSelectedQRs([]);
      setRefreshKey((prev) => prev + 1); // trigger reload
    } catch (error) {
      console.error("Failed to delete selected QRs:", error);
    }
  };

  return (
    <LayoutAdmin>
      <ConfirmModal
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        title="Konfirmasi Hapus"
        message={`Yakin ingin menghapus ${selectedQRs.length} QR Code?`}
        confirmText="Hapus"
        confirmButtonStyles="bg-red-500 hover:bg-red-600"
        cancelText="Batal"
        onConfirm={async () => {
          await handleDeleteSelected();
          setIsConfirmOpen(false);
        }}
      />

      <h2 className="text-2xl font-bold mb-5">Semua Kode QR</h2>
      <div className="flex items-center gap-4 mb-4">
        <button
          className="px-4 py-2 bg-blue-500 text-white rounded"
          onClick={() => {
            setShowCheckbox(!showCheckbox);
            setSelectedQRs([]);
          }}
        >
          {showCheckbox ? "Batalkan Pilihan" : "Pilih Beberapa"}
        </button>

        {showCheckbox && (
          <details className="relative group">
            <summary className="flex justify-between items-center px-4 py-2 bg-gray-200 rounded cursor-pointer list-none">
              Actions
              <span className="ml-2 transform group-open:rotate-180 transition-transform">
                ▼
              </span>
            </summary>
            <div className="absolute z-10 mt-1 bg-white border shadow-lg rounded w-48">
              <button
                onClick={toggleSelectAllVisible}
                className="block w-full text-left px-4 py-2 hover:bg-gray-100"
              >
                {isAllVisibleSelected
                  ? "Batal Pilih Halaman Ini"
                  : "Pilih Semua Halaman Ini"}
              </button>

              <button
                onClick={handleDownload}
                disabled={selectedQRs.length === 0 || loadingDownload}
                className={`block w-full text-left px-4 py-2 hover:bg-gray-100 ${
                  selectedQRs.length === 0
                    ? "text-gray-400 cursor-not-allowed"
                    : ""
                }`}
              >
                {loadingDownload ? (
                  <div className="flex items-center gap-2">
                    <ClipLoader color="#333" size={16} />
                    <span>Mengunduh...</span>
                  </div>
                ) : (
                  "Download Pilihan"
                )}
              </button>

              <button
                onClick={() => setIsConfirmOpen(true)}
                disabled={selectedQRs.length === 0}
                className={`block w-full text-left px-4 py-2 hover:bg-gray-100 ${
                  selectedQRs.length === 0
                    ? "text-gray-400 cursor-not-allowed"
                    : "text-red-600"
                }`}
              >
                Hapus Pilihan
              </button>
            </div>
          </details>
        )}
      </div>

      <QRCodeListTable
        showCheckbox={showCheckbox}
        selectedQRs={selectedQRs}
        setSelectedQRs={setSelectedQRs}
        setVisibleQRs={setVisibleQRs}
        refreshKey={refreshKey} // 👈 tambahkan ini
      />
    </LayoutAdmin>
  );
};

export default QRCodeList;
