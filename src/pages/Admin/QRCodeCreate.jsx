import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import QRCodeComponent from "../../components/QRCodeComponent";
import LayoutAdmin from "../../components/Layout/Admin";
import InputLabeled from "../../components/InputLabeled";
import LeafletAdmin from "../../components/Leaflet/Admin";
import RectangleButton from "../../components/RectangleButton";
import { fetchAPI } from "../../utils/api";

const QRCodeCreate = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));

  const [formData, setFormData] = useState({
    name: "",
    radius: "",
    waktuMulai: "",
    waktuAkhir: "",
    latitude: "",
    longitude: "",
  });

  const [qrValue, setQrValue] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isLoaded, setIsLoaded] = useState(false); // 🔥 Force UI re-render

  useEffect(() => {
    if (id) {
      const fetchQRCode = async () => {
        try {
          console.log("Fetching QR Code with ID:", id);
          const data = await fetchAPI(`/qrcodes/${id}`);
          console.log("Fetched Data:", data);

          if (!data || Object.keys(data).length === 0) {
            throw new Error("Empty response received");
          }

          setFormData({
            name: data.name || "",
            radius: data.radius ? data.radius.toString() : "50",
            waktuMulai: data.waktu_awal ? data.waktu_awal.split("T")[1].slice(0, 5) : "",
            waktuAkhir: data.waktu_akhir ? data.waktu_akhir.split("T")[1].slice(0, 5) : "",
            latitude: data.latitude ?? "",
            longitude: data.longitude ?? "",
          });

          console.log("Updated Form Data:", formData);
          setQrValue(data.value || null);
          setIsLoaded(true);
        } catch (err) {
          console.error("QR Fetch Error:", err);
          setError("Failed to load QR code details");
        }
      };

      fetchQRCode();
    } else {
      setIsLoaded(true);
    }
  }, [id]);

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
      opd_id: user?.opd_id || "",
      name: formData.name,
      latitude: formData.latitude,
      longitude: formData.longitude,
      radius: formData.radius,
      waktu_awal: `${currentDate} ${formData.waktuMulai}:00`,
      waktu_akhir: `${currentDate} ${formData.waktuAkhir}:00`,
    };

    try {
      if (id) {
        await fetchAPI(`/qrcodes/${id}`, "PUT", payload);
      } else {
        const response = await fetchAPI("/qrcodes", "POST", payload);
        setQrValue(response.value);
      }

      navigate("/qrcode");
    } catch (err) {
      setError("Failed to save QR code");
    }

    setLoading(false);
  };

  console.log("Rendering with formData:", formData); // Debug UI update

  return (
    <LayoutAdmin>
      <div className="flex flex-col py-5">
        <div className="md:grid md:grid-cols-2 gap-5">
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
                placeholder="Misal: 50"
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
        </div>

        <LeafletAdmin onLocationChange={handleLocationChange} />

        {error && <p className="text-red-500 mt-2">{error}</p>}

        <RectangleButton onClick={handleSubmit} disabled={loading}>
          {loading ? "Processing..." : id ? "Update QR Code" : "Buat Kode QR"}
        </RectangleButton>

        {qrValue && id && (
          <div className="mt-5">
            <h3 className="text-lg font-bold">QR Code:</h3>
            <QRCodeComponent qrCodeId={id} />
          </div>
        )}
      </div>
    </LayoutAdmin>
  );
};

export default QRCodeCreate;
