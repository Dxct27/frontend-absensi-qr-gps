const Label = ({ children, labelSize = "text-md", labelColor = "text-slate-600" }) => {
    return <label className={`${labelSize} ${labelColor} font-semibold  pb-3`}>{children}</label>;
  };
  
  export default Label;
  