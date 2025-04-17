import { useState, useEffect } from "react";
import LayoutAdmin from "../../components/Layout/Admin";
import AdminDailyAttendance from "../../components/Table/AdminDailyAttendance";
import DatePicker, { registerLocale } from "react-datepicker";
import { id } from "date-fns/locale/id";
import "react-datepicker/dist/react-datepicker.css";
import { fetchAPI } from "../../utils/api";
import {
  format,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
} from "date-fns";

registerLocale("id", id);

const DashboardAdmin = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [monthDate, setMonthDate] = useState(null);
  const [weekDate, setWeekDate] = useState(null);
  const [filterType, setFilterType] = useState("daily");
  const [attendanceData, setAttendanceData] = useState([]);
  const [users, setUsers] = useState([]);
  const [days, setDays] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let dateToSend = selectedDate;
    let newFilterType = "daily";

    if (monthDate) {
      dateToSend = monthDate;
      newFilterType = "monthly";
    } else if (weekDate) {
      dateToSend = weekDate;
      newFilterType = "weekly";
    }

    setFilterType(newFilterType);
    const startDate =
      newFilterType === "weekly"
        ? startOfWeek(dateToSend, { weekStartsOn: 1 })
        : newFilterType === "monthly"
          ? startOfMonth(dateToSend)
          : dateToSend;

    const endDate =
      newFilterType === "weekly"
        ? endOfWeek(dateToSend, { weekStartsOn: 1 })
        : newFilterType === "monthly"
          ? endOfMonth(dateToSend)
          : dateToSend;

    setDays(
      eachDayOfInterval({
        start: startDate,
        end: endDate,
      })
    );

    const fetchData = async () => {
      try {
        setLoading(true);

        const formattedDate = format(dateToSend, "yyyy-MM-dd");

        const [attendanceRes, usersRes] = await Promise.all([
          fetchAPI(`/attendance?date=${formattedDate}&filter=${newFilterType}`),
          fetchAPI("/users"),
        ]);

        setAttendanceData(attendanceRes.data || []);
        setUsers(Array.isArray(usersRes) ? usersRes : []);
      } catch (error) {
        ("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [selectedDate, monthDate, weekDate]);

  return (
    <LayoutAdmin>
      <div className="p-4">
        <p className="font-semibold">Filter:</p>
        <div className="flex flex-col md:flex-row gap-2 mb-4">
          <div>
            <p>Hari</p>
            <DatePicker
              className="border px-2 py-1"
              selected={selectedDate}
              placeholderText="Pilih Tanggal"
              onChange={(date) => {
                setSelectedDate(date);
                setMonthDate(null);
                setWeekDate(null);
              }}
              dateFormat="dd MMM yyyy"
              locale="id"
            />
          </div>
          <div>
            <p>Minggu</p>
            <DatePicker
              className="border px-2 py-1"
              showWeekPicker
              showWeekNumbers
              selected={weekDate}
              placeholderText="Pilih Minggu"
              onChange={(date) => {
                setWeekDate(date);
                setMonthDate(null);
                setSelectedDate(null);
              }}
              dateFormat="I yyyy"
              locale="id"
            />
          </div>
          <div>
            <p>Bulan</p>
            <DatePicker
              className="border px-2 py-1"
              showMonthYearPicker
              selected={monthDate}
              placeholderText="Pilih Bulan"
              onChange={(date) => {
                setMonthDate(date);
                setWeekDate(null);
                setSelectedDate(null);
              }}
              dateFormat="MMMM yyyy"
              locale="id"
            />
          </div>
        </div>
        {loading ? (
          <p>Loading attendance data...</p>
        ) : (
          <AdminDailyAttendance
            attendanceData={attendanceData}
            users={users}
            days={days}
            filterType={filterType}
          />
        )}
      </div>
    </LayoutAdmin>
  );
};

export default DashboardAdmin;
