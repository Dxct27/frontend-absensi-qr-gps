import { useState, useEffect, useContext } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { fetchAPI } from "../../utils/api";
import UserHistory from "../../components/Table/UserHistory";
import { AuthContext } from "../../context/AuthContext";
import LayoutUser from "../../components/Layout/User";
import Card from "../../components/Card"; // Import Card component

const AttendanceHistory = () => {
  const { user } = useContext(AuthContext);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [attendanceData, setAttendanceData] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      fetchAttendance();
    }
  }, [selectedDate, user]);

  const fetchAttendance = async () => {
    setLoading(true);
    try {
      const formattedDate = selectedDate.toISOString().split("T")[0];
      const response = await fetchAPI(
        `/attendance?user_id=${user.id}&date=${formattedDate}&filter=monthly`
      );

      if (response && response.data) {
        setAttendanceData(response.data);
        console.log("Fetched Attendance Data:", response.data);
      } else {
        setAttendanceData([]);
        console.warn("No attendance data received");
      }
    } catch (error) {
      console.error("Error fetching attendance:", error);
      setAttendanceData([]);
    } finally {
      setLoading(false);
    }
  };

  // 🔢 Calculate summary
  const summary = attendanceData.reduce(
    (acc, { status }) => {
      if (status === "hadir") acc.Hadir++;
      else if (status === "izin") acc.Izin++;
      else if (status === "sakit") acc.Sakit++;
      else if (status === "lokasi di luar radius") acc.OutOfBound++;
      else if (status === "absen" || status === "-") acc["Tidak Hadir"]++;
      return acc;
    },
    { Hadir: 0, Izin: 0, Sakit: 0, OutOfBound: 0, "Tidak Hadir": 0 }
  );

  return (
    <LayoutUser>
      <div className="">
        <h2 className="text-xl font-semibold mb-4">Riwayat Absensi</h2>

        {/* 📅 Date Picker */}
        <div className="mb-4">
          <label className="block text-gray-700">Pilih Tanggal:</label>
          <DatePicker
            selected={selectedDate}
            onChange={(date) => setSelectedDate(date)}
            dateFormat="MMMM yyyy"
            showMonthYearPicker
            className="border rounded px-3 py-1"
          />
        </div>

        {/* 📊 Attendance Table */}
        {loading ? (
          <p>Loading data...</p>
        ) : (
          <UserHistory
            selectedDate={selectedDate}
            attendanceData={attendanceData}
          />
        )}
      </div>

      {/* 🔹 Summary Cards */}
      <div className="flex flex-col md:grid md:grid-cols-4 gap-4 mb-4">
        <Card title="Hadir" subTitle="Total Kehadiran" sum={summary.Hadir} />
        <Card title="Izin" subTitle="Total Izin" sum={summary.Izin} />
        <Card title="Sakit" subTitle="Total Sakit" sum={summary.Sakit} />
        <Card title="OutOfBound" subTitle="Total Luar" sum={summary.OutOfBound} />
        <Card
          title="Tidak Hadir"
          subTitle="Total Absen"
          sum={summary["Tidak Hadir"]}
        />
      </div>
    </LayoutUser>
  );
};

export default AttendanceHistory;
