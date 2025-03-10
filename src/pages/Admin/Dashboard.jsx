import { useState, useEffect } from "react";
import LayoutAdmin from "../../components/Layout/Admin";
import AttendanceHistoryTable from "../../components/Table/AttendanceHistory";
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

    // Determine the range of dates for the selected filter
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
        console.log(
          "Requesting:",
          `/attendance?date=${formattedDate}&filter=${newFilterType}`
        );

        const [attendanceRes, usersRes] = await Promise.all([
          fetchAPI(`/attendance?date=${formattedDate}&filter=${newFilterType}`),
          fetchAPI("/users"),
        ]);

        console.log("Fetched Attendance Data:", attendanceRes);
        console.log("Fetched Users Response:", usersRes);

        setAttendanceData(attendanceRes.data || []);
        setUsers(Array.isArray(usersRes) ? usersRes : []);
      } catch (error) {
        console.error("Error fetching data:", error);
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
            <p>Daily (Default)</p>
            <DatePicker
              className="border px-2 py-1"
              selected={selectedDate}
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
            <p>Per Week</p>
            <DatePicker
              className="border px-2 py-1"
              showWeekPicker
              showWeekNumbers
              selected={weekDate}
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
            <p>Per Month</p>
            <DatePicker
              className="border px-2 py-1"
              showMonthYearPicker
              selected={monthDate}
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
        {console.log("filter:", filterType)}
        {loading ? (
          <p>Loading attendance data...</p>
        ) : (
          <AttendanceHistoryTable
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
