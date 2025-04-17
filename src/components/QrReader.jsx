import { useEffect, useRef, useState } from "react";
import QrScanner from "qr-scanner";
import { toast } from "react-toastify";

const QrReader = ({ onScan, loading }) => {
  const scanner = useRef();
  const videoEl = useRef(null);
  const [qrOn, setQrOn] = useState(true);
  const [scannedResult, setScannedResult] = useState("");

  useEffect(() => {
    if (videoEl.current && !scanner.current) {
      scanner.current = new QrScanner(
        videoEl.current,
        (result) => {
          if (loading || (result?.data === scannedResult && scannedResult !== "")) return; 

          setScannedResult(result.data);
          onScan(result.data);

          setTimeout(() => setScannedResult(""), 3000);
        },
        {
          preferredCamera: "environment",
          highlightScanRegion: true,
          highlightCodeOutline: true,
          maxScansPerSecond: 1,
        }
      );

      scanner.current
        .start()
        .then(() => setQrOn(true))
        .catch((err) => {
          ("QR Scanner failed to start:", err);
          setQrOn(false);
        });
    }

    return () => {
      if (scanner.current) {
        scanner.current.stop();
        scanner.current = null;
      }
    };
  }, [loading]);

  useEffect(() => {
    if (!qrOn) {
      toast.error("Camera is blocked or not accessible. Allow camera in browser settings and reload.");
    }
  }, [qrOn]);

  return (
    <div className="relative w-full h-full md:h-[50vh] py-5 md:p-0 md:my-15">
      <video className="w-full h-full object-cover" ref={videoEl}></video>

      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="w-10 h-10 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}
    </div>
  );
};

export default QrReader;
