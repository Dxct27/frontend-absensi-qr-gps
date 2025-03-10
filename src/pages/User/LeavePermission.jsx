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
      const requestData = {
        user_id: user.id,
        opd_id: user.opd_id,
        date: startDate.toISOString().split("T")[0],
        timestamp: "00:00:00",
        status: leaveType.toLowerCase(),
        notes,
      };

      const response = await fetchAPI("/attendance", "POST", requestData);

      toast.success("Izin berhasil diajukan!");
      console.log(response);
    } catch (error) {
      console.error("Error submitting leave request:", error);
      const errorMessage = error.response?.data?.message || "Gagal mengajukan izin. Coba lagi.";
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
        <div className="col-span-1">
          <Dropdown options={options} onSelect={setLeaveType} />
          <div className="flex flex-col">
            <Label>Tanggal Awal</Label>
            <DatePicker
              className="border px-2 py-1"
              showIcon
              locale="id"
              dateFormat={"dd/MM/yyyy"}
              selected={startDate}
              onChange={(date) => setStartDate(date)}
            />
          </div>
          <div className="flex flex-col">
            <Label>Tanggal Akhir (Opsional)</Label>
            <DatePicker
              className="border px-2 py-1"
              showIcon
              locale="id"
              dateFormat={"dd/MM/yyyy"}
              placeholderText="dd/mm/yyyy"
              selected={endDate}
              onChange={(date) => setEndDate(date)}
            />
          </div>
        </div>
        <div className="cols-span-1 flex flex-col gap-4">
          <InputLabeled label="Keterangan" value={notes} onChange={(e) => setNotes(e.target.value)} />
          <Label>Lampiran (Belum Dikirim)</Label>
          <input type="file" onChange={(e) => setAttachment(e.target.files[0])} />
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
