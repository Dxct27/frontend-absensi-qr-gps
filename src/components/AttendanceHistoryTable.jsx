import { useState, useEffect } from "react";
import DatePicker, { registerLocale } from "react-datepicker";
import { id } from "date-fns/locale/id";
import "react-datepicker/dist/react-datepicker.css";
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  createColumnHelper,
} from "@tanstack/react-table";
import {
  format,
  startOfWeek,
  addDays,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isWeekend,
} from "date-fns";

registerLocale("id", id);

const columnHelper = createColumnHelper();

const AttendanceHistoryTable = () => {
  const [monthDate, setMonthDate] = useState(null);
  const [weekDate, setWeekDate] = useState(null);
  const [days, setDays] = useState([]);

  const data = Array.from({ length: 5 }, (_, i) => ({
    nip: `100000${i}`,
    name: `John Doe ${i}`,
    attendance: {},
  }));

  useEffect(() => {
    if (monthDate) {
      const start = startOfMonth(monthDate);
      const end = endOfMonth(monthDate);
      setDays(eachDayOfInterval({ start, end }));
    } else if (weekDate) {
      const start = startOfWeek(weekDate, { weekStartsOn: 1 }); 
      setDays(Array.from({ length: 7 }, (_, i) => addDays(start, i)));
    } else {
      setDays([]);
    }
  }, [monthDate, weekDate]);

  const columns = [
    columnHelper.accessor("nip", {
      header: "NIP",
      cell: (info) => info.getValue(),
    }),
    columnHelper.accessor("name", {
      header: "Name",
      cell: (info) => info.getValue(),
    }),
    ...days.map((day) =>
      columnHelper.accessor((row) => row.attendance[format(day, "yyyy-MM-dd")], {
        id: format(day, "yyyy-MM-dd"),
        header: () => (
          <span className={isWeekend(day) ? "text-red-500 font-bold" : ""}>
            {format(day, "dd MMM")}
          </span>
        ),
        cell: () => ["✓", "✗", "S", "E", "L"][Math.floor(Math.random() * 5)],
      })
    ),
  ];

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="p-4">
      <p className="font-semibold">Filter :</p>
      <div className="flex flex-col md:flex-row gap-2 mb-4">
        <div>
          <p>Per Month</p>
          <DatePicker
            className="border px-2 py-1"
            showMonthYearPicker
            selected={monthDate}
            onChange={(date) => {
              setMonthDate(date);
              setWeekDate(null);
            }}
            dateFormat="MMMM yyyy"
            locale="id"
          />
        </div>
        <div>
          <p>Per Week</p>
          <DatePicker
            className="border px-2 py-1"
            showWeekPicker
            showWeekNumbers
            selected={weekDate}
            onChange={(date) => {
              setWeekDate(date);
              setMonthDate(null);
            }}
            dateFormat="I R"
            locale="id"
          />
        </div>
      </div>

      {days.length > 0 && (
        <div className="overflow-x-auto">
          <table className="table-auto border-collapse border border-gray-400 w-full">
            <thead>
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id} className="bg-gray-200">
                  {headerGroup.headers.map((header) => (
                    <th
                      key={header.id}
                      className={`border border-gray-400 px-4 py-2 ${
                        isWeekend(new Date(header.id)) ? "bg-red-200" : ""
                      }`}
                    >
                      {flexRender(header.column.columnDef.header, header.getContext())}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody>
              {table.getRowModel().rows.map((row) => (
                <tr key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <td
                      key={cell.id}
                      className={`border border-gray-400 px-4 py-2 text-center ${
                        isWeekend(new Date(cell.column.id)) ? "bg-red-100" : ""
                      }`}
                    >
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AttendanceHistoryTable;
