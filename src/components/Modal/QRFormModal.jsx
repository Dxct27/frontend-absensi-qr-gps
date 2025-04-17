import { useEffect, useState } from "react";
import QRCodeComponent from "../QRCodeComponent";
import InputLabeled from "../InputLabeled";
import LeafletAdmin from "../Leaflet/Admin";
import RectangleButton from "../RectangleButton";
import { fetchAPI } from "../../utils/api";
import Modal from "../Modal";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { format, parse } from "date-fns";
import Label from "../Label";

const QRFormModal = ({ isOpen, onClose, qrId, clonedData }) => {
  const user = JSON.parse(localStorage.getItem("user"));

  const defaultFormData = {
    name: "",
    radius: "50",
    tanggal: new Date(),
    waktuMulai: "",
    waktuAkhir: "",
    latitude: "",
    longitude: "",
  };

  const [formData, setFormData] = useState(defaultFormData);
  const [qrValue, setQrValue] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    
    const toLocalTime = (utcString) => {
      const date = new Date(utcString);
      return `${String(date.getHours()).padStart(2, "0")}:${String(
        date.getMinutes()
      ).padStart(2, "0")}`;
    };

    const extractDate = (dateTimeString) => {
      return dateTimeString
        ? new Date(dateTimeString)
        : defaultFormData.tanggal;
    };

    if (clonedData) {
      setFormData({
        name: clonedData.name || "",
        radius: clonedData.radius?.toString() || "250",
        tanggal: extractDate(clonedData.waktu_awal),
        waktuMulai: clonedData.waktu_awal
          ? toLocalTime(clonedData.waktu_awal)
          : "",
        waktuAkhir: clonedData.waktu_akhir
          ? toLocalTime(clonedData.waktu_akhir)
          : "",
        latitude: clonedData.latitude ?? "",
        longitude: clonedData.longitude ?? "",
      });
      setQrValue(null);
      setIsLoaded(true);
    } else if (qrId) {
      const fetchQRCode = async () => {
        try {
          const data = await fetchAPI(`/qrcodes/${qrId}`);
          if (!data || Object.keys(data).length === 0) {
            throw new Error("Empty response received");
          }

          setFormData({
            name: data.name || "",
            radius: data.radius ? data.radius.toString() : "250",
            tanggal: extractDate(data.waktu_awal),
            waktuMulai: data.waktu_awal ? toLocalTime(data.waktu_awal) : "",
            waktuAkhir: data.waktu_akhir ? toLocalTime(data.waktu_akhir) : "",
            latitude: data.latitude ?? "",
            longitude: data.longitude ?? "",
          });

          setQrValue(data.value || null);
          setIsLoaded(true);
        } catch (err) {
          console.error("QR Fetch Error:", err);
          toast.error("Failed to load QR code details");
        }
      };

      fetchQRCode();
    } else {
      setIsLoaded(true);
    }
  }, [qrId, clonedData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleDateChange = (date) => {
    setFormData((prev) => ({
      ...prev,
      tanggal: date,
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

    if (!formData.waktuMulai || !formData.waktuAkhir) {
      toast.error("Waktu Mulai dan Waktu Akhir harus diisi!");
      setLoading(false);
      return;
    }

    if (!formData.name) {
      toast.error("Nama QR Code harus diisi!");
      setLoading(false);
      return;
    }

    const formattedDate = format(formData.tanggal, "yyyy-MM-dd");

    const payload = {
      opd_id: user?.opd_id || "",
      name: formData.name,
      latitude: formData.latitude,
      longitude: formData.longitude,
      radius: formData.radius,
      waktu_awal: `${formattedDate} ${formData.waktuMulai}:00`,
      waktu_akhir: `${formattedDate} ${formData.waktuAkhir}:00`,
      type: "daily",
    };

    try {
      if (qrId) {
        await fetchAPI(`/qrcodes/${qrId}`, "PUT", payload);
        toast.success("QR Code berhasil diperbarui!");
      } else {
        const response = await fetchAPI("/qrcodes", "POST", payload);
        setQrValue(response.value);
        toast.success("QR Code berhasil dibuat!");
      }
      setFormData(defaultFormData);
      onClose();
    } catch (err) {
      toast.error("Failed to save QR code");
    }

    setLoading(false);
  };

  const handleClose = () => {
    setFormData(defaultFormData);
    setQrValue(null);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={qrId ? "Edit QR Code" : "Buat QR Code"}
      sizeClasses="w-full md:w-2/3"
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
            <div className="flex flex-col">
              <Label className="mb-1 font-medium">Tanggal</Label>
              <DatePicker
                selected={formData.tanggal}
                onChange={handleDateChange}
                dateFormat="dd/MM/yyyy"
                className="opacity-70 border-2 transform transition ease-in-out duration-100 rounded-lg border-gray-100 focus:border-primary500 py-4 px-3 w-full focus:outline-none"
              />
            </div>
            <InputLabeled
              label="Waktu Mulai"
              name="waktuMulai"
              type="time"
              value={formData.waktuMulai || ""}
              onChange={handleChange}
              required
              lang="id-ID"
            />
            <InputLabeled
              label="Waktu Akhir"
              name="waktuAkhir"
              type="time"
              value={formData.waktuAkhir || ""}
              onChange={handleChange}
              required
              lang="id-ID"
            />
          </>
        )}

        <LeafletAdmin
          onLocationChange={handleLocationChange}
          initialLat={formData.latitude}
          initialLng={formData.longitude}
        />

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
