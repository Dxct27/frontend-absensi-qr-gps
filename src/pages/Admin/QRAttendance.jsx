import { useState, useEffect } from "react";
import LayoutAdmin from "../../components/Layout/Admin";
import AdminQRAttendanceTable from "../../components/Table/AdminQRAttendance";
import { useParams } from "react-router-dom";
import { fetchAPI } from "../../utils/api";

const QRAttendance = () => {
  const { qrCodeId } = useParams();
  const [refreshKey, setRefreshKey] = useState(0);
  const [qrName, setQrName] = useState(""); 

  useEffect(() => {
    const fetchQrDetails = async () => {
      try {
        const data = await fetchAPI(`/qrcodes/${qrCodeId}`); 
        setQrName(data.name || "Unknown QR Code");
      } catch (err) {
        console.error("Error fetching QR code details:", err);
        setQrName("Unknown QR Code");
      }
    };

    fetchQrDetails();
  }, [qrCodeId]);

  return (
    <LayoutAdmin>
      <h2 className="text-2xl font-bold mb-5">Attendance Records for {qrName}</h2>
      <p className="mb-4 text-gray-600">
        Viewing attendance records for QR Code: <strong>{qrName}</strong>
      </p>

      <AdminQRAttendanceTable qrCodeId={qrCodeId} qrCodeName={qrName} refreshKey={refreshKey} />
    </LayoutAdmin>
  );
};

export default QRAttendance;