import LayoutAdmin from "../../components/Layout/Admin";
import QRCodeListTable from "../../components/Table/AdminQRCodeList";

const QRCodeList = () => {
  return (
    <LayoutAdmin>
      <h2 className="text-2xl font-bold mb-5">All QR Codes</h2>
      <QRCodeListTable />
    </LayoutAdmin>
  );
};

export default QRCodeList;
