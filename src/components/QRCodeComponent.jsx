import QRCode from "react-qr-code";

const QRCodeComponent = () => {
    const value = "testing barcode";

  return (
    <div className="bg-white p-16">
      <QRCode
        size={256}
        style={{ height: "auto", maxWidth: "100%", width: "100%" }}
        value={value}
        viewBox={`0 0 256 256`}
      />
    </div>
  );
};
export default QRCodeComponent;
