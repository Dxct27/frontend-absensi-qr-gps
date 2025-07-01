import RectangleButton from "../RectangleButton";
import QRCodeComponent from "../QRCodeComponent";
import { IoCopyOutline, IoLinkOutline } from "react-icons/io5";

const QRCodeCard = ({
  qr,
  refreshTrigger,
  formatDateTime,
  copyToClipboard,
  openCloneModal,
}) => (
  <div className="border p-4 bg-white rounded-lg shadow">
    <h3 className="text-lg font-bold">{qr.name}</h3>
    <QRCodeComponent qrCodeId={qr.id} refreshTrigger={refreshTrigger} />
    <p className="text-sm text-gray-600">
      Lokasi:{" "}
      {qr.latitude == null || qr.longitude == null
        ? "Dinonaktifkan"
        : `${qr.latitude}, ${qr.longitude}`}
    </p>
    <p className="text-sm text-gray-600">
      Radius: {qr.radius == null ? "Dinonaktifkan" : `${qr.radius} meters`}
    </p>
    <p className="text-sm text-gray-600">
      Valid: {formatDateTime(qr.waktu_awal)} - {formatDateTime(qr.waktu_akhir)}
    </p>
    <div className="flex gap-2 mt-3">
      {/* <RectangleButton
        onClick={() => openEditModal(qr.id)}
        className="px-3 py-1 bg-blue-500 text-white rounded"
      >
        Edit
      </RectangleButton> */}
      <RectangleButton
        onClick={() => copyToClipboard(`${window.location.origin}${qr.url}`)}
        className="p-2 bg-blue-500 hover:bg-blue-400 text-white rounded"
      >
        <IoLinkOutline className="mr-2" />
        Salin Link QR
      </RectangleButton>
      <RectangleButton
        onClick={() => openCloneModal(qr)}
        className="p-2 bg-green-500 hover:bg-green-400 text-white rounded"
      >
        <IoCopyOutline className="mr-2" />
        Duplikat QR
      </RectangleButton>
      {/* <button
        onClick={() => openConfirmDelete(qr.id)}
        className="px-3 py-1 bg-red-500 text-white rounded"
      >
        Delete
      </button> */}
    </div>
  </div>
);

export default QRCodeCard;
