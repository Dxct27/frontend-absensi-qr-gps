import { useEffect, useState } from "react";
import Modal from "../Modal";
import QRCodeComponent from "../QRCodeComponent";
import { fetchAPI } from "../../utils/api";

const QRCodeModal = ({ isOpen, onClose, qrCodeId }) => {
  const [attendances, setAttendances] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (qrCodeId) {
      const fetchAttendance = async () => {
        setLoading(true);
        try {
          const data = await fetchAPI(`/qrcodes/${qrCodeId}/attendances`);
          setAttendances(data);
        } catch (err) {
          console.error("Error fetching attendance:", err);
        }
        setLoading(false);
      };

      fetchAttendance();
    }
  }, [qrCodeId]);

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return (
      date.toLocaleTimeString("id-ID", {
        hour: "2-digit",
        minute: "2-digit",
      }) +
      " " +
      date.toLocaleDateString("id-ID", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      })
    );
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="QR Code Attendance">
      <div className="flex flex-col items-center justify-center p-5">
        <QRCodeComponent qrCodeId={qrCodeId} />

        <h3 className="mt-5 text-lg font-bold">Attendance Records</h3>

        {loading ? (
          <p>Loading...</p>
        ) : attendances.length > 0 ? (
          <ul className="w-full mt-3 border rounded-lg p-3 text-center">
            {attendances.map((record) => (
              <li key={record.id} className="py-2 border-b last:border-none">
                {record.user.name} - {record.status} (
                {formatDate(record.created_at)})
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-500 mt-2">No attendance records found.</p>
        )}
      </div>
    </Modal>
  );
};

export default QRCodeModal;
