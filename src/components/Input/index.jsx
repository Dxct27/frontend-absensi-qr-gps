import { forwardRef, useState } from "react";

const Input = forwardRef(
  (
    {
      style,
      readOnly = false,
      placeholder,
      onChange = () => {},
      icon,
      defaultValue = "",
      textSize = "",
      paddingY = "py-4",
      name,
      type,
      id,
      required,
    },
    ref
  ) => {
    const [inputValue, setInputValue] = useState(defaultValue);

    const handleChange = (e) => {
      setInputValue(e.target.value); // Update local state
      onChange(e); // Call the passed-in onChange function
    };

    return (
      <div className="relative items-center">
        {icon && (
          <span className="absolute inset-y-0 left-0 flex items-center pl-5">
            {icon}
          </span>
        )}
        <input
          value={inputValue}
          onChange={handleChange} 
          ref={ref}
          readOnly={readOnly}
          name={name}
          type={type}
          id={id}
          placeholder={placeholder}
          className={`${icon && "pl-12"} ${textSize} opacity-70 border-2 transform transition ease-in-out duration-100 rounded-full border-gray-100 focus:border-primary500 ${paddingY} px-3 w-full focus:outline-none`}
          required={required}
        />
      </div>
    );
  }
);

export default Input;
