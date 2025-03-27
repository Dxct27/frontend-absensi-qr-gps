import Modal from "../Modal";
import InputLabeled from "../InputLabeled";

const AttendanceDetailModal = ({ isOpen, onClose, attendanceData }) => {
  if (!attendanceData || !attendanceData.user) return null;

  const {
    user,
    status,
    timestamp,
    latitude,
    longitude,
    notes,
    attachment,
    date,
  } = attendanceData;
  const hasLocation = latitude && longitude;
  const mapsLink = hasLocation
    ? `https://www.google.com/maps?q=${latitude},${longitude}`
    : null;
  const BASE_URL = import.meta.env.VITE_BACKEND_URL;
  const API_BASE_URL = `${BASE_URL}/storage`;

  const fileUrl = attachment ? `${API_BASE_URL}/${attachment}` : null;

  // Format waktu: dd/mm/yyyy - hh:mm
  const formattedTime = date
    ? `${new Date(date).toLocaleDateString("id-ID")} - ${timestamp || ""}`
    : "-";

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Detail Absensi">
      <div className="space-y-4">
        <InputLabeled label="Nama" value={user?.name || "-"} readOnly />
        <InputLabeled label="NIP" value={user?.nip || "-"} readOnly />
        <InputLabeled
          label="Status"
          value={status.charAt(0).toUpperCase() + status.slice(1)}
          readOnly
        />
        <InputLabeled label="Waktu" value={formattedTime} readOnly />

        <div>
          <InputLabeled
            label="Lokasi"
            value={
              hasLocation ? `${latitude}, ${longitude}` : "🚫 Tidak tersedia"
            }
            readOnly
          />
          {hasLocation && (
            <a
              href={mapsLink}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 underline block"
            >
              Lihat di Google Maps
            </a>
          )}
        </div>

        <InputLabeled
          label="Catatan"
          value={notes ? notes : "Tidak ada catatan"}
          readOnly
        />

        <InputLabeled
          label="File Lampiran"
          value={
            attachment
              ? attachment.replace("leave_attachment/", "")
              : "Tidak ada file lampiran"
          }
          readOnly
        />

        {attachment && (
          <div>
            {attachment.endsWith(".pdf") ? (
              <a
                href={fileUrl}
                download
                className="text-blue-600 underline block"
              >
                Unduh File
              </a>
            ) : (
              <>
                <img
                  src={fileUrl}
                  alt="Lampiran Izin"
                  className="max-w-full h-auto rounded"
                  onError={(e) => (e.target.style.display = "none")}
                />
                <a
                  href={fileUrl}
                  download
                  className="text-blue-600 underline block mt-2"
                >
                  Unduh Gambar
                </a>
              </>
            )}
          </div>
        )}
      </div>
    </Modal>
  );
};

export default AttendanceDetailModal;
