import { useState } from "react";
import LayoutUser from "../../components/Layout/User";
import Dropdown from "../../components/Dropdown";
import DatePicker from "react-datepicker";
import InputLabeled from "../../components/InputLabeled";
const options = ["Izin", "Sakit", "Dinas Luar"];

const handleSelection = (selectedOptions) => {
  console.log("Selected : ", selectedOptions);
};

const LeavePermission = () => {
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(null);

  return (
    <LayoutUser>
      <div className="">
        <p>ijin</p>
        <Dropdown options={options} onSelect={handleSelection} />
        <p>Tanggal Awal</p>
        <DatePicker
        className="border px-2 py-1"
          showIcon
          selected={startDate}
          onChange={(date) => {
            setStartDate(date);
          }}
        />
        <p>Tanggal Akhir Opsional but kasih keterangan if I S D sekian hari expired</p>
        <DatePicker
        className="border px-2 py-1"
          showIcon
          placeholderText="dd/mm/yyyy"
          selected={endDate}
          onChange={(date) => {
            setEndDate(date);
          }}
        />
      </div>
    </LayoutUser>
  );
};

export default LeavePermission;
