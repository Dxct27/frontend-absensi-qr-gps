import Modal from "../Modal";

const ConfirmModal = ({
  isOpen,
  onClose,
  title,
  message,
  confirmText = "Ya",
  cancelText = "Tidak",
  onConfirm,
  size
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size={size}>
      <p className="mb-6">{message}</p>
      <div className="flex justify-end space-x-3">
        <button
          onClick={onClose}
          className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
        >
          {cancelText}
        </button>
        <button
          onClick={() => {
            onConfirm();
            onClose();
          }}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          {confirmText}
        </button>
      </div>
    </Modal>
  );
};

export default ConfirmModal;
