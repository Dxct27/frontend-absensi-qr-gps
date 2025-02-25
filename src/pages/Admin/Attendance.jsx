import LayoutAdmin from "../../components/Layout/Admin";
import AttendanceHistoryTable from "../../components/AttendanceHistoryTable";

const Attendance = () => {
  return (
    <LayoutAdmin>
      <div className="">Absensi</div>
      <AttendanceHistoryTable />
    </LayoutAdmin>
  );
};

export default Attendance;
