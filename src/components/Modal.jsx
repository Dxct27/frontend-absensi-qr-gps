import { useEffect, useRef } from "react";
import { IoClose } from "react-icons/io5";

const Modal = ({ isOpen, onClose, title, children, sizeClasses = "max-w-md" }) => {
  const modalRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // const sizeClasses = {
  //   sm: "max-w-sm",
  //   md: "max-w-md",
  //   lg: "max-w-lg",
  //   xl: "max-w-2xl",
  // };

  return (
    <div
      className="fixed inset-0 flex items-center justify-center backdrop-blur-sm bg-black/30 px-4"
      style={{ zIndex: 1001 }}
    >
      <div
        ref={modalRef}
        className={`relative bg-white rounded-lg shadow-lg w-full ${sizeClasses} max-h-[90vh] overflow-y-auto flex flex-col`}
        style={{ zIndex: 1002 }}
      >
        <div className="sticky top-0 z-1001 bg-inherit flex justify-between items-center p-4 border-b">
          <h2 className="text-lg font-semibold">{title}</h2>
          <button
            onClick={onClose}
            className="text-gray-600 hover:text-black text-2xl"
          >
            <IoClose />
          </button>
        </div>

        <div className="p-4">{children}</div>

      </div>
    </div>
  );
};

export default Modal;
