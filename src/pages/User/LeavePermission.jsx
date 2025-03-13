import { useState } from "react";
import DatePicker, { registerLocale } from "react-datepicker";
import { id } from "date-fns/locale/id";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import LayoutUser from "../../components/Layout/User";
import Dropdown from "../../components/Dropdown";
import InputLabeled from "../../components/InputLabeled";
import Label from "../../components/Label";
import RectangleButton from "../../components/RectangleButton";
import { fetchAPI } from "../../utils/api";
import { useAuth } from "../../context/AuthContext"; // Import AuthContext
import { useNavigate } from "react-router-dom"; // Import for redirection

registerLocale("id", id);

const options = ["Izin", "Sakit", "Dinas Luar"];

const LeavePermission = () => {
  const { user } = useAuth(); // Get authenticated user
  const [leaveType, setLeaveType] = useState("");
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(null);
  const [notes, setNotes] = useState("");
  const [attachment, setAttachment] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate(); // Initialize navigate function

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
      console.log("Form data:", formData);

      const response = await fetchAPI("/leave-request", "POST", formData, true); // true for FormData support

      toast.success("Izin berhasil diajukan!");
      setTimeout(() => {
        navigate("/dashboard"); // Adjust the path as needed
      }, 2000);
      console.log(response);
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
    <LayoutUser>
      <ToastContainer /> {/* Add this to enable toast notifications */}
      <h2>Pengajuan Ijin Baru</h2>
      <div className="md:grid md:grid-cols-2 gap-4">
        <div className="col-span-1 flex flex-col gap-4">
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
              className="h-screen"
              label="Keterangan"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
        </div>
        <div className="cols-span-1 flex flex-col gap-4">
          <Label>Lampiran</Label>
          <input
            type="file"
            onChange={(e) => setAttachment(e.target.files[0])}
          />
          <RectangleButton
            className="w-fit bg-blue-500 text-white border-2 border-black px-5"
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? "Mengirim..." : "Simpan"}
          </RectangleButton>
        </div>
      </div>
    </LayoutUser>
  );
};

export default LeavePermission;
