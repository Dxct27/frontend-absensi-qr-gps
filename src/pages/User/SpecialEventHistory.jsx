import { useContext } from "react";
import LayoutAdmin from "../../components/Layout/Admin";
import LayoutUser from "../../components/Layout/User";
import { AuthContext } from "../../context/AuthContext";
import SpecialEventHistoryTable from "../../components/Table/SpecialEventHistory";

const SpecialEventHistory = () => {
  const { user } = useContext(AuthContext);
  const Layout = user?.group === "admin" ? LayoutAdmin : LayoutUser;
  return (
    <div>
      <Layout>
        <h1 className="text-2xl font-bold mb-4">Riwayat Event</h1>
        <p className="text-gray-700">
          Halaman ini menampilkan riwayat event khusus yang telah dihadiri oleh
          pengguna.
        </p>
        <SpecialEventHistoryTable />
      </Layout>
    </div>
  );
};

export default SpecialEventHistory;
