import LayoutUser from "../../components/Layout/User";
import QrReader from "../../components/QrReader";
import LeafletUser from "../../components/Leaflet/User";
import RectangleButton from "../../components/RectangleButton";
import { Link } from "react-router-dom";
const DashboardUser = () => {
  return (
    <>
      <LayoutUser>
        <div className="flex justify-between">
          <div>Halo $User</div>
          <div>Tanggal?</div>
        </div>
        <div className="flex flex-col md:grid md:grid-cols-3">
          <div className="col-span-1 flex flex-col px-5 gap-2">
            <QrReader />
            <Link to="/leavePermission">
              <RectangleButton>Ajukan Ijin</RectangleButton>
            </Link>
            <Link to="/attendanceHistory">
              <RectangleButton>Riwayat Absen</RectangleButton>
            </Link>
          </div>
          <div className="col-span-2 px-5">
            <LeafletUser />
          </div>
        </div>
      </LayoutUser>
    </>
  );
};

export default DashboardUser;
