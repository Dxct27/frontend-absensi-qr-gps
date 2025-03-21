import { useState } from "react";
import LayoutAdmin from "../../components/Layout/Admin";
import QRCodeListTable from "../../components/Table/AdminQRCodeList";
import { downloadMultipleQRsAsPDF } from "../../utils/qrcodeDownload";
import { ClipLoader } from "react-spinners";

const QRCodeList = () => {
  const [showCheckbox, setShowCheckbox] = useState(false);
  const [selectedQRs, setSelectedQRs] = useState([]);
  const [loadingDownload, setLoadingDownload] = useState(false);

  const handleDownload = async () => {
    if (selectedQRs.length > 0) {
      setLoadingDownload(true);
      await downloadMultipleQRsAsPDF(selectedQRs, "OPD Name");
      setLoadingDownload(false);
    }
  };

  return (
    <LayoutAdmin>
      <h2 className="text-2xl font-bold mb-5">Semua Kode QR</h2>
      <div className="flex gap-4 mb-4">
        <button
          className="px-4 py-2 bg-blue-500 text-white rounded"
          onClick={() => {
            setShowCheckbox(!showCheckbox);
            setSelectedQRs([]);
          }}
        >
          {showCheckbox ? "Batalkan Pilihan" : "Pilih Beberapa"}
        </button>
        {showCheckbox && selectedQRs.length > 0 && (
          <button
            className="px-4 py-2 bg-green-500 text-white rounded flex items-center gap-2"
            onClick={handleDownload}
            disabled={loadingDownload}
          >
            {loadingDownload ? (
              <ClipLoader color="#ffffff" size={20} />
            ) : (
              "Download Pilihan"
            )}
          </button>
        )}
      </div>
      <QRCodeListTable
        showCheckbox={showCheckbox}
        selectedQRs={selectedQRs}
        setSelectedQRs={setSelectedQRs}
      />
    </LayoutAdmin>
  );
};

export default QRCodeList;
