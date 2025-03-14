import { useState } from "react";
import Modal from "../Modal";
import DatePicker, { registerLocale } from "react-datepicker";
import { id } from "date-fns/locale/id";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Dropdown from "../Dropdown";
import InputLabeled from "../InputLabeled";
import Label from "../Label";
import RectangleButton from "../RectangleButton";
import { fetchAPI } from "../../utils/api";
import { useAuth } from "../../context/AuthContext";

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

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("user_id", user.id);
      formData.append("opd_id", user.opd_id);
      formData.append("date", startDate.toISOString().split("T")[0]);
      formData.append("status", leaveType.toLowerCase());
      formData.append("notes", notes);
      const currentTimestamp = new Date().toLocaleTimeString("id-ID", {
        hour12: false,
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      });
      formData.append("timestamp", currentTimestamp);
      if (attachment) {
        formData.append("attachment", attachment);
      }

      const response = await fetchAPI("/leave-request", "POST", formData, true);

      if (response?.message === "Leave request recorded successfully") {
        toast.success("Izin berhasil diajukan!");
        onClose();
      } else {
        toast.error("Terjadi kesalahan, silakan coba lagi.");
      }
    } catch (error) {
      console.error("Error submitting leave request:", error);
      const errorMessage =
        error.response?.data?.message || "Gagal mengajukan izin. Coba lagi.";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Pengajuan Izin">
      <ToastContainer />
      <div className="flex flex-col gap-4">
        <Dropdown options={options} onSelect={setLeaveType} />
        <div className="flex flex-col">
          <Label>Tanggal</Label>
          <DatePicker
            className="border px-2 py-1"
            showIcon
            locale="id"
            dateFormat={"dd/MM/yyyy"}
            selected={startDate}
            onChange={(date) => setStartDate(date)}
          />
        </div>
        <InputLabeled
          label="Keterangan"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />
        <Label>Lampiran</Label>
        <input type="file" onChange={(e) => setAttachment(e.target.files[0])} />
        <RectangleButton
          className="w-fit bg-blue-500 text-white border-2 border-black px-5"
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
