import Modal from "../Modal";
import QRCodeComponent from "../QRCodeComponent";

const QRCodeModal = ({ isOpen, onClose, qrCodeId }) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="QR Code">
      <div className="flex flex-col items-center justify-center p-5">
        {qrCodeId ? (
          <div className="flex justify-center">
            <QRCodeComponent qrCodeId={qrCodeId} />
          </div>
        ) : (
          <p className="text-gray-500">No QR Code selected</p>
        )}
      </div>
    </Modal>
  );
};

export default QRCodeModal;
