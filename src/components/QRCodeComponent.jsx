import { useEffect, useState } from "react";
import QRCode from "react-qr-code";
import { fetchAPI } from "../utils/api";

const QRCodeComponent = ({ qrCodeId }) => {
  const [qrValue, setQrValue] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchQRCode = async () => {
      console.log("Fetching QR Code for ID:", qrCodeId);

      try {
        const data = await fetchAPI(`/qrcodes/${qrCodeId}`, "GET" );
        console.log("API Response:", data);

        if (data?.value) {
          setQrValue(data.value);
        } else {
          setError(data.message || "QR Code not found!");
        }
      } catch (err) {
        console.error("Error fetching QR code:", err);
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
        <div className="flex items-center justify-center">
          <QRCode size={256} value={qrValue} />
        </div>
      ) : (
        <p className="text-red-500">QR Code not found!</p>
      )}
    </div>
  );
};

export default QRCodeComponent;
