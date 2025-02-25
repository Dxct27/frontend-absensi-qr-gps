import React from "react";

export default function OvalButton({
  children,
  style,
  className,
  onClick = () => {},
  rounded = "rounded-full",
  type = "button",
}) {
  return (
    <button
      style={style}
      onClick={onClick}
      className={`${className} w-full text-base flex items-center justify-center md:text-base py-3 border ${rounded}  ease-in-out duration-200 transform hover:shadow-none`}
      type={type}
    >
      {children}
    </button>
  );
}
