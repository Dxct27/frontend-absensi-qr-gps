import { useState, useRef, useEffect } from "react";

const Dropdown = ({ options, onSelect }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selected, setSelected] = useState(null);
  const dropdownRef = useRef(null);

  const toggleDropdown = () => setIsOpen(!isOpen);

  const handleSelect = (option) => {
    setSelected(option);
    setIsOpen(false);
    if (onSelect) onSelect(option);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="flex flex-col space-y-2 relative" ref={dropdownRef}>
      <label className="text-gray-700 font-medium">Ini Label</label>

      <button
        onClick={toggleDropdown}
        className="px-4 py-2 border rounded-md hover:bg-blue-600 transition"
      >
        {selected || "Select an option"}
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-1 w-48 bg-white border rounded-md shadow-lg z-10">
          {options.map((option, index) => (
            <button
              key={index}
              onClick={() => handleSelect(option)}
              className="block w-full text-left px-4 py-2 hover:bg-gray-100"
            >
              {option}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default Dropdown;
