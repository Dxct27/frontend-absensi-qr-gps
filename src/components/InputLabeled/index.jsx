import { forwardRef } from "react";
import Input from "../Input";
import Label from "../Label";

const InputLabeled = forwardRef(
  (
    {
      placeholder,
      readOnly,
      onChange,
      labelColor,
      textSize,
      icon,
      label,
      labelSize,
      name,
      type,
      id,
      required,
      value,
      paddingY,
    },
    ref
  ) => {
    
    // `ref` diambil dari parameter kedua
    return (
      <div className="w-full flex flex-col mb-2">
        <Label labelSize={labelSize} labelColor={labelColor}>
          {label}
        </Label>
        <Input
          readOnly={readOnly}
          onChange={onChange}
          value={value}
          textSize={textSize}
          paddingY={paddingY}
          ref={ref}
          name={name}
          placeholder={placeholder}
          type={type}
          id={id}
          required={required}
          icon={icon}
        />
      </div>
    );
  }
);

export default InputLabeled;
