import React from "react";
import Modal from "../Modal";

const QRCodeListModal = ({ isOpen, onClose, qrList, onSelectQR }) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Daftar QR Code">
      <div className="space-y-4">
        {qrList && qrList.length > 0 ? (
          <ul className="space-y-2">
            {qrList.map((qr, index) => (
              <li
                key={index}
                className="p-2 border rounded cursor-pointer hover:bg-gray-100"
                onClick={() => onSelectQR(qr)}
              >
                <p className="text-sm font-medium">QR Code ID: {qr.id}</p>
                <p className="text-sm text-gray-600">Data: {qr.data}</p>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-gray-600">Tidak ada QR Code tersedia.</p>
        )}
        <div className="mt-4 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
          >
            Tutup
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default QRCodeListModal;