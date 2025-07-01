import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Modal from "../Modal";
import QRCodeComponent from "../QRCodeComponent";
import { fetchAPI } from "../../utils/api";
import { formattedTimeDate } from "../../utils/date";

const QRCodeModal = ({ isOpen, onClose, qrCodeId }) => {
  const [attendances, setAttendances] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAll, setShowAll] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (qrCodeId) {
      const fetchAttendance = async () => {
        setLoading(true);
        try {
          const endpoint = showAll
            ? `/qrcodes/${qrCodeId}/attendances`
            : `/qrcodes/${qrCodeId}/attendances?limit=5`;
          const data = await fetchAPI(endpoint);
          setAttendances(data);
        } catch (err) {
          console.error("Error fetching attendance:", err);
        }
        setLoading(false);
      };

      fetchAttendance();
    }
  }, [qrCodeId, showAll]);

  const handleShowAll = () => {
    navigate(`/attendance/${qrCodeId}`); // Navigate to the new page with the QR code ID
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
                {formattedTimeDate(record.created_at)})
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-500 mt-2">No attendance records found.</p>
        )}

        <button
          className="mt-5 px-4 py-2 bg-blue-500 text-white rounded"
          onClick={handleShowAll}
        >
          {showAll ? "Show Latest 5" : "Show All"}
        </button>
      </div>
    </Modal>
  );
};

export default QRCodeModal;
