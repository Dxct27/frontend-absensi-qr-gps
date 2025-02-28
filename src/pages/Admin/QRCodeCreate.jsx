import { useEffect, useState } from "react";
import QRCodeComponent from "../../components/QRCodeComponent";
import LayoutAdmin from "../../components/Layout/Admin";
import InputLabeled from "../../components/InputLabeled";
import LeafletAdmin from "../../components/Leaflet/Admin";
import RectangleButton from "../../components/RectangleButton";
import axios from "axios";

const API_URL = import.meta.env.VITE_BASE_URL_API;

const QRCodeCreate = () => {
  const user = JSON.parse(localStorage.getItem("user"));

  const [formData, setFormData] = useState({
    name: "",
    radius: "50",
    waktuMulai: "",
    waktuAkhir: "",
    latitude: null,
    longitude: null,
  });

  const [qrValue, setQrValue] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

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

    // Validation: waktuMulai & waktuAkhir cannot be empty
    if (!formData.waktuMulai || !formData.waktuAkhir) {
      setError("Waktu Mulai dan Waktu Akhir harus diisi!");
      setLoading(false);
      return;
    }

    const currentDate = new Date().toISOString().split("T")[0];

    const payload = {
      opd_id: user?.opd_id || "",
      name: formData.name,
      latitude: formData.latitude,
      longitude: formData.longitude,
      radius: formData.radius,
      waktu_awal: `${currentDate} ${formData.waktuMulai}:00`,
      waktu_akhir: `${currentDate} ${formData.waktuAkhir}:00`,
    };

    console.log("Payload being sent:", payload);

    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(`${API_URL}/qrcodes`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setQrValue(response.data.value);
      window.location.href = "/qrcode";
    } catch (err) {
      console.error("Error response:", err.response);
      setError("Failed to create QR code");
    }

    setLoading(false);
  };

  return (
    <LayoutAdmin>
      <div className="flex flex-col py-5">
        <div className="md:grid md:grid-cols-2 gap-5">
          <InputLabeled label="Nama Kode QR" name="name" value={formData.name} onChange={handleChange} />
          <InputLabeled label="Radius valid absen (meter)" name="radius" value={formData.radius} onChange={handleChange} />
          <InputLabeled label="Waktu Mulai" name="waktuMulai" type="time" value={formData.waktuMulai} onChange={handleChange} required />
          <InputLabeled label="Waktu Akhir" name="waktuAkhir" type="time" value={formData.waktuAkhir} onChange={handleChange} required />
        </div>

        <LeafletAdmin onLocationChange={handleLocationChange} />

        {error && <p className="text-red-500 mt-2">{error}</p>}

        <RectangleButton onClick={handleSubmit} disabled={loading}>
          {loading ? "Generating..." : "Buat Kode QR"}
        </RectangleButton>

        {qrValue && (
          <div className="mt-5">
            <h3 className="text-lg font-bold">Generated QR Code:</h3>
            <QRCodeComponent value={qrValue} />
          </div>
        )}
      </div>
    </LayoutAdmin>
  );
};

export default QRCodeCreate;
