import { useEffect, useState } from "react";
import QRCode from "react-qr-code";
import axios from "axios";

const API_URL = import.meta.env.VITE_BASE_URL_API;

const QRCodeComponent = ({ qrCodeId }) => {
  const [qrValue, setQrValue] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchQRCode = async () => {
      try {
        console.log("Fetching QR Code for ID:", qrCodeId);
        const response = await axios.get(`${API_URL}/qrcodes/${qrCodeId}`);
        console.log("API Response:", response.data);
        setQrValue(response.data.value);
      } catch (error) {
        console.error("Error fetching QR code:", error);
        setError("Failed to load QR code");
      } finally {
        setLoading(false);
      }
    };

    if (qrCodeId) {
      fetchQRCode();
    }
  }, [qrCodeId]);

  return (
    <div className="bg-white p-5 rounded-lg shadow-lg">
      {loading ? (
        <p>Loading QR Code...</p>
      ) : error ? (
        <p className="text-red-500">{error}</p>
      ) : qrValue ? (
        <>
          <div className="items-center justify-center">
            <QRCode className="container" size={256} value={qrValue} />
          </div>
        </>
      ) : (
        <p className="text-red-500">QR Code not found!</p>
      )}
    </div>
  );
};

export default QRCodeComponent;
