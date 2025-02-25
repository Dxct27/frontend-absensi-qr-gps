import Card from "../../components/Card";
import DashboardTable from "../../components/DashboardTable";
import LayoutAdmin from "../../components/Layout/Admin";

const DashboardAdmin = () => {
  return (
    <>
      <LayoutAdmin>
          <div className="w-full flex flex-col md:justify-between md:flex-row py-2">
            <p>Absensi hari ini</p>
            <p>Jumlah Pegawai: $jumlah</p>
          </div>
          <div className="my-5 flex flex-col md:grid md:grid-cols-4 gap-4">
            <Card title={"Hadir"}/>
            <Card title={"Izin"}/>
            <Card title={"Sakit"}/>
            <Card title={"Tidak Hadir"}/>
          </div>
          <DashboardTable />
        </LayoutAdmin>
    </>
  );
};

export default DashboardAdmin;
