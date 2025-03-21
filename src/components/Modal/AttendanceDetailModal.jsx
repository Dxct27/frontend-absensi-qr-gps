import Modal from "../Modal";

const AttendanceDetailModal = ({ isOpen, onClose, selectedDate }) => {
    
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Detail Absensi">
      <h1>LOREM IPSUM</h1>
      <div>{selectedDate}</div>
    </Modal>
  );
};

export default AttendanceDetailModal;
