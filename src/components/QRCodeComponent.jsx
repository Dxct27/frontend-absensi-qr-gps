import { useEffect, useState } from "react";
import QRCode from "react-qr-code";
import { fetchAPI } from "../utils/api";

const QRCodeComponent = ({ qrCodeId, refreshTrigger }) => {
  const [qrUrl, setQrUrl] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchQRCode = async () => {
      console.log("Fetching QR Code for ID:", qrCodeId);
      setLoading(true);
      setError(null);

      try {
        const data = await fetchAPI(`/qrcodes/${qrCodeId}`, "GET");
        console.log("API Response:", data);

        if (data?.url) {
          setQrUrl(data.url);
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
  }, [qrCodeId, refreshTrigger]);

  const fullQrUrl = `${window.location.origin}${qrUrl}`;

  return (
    <div className="bg-white p-5 rounded-lg shadow-lg">
      {loading ? (
        <p>Loading QR Code...</p>
      ) : error ? (
        <p className="text-red-500">{error}</p>
      ) : qrUrl ? (
        <div className="flex items-center justify-center">
          <QRCode size={256} value={fullQrUrl} />
        </div>
      ) : (
        <p className="text-red-500">QR Code not found!</p>
      )}
    </div>
  );
};

export default QRCodeComponent;
