import { useState } from "react";
import Modal from "../Modal";
import DatePicker, { registerLocale } from "react-datepicker";
import { id } from "date-fns/locale/id";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Dropdown from "../Dropdown";
import InputLabeled from "../InputLabeled";
import Label from "../Label";
import RectangleButton from "../RectangleButton";
import { fetchAPI } from "../../utils/api";
import { useAuth } from "../../context/AuthContext";
import { formattedDate } from "../../utils/date";

registerLocale("id", id);

const options = ["Izin", "Sakit", "Dinas Luar"];

const LeavePermissionModal = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const [leaveType, setLeaveType] = useState("");
  const [startDate, setStartDate] = useState(new Date());
  const [notes, setNotes] = useState("");
  const [attachment, setAttachment] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!leaveType) {
      toast.error("Silakan pilih jenis izin (Izin, Sakit, Dinas Luar)");
      return;
    }
    if (!user) {
      toast.error("User tidak ditemukan, silakan login ulang.");
      return;
    }

    const selectedDate = new Date(startDate);
    selectedDate.setHours(0, 0, 0, 0);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (selectedDate < today) {
      toast.error("Tanggal izin tidak boleh di masa lalu.");
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("user_id", user.id);
      formData.append("opd_id", user.opd_id);

      const formattedDate = formattedDate(selectedDate);
      
      formData.append("date", formattedDate);

      formData.append("status", leaveType.toLowerCase());
      formData.append("notes", notes);

      if (attachment) {
        formData.append("attachment", attachment);
      }

      const response = await fetchAPI("/leave-request", "POST", formData, true);

      if (response?.message) {
        toast.success(response.message || "Izin berhasil diajukan!");
        const redirectPath =
          user.group === "admin"
            ? "/admin/attendance-history"
            : "/attendance-history";
        setTimeout(() => (window.location.href = redirectPath), 2000);
      } else {
        throw new Error(
          response?.error || "Terjadi kesalahan, silakan coba lagi."
        );
      }
    } catch (error) {
      ("Error submitting leave request:", error);

      if (error.data?.error) {
        toast.error(error.data.error);
      } else if (error.response?.status === 422) {
        const errors = error.response.data?.errors || {};
        Object.values(errors)
          .flat()
          .forEach((msg) => toast.error(msg));
      } else {
        toast.error(error.message || "Gagal mengajukan izin. Coba lagi.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Pengajuan Izin">
      <div className="flex flex-col gap-4">
        <Dropdown options={options} onSelect={setLeaveType} />
        <div className="flex flex-col">
          <Label>Tanggal</Label>
          <DatePicker
            className="border p-2 w-full rounded-md"
            showIcon
            locale="id"
            dateFormat={"dd/MM/yyyy"}
            selected={startDate}
            onChange={(date) => setStartDate(date)}
          />
        </div>
        <InputLabeled
          label="Keterangan"
          placeholder="Masukkan keterangan izin"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          multiline={true}
          rows={3}
        />
        <div className="flex flex-col">
          <Label>Lampiran (PDF, JPG, JPEG, PNG, maks. 2 MB)</Label>
          <div className="flex items-center border border-gray-400 px-2 py-1 rounded-md">
            <label
              htmlFor="file-upload"
              className="bg-gray-300 hover:bg-gray-400 text-black px-3 py-1 rounded-l-md cursor-pointer"
            >
              Pilih File
            </label>
            <input
              id="file-upload"
              type="file"
              className="hidden"
              accept=".pdf, .jpg, .jpeg, .png"
              onChange={(e) => {
                const file = e.target.files[0];
                if (file) {
                  const allowedTypes = [
                    "application/pdf",
                    "image/jpeg",
                    "image/png",
                  ];
                  if (!allowedTypes.includes(file.type)) {
                    toast.error(
                      "Format file tidak valid! Hanya PDF, JPG, JPEG, PNG."
                    );
                    e.target.value = "";
                    return;
                  }
                  if (file.size > 2 * 1024 * 1024) {
                    // 2MB limit
                    toast.error("Ukuran file maksimal 2 MB!");
                    e.target.value = "";
                    return;
                  }
                  setAttachment(file);
                }
              }}
            />
            <span className="px-2">
              {attachment ? attachment.name : "Tidak ada file dipilih"}
            </span>
          </div>
        </div>

        <RectangleButton
          className="bg-blue-500 text-white border-2 p-2"
          onClick={handleSubmit}
          disabled={loading}
        >
          {loading ? "Mengirim..." : "Simpan"}
        </RectangleButton>
      </div>
    </Modal>
  );
};

export default LeavePermissionModal;
