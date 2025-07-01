import { useState, useEffect, act } from "react";
import LayoutAdmin from "../../components/Layout/Admin";
import AdminDailyAttendance from "../../components/Table/AdminDailyAttendance";
import DatePicker, { registerLocale } from "react-datepicker";
import { id } from "date-fns/locale/id";
import "react-datepicker/dist/react-datepicker.css";
import { fetchAPI } from "../../utils/api";
import customData from "./customData.json";
import customUsers from "./customUser.json";
import {
  format,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
} from "date-fns";
import DailyDonutChart from "../../components/Chart/DailyDonutChart";
import StackedBarChart from "../../components/Chart/StackedBarChart";
import { formattedDateEnCa } from "../../utils/date";
import SimpleLineChart from "../../components/Chart/SimpleLineChart";

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
  const [jumlahHadir, setJumlahHadir] = useState(0);
  const [jumlahIzin, setJumlahIzin] = useState(0);
  const [jumlahSakit, setJumlahSakit] = useState(0);
  const [jumlahBelumAbsen, setJumlahBelumAbsen] = useState(0);
  const [jumlahAttendanceRecorded, setJumlahAttendanceRecorded] = useState(0);
  const [customRange, setCustomRange] = useState([null, null]);
  const [startDate, endDate] = customRange;
  const [activeFilter, setActiveFilter] = useState("daily");

  useEffect(() => {
    let dateToSend = selectedDate;
    let newFilterType = "daily";

    if (startDate && endDate) {
      newFilterType = "custom";
      dateToSend = [startDate, endDate];
    } else if (monthDate) {
      dateToSend = monthDate;
      newFilterType = "monthly";
    } else if (weekDate) {
      dateToSend = weekDate;
      newFilterType = "weekly";
    }

    setFilterType(newFilterType);

    let start, end;
    if (newFilterType === "custom") {
      start = startDate;
      end = endDate;
    } else if (newFilterType === "weekly") {
      start = startOfWeek(dateToSend, { weekStartsOn: 1 });
      end = endOfWeek(dateToSend, { weekStartsOn: 1 });
    } else if (newFilterType === "monthly") {
      start = startOfMonth(dateToSend);
      end = endOfMonth(dateToSend);
    } else {
      start = dateToSend;
      end = dateToSend;
    }

    // const startDate =
    //   newFilterType === "weekly"
    //     ? startOfWeek(dateToSend, { weekStartsOn: 1 })
    //     : newFilterType === "monthly"
    //     ? startOfMonth(dateToSend)
    //     : dateToSend;

    // const endDate =
    //   newFilterType === "weekly"
    //     ? endOfWeek(dateToSend, { weekStartsOn: 1 })
    //     : newFilterType === "monthly"
    //     ? endOfMonth(dateToSend)
    //     : dateToSend;

    setDays(
      eachDayOfInterval({
        start: start,
        end: end,
      })
    );

    const fetchData = async () => {
      try {
        setLoading(true);

        // const formattedDate = format(dateToSend, "yyyy-MM-dd");

        // new
        let formattedDate;
        if (newFilterType === "custom" && startDate && endDate) {
          formattedDate = `${format(startDate, "yyyy-MM-dd")},${format(
            endDate,
            "yyyy-MM-dd"
          )}`;
        } else {
          formattedDate = format(dateToSend, "yyyy-MM-dd");
        }
        const [attendanceRes, usersRes] = await Promise.all([
          fetchAPI(`/attendance?date=${formattedDate}&filter=${newFilterType}`),
          fetchAPI("/users"),
        ]);

        setAttendanceData(attendanceRes.data || []);
        setJumlahHadir(attendanceRes.hadir);
        setJumlahIzin(attendanceRes.izin);
        setJumlahSakit(attendanceRes.sakit);
        setJumlahAttendanceRecorded(attendanceRes.count);
        setJumlahBelumAbsen(usersRes.count - attendanceRes.count);

        setUsers(Array.isArray(usersRes?.data) ? usersRes?.data : []);

        // // Local Data
        // setUsers(customUsers);
        // setAttendanceData(customData);
      } catch (error) {
        setAttendanceData([]);
        setUsers([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [selectedDate, monthDate, weekDate, startDate, endDate]);

  function getStackedBarData(attendanceData, users, days) {
    // days: array of Date objects for the interval
    return days.map((day) => {
      const dateStr = formattedDateEnCa(day); // "YYYY-MM-DD" else rusak
      const label = format(day, "dd/MM");
      const recordsForDay = attendanceData.filter((a) => a.date === dateStr);

      let hadir = 0,
        izin = 0,
        sakit = 0;
      recordsForDay.forEach((rec) => {
        if (rec.status === "hadir") hadir++;
        else if (rec.status === "izin") izin++;
        else if (rec.status === "sakit") sakit++;
      });

      const alpha = users.length - (hadir + izin + sakit);

      return {
        name: label,
        hadir,
        izin,
        sakit,
        alpha: alpha < 0 ? 0 : alpha,
      };
    });
  }

  const stackedBarData = getStackedBarData(attendanceData, users, days);

  return (
    <LayoutAdmin>
      <div>
        <p className="font-semibold">Filter:</p>
        <div className="flex flex-col md:flex-row gap-4 mb-4">
          {activeFilter === "daily" && (
            <DatePicker
              className="react-datepicker-custom-style"
              selected={selectedDate}
              placeholderText="Pilih Tanggal"
              onChange={(date) => {
                setSelectedDate(date);
                setWeekDate(null);
                setMonthDate(null);
                setCustomRange([null, null]);
              }}
              dateFormat="dd MMM yyyy"
              locale="id"
            />
          )}
          {activeFilter === "weekly" && (
            <DatePicker
              className="react-datepicker-custom-style"
              showWeekPicker
              showWeekNumbers
              selected={weekDate}
              placeholderText="Pilih Minggu"
              onChange={(date) => {
                setWeekDate(date);
                setCustomRange([null, null]);
                setMonthDate(null);
                setSelectedDate(null);
              }}
              dateFormat="I yyyy"
              locale="id"
            />
          )}
          {activeFilter === "monthly" && (
            <DatePicker
              className="react-datepicker-custom-style"
              showMonthYearPicker
              selected={monthDate}
              placeholderText="Pilih Bulan"
              onChange={(date) => {
                setMonthDate(date);
                setCustomRange([null, null]);
                setWeekDate(null);
                setSelectedDate(null);
              }}
              dateFormat="MMMM yyyy"
              locale="id"
            />
          )}
          {activeFilter === "custom" && (
            <DatePicker
              className="react-datepicker-custom-style"
              selectsRange
              startDate={startDate}
              endDate={endDate}
              onChange={(date) => {
                setCustomRange(date);
                setSelectedDate(null);
                setMonthDate(null);
                setWeekDate(null);
              }}
              isClearable={true}
              dateFormat={"dd MMMM yyyy"}
              placeholderText="Pilih Rentang Tanggal"
            />
          )}
          <div className="w-full overflow-x-auto">
            <div className="flex w-full md:w-fit flex-auto justify-between">
              {["daily", "weekly", "monthly", "custom"].map(
                (type, idx, arr) => (
                  <button
                    key={type}
                    className={`flex-1 px-2 py-1 border focus:outline-none ${
                      activeFilter === type
                        ? "border-b-2 border-blue-500 text-blue-600 font-semibold bg-blue-50"
                        : "text-gray-500"
                    } ${idx === 0 ? "rounded-l-full" : ""} ${
                      idx === arr.length - 1 ? "rounded-r-full" : ""
                    }`}
                    onClick={() => setActiveFilter(type)}
                    type="button"
                  >
                    {type === "daily" && "Harian"}
                    {type === "weekly" && "Mingguan"}
                    {type === "monthly" && "Bulanan"}
                    {type === "custom" && "Custom"}
                  </button>
                )
              )}
            </div>
          </div>
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
      {filterType === "daily" ? (
        <DailyDonutChart
          data={[
            { name: "Hadir", value: jumlahHadir },
            { name: "Sakit", value: jumlahSakit },
            { name: "Izin", value: jumlahIzin },
            { name: "Belum Absen", value: jumlahBelumAbsen },
          ]}
        />
      ) : filterType === "custom" ? (
        <div className="w-full overflow-x-auto">
          <SimpleLineChart data={stackedBarData} />
        </div>
      ) : (
        <div className="w-full overflow-x-auto">
          <StackedBarChart
            data={stackedBarData}
            // Uncomment below to use local data
            // data={[
            //   { name: "2025-05-01", hadir: 10, izin: 2, sakit: 1, alpha: 3 },
            //   { name: "2025-05-02", hadir: 12, izin: 1, sakit: 0, alpha: 3 },
            // ]}
            // xAxisKey="name"
            // barDataKeys={["hadir", "izin", "sakit", "alpha"]}
            // colors={["#4ade80", "#facc15", "#f87171", "#a3a3a3"]}
          />
        </div>
      )}
    </LayoutAdmin>
  );
};

export default DashboardAdmin;
