import { useEffect, useState } from "react";
import QRCodeComponent from "../QRCodeComponent";
import InputLabeled from "../InputLabeled";
import LeafletAdmin from "../Leaflet/Admin";
import RectangleButton from "../RectangleButton";
import { fetchAPI } from "../../utils/api"; // Use fetchAPI
import Modal from "../Modal";

const QRFormModal = ({ isOpen, onClose, qrId }) => {
  useEffect(() => {
    console.log("QRFormModal received qrId:", qrId);
  }, [qrId]);

  const user = JSON.parse(localStorage.getItem("user"));

  const [formData, setFormData] = useState({
    name: "",
    radius: "250",
    waktuMulai: "",
    waktuAkhir: "",
    latitude: "",
    longitude: "",
  });

  const [qrValue, setQrValue] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    if (qrId) {
      const fetchQRCode = async (qrId) => {
        try {
          console.log("Fetching QR Code with ID:", qrId);
          const data = await fetchAPI(`/qrcodes/${qrId}`); // Use fetchAPI
          console.log("Fetched Data:", data);

          if (!data || Object.keys(data).length === 0) {
            throw new Error("Empty response received");
          }

          const toLocalTime = (utcString) => {
            const date = new Date(utcString);
            return date
              .toLocaleTimeString("id-ID", {
                hour: "2-digit",
                minute: "2-digit",
              })
              .replace(".", ":");
          };

          setFormData({
            name: data.name || "",
            radius: data.radius ? data.radius.toString() : "250",
            waktuMulai: data.waktu_awal ? toLocalTime(data.waktu_awal) : "",
            waktuAkhir: data.waktu_akhir ? toLocalTime(data.waktu_akhir) : "",
            latitude: data.latitude ?? "",
            longitude: data.longitude ?? "",
          });

          setQrValue(data.value || null);
          setIsLoaded(true);
        } catch (err) {
          console.error("QR Fetch Error:", err);
          setError("Failed to load QR code details");
        }
      };

      fetchQRCode(qrId);
    } else {
      setIsLoaded(true);
    }
  }, [qrId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleLocationChange = (coords) => {
    setFormData((prev) => ({
      ...prev,
      latitude: coords[0],
      longitude: coords[1],
    }));
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);

    if (!formData.waktuMulai || !formData.waktuAkhir) {
      setError("Waktu Mulai dan Waktu Akhir harus diisi!");
      setLoading(false);
      return;
    }

    const currentDate = new Date().toISOString().split("T")[0];

    const payload = {
      opd_id: user?.user?.opd_id || "",
      name: formData.name,
      latitude: formData.latitude,
      longitude: formData.longitude,
      radius: formData.radius,
      waktu_awal: `${currentDate} ${formData.waktuMulai}:00`,
      waktu_akhir: `${currentDate} ${formData.waktuAkhir}:00`,
      type: "daily",
    };

    try {
      if (qrId) {
        await fetchAPI(`/qrcodes/${qrId}`, "PUT", payload);
      } else {
        const response = await fetchAPI("/qrcodes", "POST", payload);
        setQrValue(response.value);
      }

      onClose();
    } catch (err) {
      setError("Failed to save QR code");
    }

    setLoading(false);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={qrId ? "Edit QR Code" : "Buat QR Code"}
    >
      <div className="space-y-4">
        {isLoaded && (
          <>
            <InputLabeled
              label="Nama Kode QR"
              name="name"
              placeholder="Misal: Absen Pagi"
              value={formData.name || ""}
              onChange={handleChange}
            />
            <InputLabeled
              label="Radius valid absen (meter)"
              name="radius"
              placeholder="Misal: 250"
              value={formData.radius || ""}
              onChange={handleChange}
            />
            <InputLabeled
              label="Waktu Mulai"
              name="waktuMulai"
              type="time"
              value={formData.waktuMulai || ""}
              onChange={handleChange}
              required
            />
            <InputLabeled
              label="Waktu Akhir"
              name="waktuAkhir"
              type="time"
              value={formData.waktuAkhir || ""}
              onChange={handleChange}
              required
            />
          </>
        )}

        <LeafletAdmin onLocationChange={handleLocationChange} />

        {error && <p className="text-red-500">{error}</p>}

        <RectangleButton onClick={handleSubmit} disabled={loading}>
          {loading ? "Processing..." : qrId ? "Update QR Code" : "Buat Kode QR"}
        </RectangleButton>

        {qrValue && qrId && (
          <div className="mt-5">
            <h3 className="text-lg font-bold">QR Code:</h3>
            <QRCodeComponent qrCodeId={qrId} />
          </div>
        )}
      </div>
    </Modal>
  );
};

export default QRFormModal;
