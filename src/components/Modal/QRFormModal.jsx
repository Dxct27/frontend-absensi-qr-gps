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
import { format } from "date-fns";
import Label from "../Label";
import SpecialEventCategoryFormModal from "./SpecialEventCategoryFormModal";
import { Switch } from "@headlessui/react";

const QRFormModal = ({ isOpen, onClose, qrId, clonedData, type, eventId }) => {
  const user = JSON.parse(localStorage.getItem("user"));

  const defaultFormData = {
    name: "",
    radius: "",
    tanggalMulai: new Date(),
    tanggalAkhir: new Date(),
    waktuMulai: "",
    waktuAkhir: "",
    latitude: "",
    longitude: "",
    categoryId: "",
  };

  const [formData, setFormData] = useState(defaultFormData);
  const [qrValue, setQrValue] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [categories, setCategories] = useState([]);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showLocation, setShowLocation] = useState(true);

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
        : defaultFormData.tanggalMulai;
    };

    if (clonedData) {
      setFormData({
        name: clonedData.name || "",
        radius: clonedData.radius?.toString() || "",
        tanggalMulai: extractDate(clonedData.waktu_awal),
        tanggalAkhir: extractDate(clonedData.waktu_akhir),
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
            radius: data.radius ? data.radius.toString() : "",
            tanggalMulai: extractDate(data.waktu_awal),
            tanggalAkhir: extractDate(data.waktu_akhir),
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

    if (type === "specialEventForm") {
      const fetchCategories = async () => {
        try {
          const data = await fetchAPI("/special-event-categories");
          setCategories(data || []);
        } catch (err) {
          console.error("Failed to fetch categories:", err);
          toast.error("Failed to load categories");
        }
      };

      fetchCategories();
    }

    if (eventId) {
      const fetchSpecialEvent = async () => {
        try {
          const eventData = await fetchAPI(`/special-events/${eventId}`);
          if (!eventData || Object.keys(eventData).length === 0) {
            throw new Error("Empty response received");
          }

          setFormData((prev) => ({
            ...prev,
            name: eventData.name || prev.name,
            tanggalMulai: eventData.date
              ? new Date(eventData.date)
              : prev.tanggalMulai,
            categoryId: eventData.special_event_category_id?.toString() || "",
          }));
        } catch (err) {
          console.error("Failed to fetch special event:", err);
          toast.error("Failed to load special event details");
        }
      };

      fetchSpecialEvent();
    }
  }, [qrId, clonedData, type, eventId]);

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
    console.log("handleSubmit called");
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

    const formatTanggalMulai = format(formData.tanggalMulai, "yyyy-MM-dd");
    const formatTanggalAkhir = format(formData.tanggalAkhir, "yyyy-MM-dd");

    const payload = {
      opd_id: user?.opd_id || "",
      name: formData.name,
      latitude: formData.latitude,
      longitude: formData.longitude,
      radius: formData.radius,
      waktu_awal: `${formatTanggalMulai} ${formData.waktuMulai}:00`,
      waktu_akhir: `${formatTanggalAkhir} ${formData.waktuAkhir}:00`,
      type: "daily",
    };

    try {
      let finalEventId = eventId;

      if (type === "specialEventForm") {
        const specialEventPayload = {
          name: formData.name,
          date: formatTanggalMulai,
          opd_id: user?.opd_id || "",
          special_event_category_id: formData.categoryId,
        };

        if (eventId) {
          await fetchAPI(
            `/special-events/${eventId}`,
            "PUT",
            specialEventPayload
          );
          console.log("Event updated successfully");
          toast.success("Event berhasil diperbarui!");
        } else {
          console.log("Creating new special event with payload:", specialEventPayload);
          const eventResponse = await fetchAPI(
            "/special-events",
            "POST",
            specialEventPayload
          );
          console.log("Event created successfully");
          finalEventId = eventResponse.id;
        }

        payload.type = "special_event";
        payload.event_id = finalEventId;
        console.log("Event ID:", finalEventId);
      }
      
      console.log("Creating new QR Code with payload:", payload);
      if (qrId) {
        await fetchAPI(`/qrcodes/${qrId}`, "PUT", payload);
        toast.success("QR Code berhasil diperbarui!");
      } else {
        const response = await fetchAPI("/qrcodes", "POST", payload);
        setQrValue(response.value);
        toast.success("QR Code berhasil dibuat!");
      }

      handleClose();
    } catch (err) {
      console.error("Error creating or updating QR code:", err);
      toast.error("Failed to save data");
    }

    setLoading(false);
  };

  const handleClose = () => {
    setFormData(defaultFormData);
    setShowLocation(true);
    setQrValue(null);
    onClose();
  };

  useEffect(() => {
    if (!showLocation) {
      setFormData((prev) => ({
        ...prev,
        radius: "",
        latitude: null,
        longitude: null,
      }));
    }
  }, [showLocation]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={
        type === "specialEventForm"
          ? eventId
            ? "Edit Event"
            : "Buat Event"
          : qrId
          ? "Edit QR Code"
          : "Buat QR Code"
      }
      sizeClasses="w-full md:w-2/3"
    >
      <SpecialEventCategoryFormModal
        isOpen={showCategoryModal}
        onClose={() => setShowCategoryModal(false)}
        onSuccess={(newCat) => {
          setCategories((prev) => [...prev, newCat]);
          setFormData((prev) => ({
            ...prev,
            categoryId: newCat.id.toString(),
          }));
        }}
      />

      <div className="space-y-4">
        {isLoaded && (
          <>
            <InputLabeled
              label={
                type === "specialEventForm" ? "Nama Event" : "Nama Kode QR"
              }
              name="name"
              placeholder={
                type === "specialEventForm"
                  ? "Misal: Rapat Dinas"
                  : "Misal: Absen Pagi"
              }
              value={formData.name || ""}
              onChange={handleChange}
            />
            {type === "specialEventForm" && (
              <div className="flex flex-col">
                <Label className="mb-1 font-medium">Kategori</Label>
                <select
                  name="categoryId"
                  value={formData.categoryId}
                  onChange={(e) => {
                    if (e.target.value === "add_new") {
                      setShowCategoryModal(true);
                      return;
                    }
                    handleChange(e);
                  }}
                  className="border border-gray-200 rounded-lg px-4 py-2"
                >
                  <option value="">Pilih kategori</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                  <option value="add_new">+ Tambah Kategori Baru</option>
                </select>
              </div>
            )}
            <div className="flex flex-col">
              <Label className="mb-1 font-medium">Tanggal Mulai</Label>
              <DatePicker
                selected={formData.tanggalMulai}
                onChange={(date) =>
                  setFormData((prev) => ({
                    ...prev,
                    tanggalMulai: date,
                  }))
                }
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
            <div className="flex flex-col">
              <Label className="mb-1 font-medium">Tanggal Akhir</Label>
              <DatePicker
                selected={formData.tanggalAkhir}
                onChange={(date) =>
                  setFormData((prev) => ({
                    ...prev,
                    tanggalAkhir: date,
                  }))
                }
                dateFormat="dd/MM/yyyy"
                className="opacity-70 border-2 transform transition ease-in-out duration-100 rounded-lg border-gray-100 focus:border-primary500 py-4 px-3 w-full focus:outline-none"
              />
            </div>
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
        <div className="flex flex-row justify-between mt-5">
          <Label className="mb-1 font-medium">Lokasi</Label>
          <Switch
            checked={showLocation}
            onChange={setShowLocation}
            className="group inline-flex h-6 w-11 items-center rounded-full bg-gray-200 transition data-checked:bg-blue-600"
          >
            <span className="size-4 translate-x-1 rounded-full bg-white transition group-data-checked:translate-x-6" />
          </Switch>
        </div>
        {showLocation && (
          <>
            <InputLabeled
              label="Radius valid absen (meter)"
              name="radius"
              placeholder="Misal: 50"
              value={formData.radius || ""}
              onChange={handleChange}
            />
            <LeafletAdmin
              onLocationChange={handleLocationChange}
              initialLat={formData.latitude}
              initialLng={formData.longitude}
            />
          </>
        )}
        <RectangleButton className={"p-2 bg-blue-500 text-white"} onClick={handleSubmit} disabled={loading}>
          {loading
            ? "Processing..."
            : type === "specialEventForm"
            ? eventId
              ? "Update Event"
              : "Buat Event"
            : qrId
            ? "Update QR Code"
            : "Buat Kode QR"}
        </RectangleButton>

        {qrValue && qrId && type !== "specialEventForm" && (
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
