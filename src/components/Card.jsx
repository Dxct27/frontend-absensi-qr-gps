const Card = ({ title, subTitle, sum }) => {
  const getColor = (title) => {
    switch (title) {
      case "Hadir":
        return "bg-green-500";
      case "Izin":
        return "bg-blue-500";
      case "Sakit":
        return "bg-yellow-500";
      case "Tidak Hadir":
        return "bg-red-500"; 
      default:
        return "bg-gray-500";
    }
  };

  const colorClass = getColor(title);

  return (
    <div className={`p-4 rounded-xl shadow-md ${colorClass}`}>
      <h3 className="text-lg font-semibold text-white">{title}</h3>
      <p className="text-white">{subTitle}</p>
      <p className="text-white">Jumlah: {sum}</p>
    </div>
  );
};

export default Card;
