import QRCodeComponent from "../../components/QRCodeComponent";
import LayoutAdmin from "../../components/Layout/Admin";
import InputLabeled from "../../components/InputLabeled";
import LeafletAdmin from "../../components/Leaflet/Admin";
import RectangleButton from "../../components/RectangleButton";
const QRCodeCreate = () => {
  return (
    <>
      <LayoutAdmin>
        <div className="flex flex-col py-5">
          <div className="md:grid md:grid-cols-2 gap-5">
            <InputLabeled
              label="Nama Kode QR"
              Placeholder="Nama QR Code"
              name="QR"
              type="text"
              id="QR"
            />
            <InputLabeled
              label="Radius valid absen"
              Placeholder="Radius"
              name="Radius"
              type="text"
              id="Radius"
            />
            <InputLabeled
              label="Waktu Mulai"
              Placeholder="Waktu Mulai"
              name="Waktu Mulai"
              type="time"
              id="waktuMulai"
            />
            <InputLabeled
              label="Waktu Akhir"
              Placeholder="Waktu Akhir"
              name="Waktu Akhir"
              type="time"
              id="waktuAkhir"
            />
          </div>
          <LeafletAdmin/>
          <RectangleButton>Buat Kode QR</RectangleButton>
        </div>
      </LayoutAdmin>
      {/* <QRCodeComponent></QRCodeComponent> */}
    </>
  );
};
export default QRCodeCreate;
