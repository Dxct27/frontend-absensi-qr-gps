import { useState } from "react";
import DatePicker, { registerLocale } from "react-datepicker";
import { id } from "date-fns/locale/id";
import LayoutUser from "../../components/Layout/User";
import Dropdown from "../../components/Dropdown";
import InputLabeled from "../../components/InputLabeled";
import Label from "../../components/Label";
import RectangleButton from "../../components/RectangleButton";

registerLocale("id", id);

const options = ["Izin", "Sakit", "Dinas Luar"];

const handleSelection = (selectedOptions) => {
  console.log("Selected : ", selectedOptions);
};

const LeavePermission = () => {
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(null);

  return (
    <LayoutUser>
      <h2>Pengajuan Ijin baru</h2>
      <div className="md:grid md:grid-cols-2 gap-4">
        <div className="col-span-1">
          <Dropdown options={options} onSelect={handleSelection} />
          <div className="flex flex-col">
            <Label>Tanggal Awal</Label>
            <DatePicker
              className="border px-2 py-1"
              showIcon
              locale="id"
              dateFormat={"dd/MM/yyyy"}
              selected={startDate}
              onChange={(date) => {
                setStartDate(date);
              }}
            />
          </div>
          <div className="flex flex-col">
            <Label>
              Tanggal Akhir Opsional but kasih keterangan if I S D sekian hari
              expired
            </Label>
            <DatePicker
              className="border px-2 py-1"
              showIconlocale="id"
              dateFormat={"dd/MM/yyyy"}
              placeholderText="dd/mm/yyyy"
              selected={endDate}
              onChange={(date) => {
                setEndDate(date);
              }}
            />
          </div>
        </div>
        <div className="cols-span-1 flex flex-col gap-4">
          <InputLabeled label="Keterangan" />
          <Label>Lampiran</Label>
          <RectangleButton className="w-fit px-10">
            Pilih Lampiran
          </RectangleButton>
          <RectangleButton className="w-fit bg-blue-500 text-white border-2 border-black px-5">
            Simpan
          </RectangleButton>
        </div>
      </div>
    </LayoutUser>
  );
};

export default LeavePermission;
