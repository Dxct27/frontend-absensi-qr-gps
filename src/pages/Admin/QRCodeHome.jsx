import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import LayoutAdmin from "../../components/Layout/Admin";
import RectangleButton from "../../components/RectangleButton";
import QRCodeComponent from "../../components/QRCodeComponent";
import axios from "axios";

const API_URL = import.meta.env.VITE_BASE_URL_API;

const QRCodePage = () => {
  const [qrCodes, setQrCodes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchQRCodes = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(`${API_URL}/qrcodes`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        // Sort from latest to oldest (assuming response.data is an array of objects with a 'created_at' field)
        const sortedQRCodes = response.data.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        setQrCodes(sortedQRCodes);
      } catch (err) {
        setError("Failed to fetch QR codes");
      }
      setLoading(false);
    };

    fetchQRCodes();
  }, []);

  return (
    <LayoutAdmin>
      <div className="flex justify-between items-center mb-5">
        <h2 className="text-2xl font-bold">QR Codes</h2>
        <Link to="/qrcodecreate">
          <RectangleButton>Buat kode QR baru</RectangleButton>
        </Link>
      </div>

      {loading && <p>Loading...</p>}
      {error && <p className="text-red-500">{error}</p>}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {qrCodes.length > 0 ? (
          qrCodes.map((qr) => (
            <div key={qr.id} className="border p-4 bg-white rounded-lg shadow">
              <h3 className="text-lg font-bold">{qr.name}</h3>
              <QRCodeComponent qrCodeId={qr.id} />
              <p className="text-sm text-gray-600">Radius: {qr.radius} meters</p>
              <p className="text-sm text-gray-600">
                Valid: {qr.waktu_awal} - {qr.waktu_akhir}
              </p>
            </div>
          ))
        ) : (
          <p>No QR Codes found.</p>
        )}
      </div>
    </LayoutAdmin>
  );
};

export default QRCodePage;
