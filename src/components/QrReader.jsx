import { useEffect, useRef, useState } from "react";
import "./QrStyles.css";
import QrScanner from "qr-scanner";

const QrReader = () => {
  const scanner = useRef();
  const videoEl = useRef(null);
  const qrBoxEl = useRef(null);
  const [qrOn, setQrOn] = useState(true);
  const [scannedResult, setScannedResult] = useState("");

  const onScanSuccess = (result) => {
    console.log(result);
    setScannedResult(result?.data);
  };

  //   debugging purpose
  const onScanFail = (err) => {
    console.error("QR Scan failed:", err);
  };

  useEffect(() => {
    if (videoEl?.current && !scanner.current) {
      scanner.current = new QrScanner(videoEl?.current, onScanSuccess, {
        // onDecodeError: onScanFail,
        preferredCamera: "environment",
        highlightScanRegion: true,
        highlightCodeOutline: true,
        maxScansPerSecond: 10,
      });

      scanner?.current
        ?.start()
        .then(() => setQrOn(true))
        .catch((err) => {
          console.error("QR Scanner failed to start:", err);
          setQrOn(false);
        });
    }

    return () => {
      if (scanner?.current) {
        scanner?.current?.stop();
        scanner.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (!qrOn) {
      alert(
        "Camera is blocked or not accessible. Please allow camera in your browser permissions and reload."
      );
    }
  }, [qrOn]);

  return (
      <div className="w-full h-full md:h-[50vh] py-5 md:p-0 md:my-15">
        <video className="w-full h-full object-cover" ref={videoEl}></video>
        <div ref={qrBoxEl} className="w-full">
          {/* <img src={QrFrame} alt="Qr Frame" width={256} height={256} className="qr-frame" /> */}
        </div>
        {scannedResult && (
          <p
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              zIndex: 99999,
              color: "white",
            }}
          >
            Scanned Result: {scannedResult}
          </p>
        )}
      </div>
    
  );
};

export default QrReader;
