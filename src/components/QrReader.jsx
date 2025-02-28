import { useEffect, useRef, useState } from "react";
import QrScanner from "qr-scanner";

const QrReader = ({ onScan }) => {
  const scanner = useRef();
  const videoEl = useRef(null);
  const [qrOn, setQrOn] = useState(true);
  const [scannedResult, setScannedResult] = useState("");

  useEffect(() => {
    if (videoEl.current && !scanner.current) {
      scanner.current = new QrScanner(videoEl.current, (result) => {
        if (result?.data && !scannedResult) {
          setScannedResult(result.data);
          onScan(result.data);

          // Prevent immediate duplicate scans, allow new scan after 3s
          setTimeout(() => setScannedResult(""), 3000);
        }
      }, {
        preferredCamera: "environment",
        highlightScanRegion: true,
        highlightCodeOutline: true,
        maxScansPerSecond: 1,
      });

      scanner.current
        .start()
        .then(() => setQrOn(true))
        .catch((err) => {
          console.error("QR Scanner failed to start:", err);
          setQrOn(false);
        });
    }

    return () => {
      if (scanner.current) {
        scanner.current.stop();
        scanner.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (!qrOn) {
      alert("Camera is blocked or not accessible. Allow camera in browser settings and reload.");
    }
  }, [qrOn]);

  return (
    <div className="w-full h-full md:h-[50vh] py-5 md:p-0 md:my-15">
      <video className="w-full h-full object-cover" ref={videoEl}></video>
    </div>
  );
};

export default QrReader;
