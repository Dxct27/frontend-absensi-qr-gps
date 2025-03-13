import React, { useMemo } from "react";
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
} from "@tanstack/react-table";

const statusColors = {
  hadir: "bg-green-200",
  terlambat: "bg-yellow-200",
  izin: "bg-blue-200",
  sakit: "bg-purple-200",
  A: "bg-red-200",
  empty: "bg-gray-100",
};

const daysOfWeek = ["S", "S", "R", "K", "J", "S", "M"];

const UserDailyAttendanceTable = ({ selectedDate, attendanceData }) => {
  console.log("Rendering UserDailyAttendanceTable with data:", attendanceData);

  const tableData = useMemo(() => {
    const firstDay = new Date(
      selectedDate.getFullYear(),
      selectedDate.getMonth(),
      1
    );
    const lastDay = new Date(
      selectedDate.getFullYear(),
      selectedDate.getMonth() + 1,
      0
    );
    let currentWeek = [];
    const weeks = [];

    let startDay = firstDay.getDay();
    startDay = startDay === 0 ? 6 : startDay - 1;

    for (let i = 0; i < startDay; i++) {
      currentWeek.push({ date: "", statuses: [""] });
    }

    for (let day = 1; day <= lastDay.getDate(); day++) {
      const dateStr = `${selectedDate.getFullYear()}-${(
        selectedDate.getMonth() + 1
      )
        .toString()
        .padStart(2, "0")}-${day.toString().padStart(2, "0")}`;

      const attendance = attendanceData.filter((a) => a.date === dateStr);

      const today = new Date().toISOString().split("T")[0];

      const dayObj = new Date(dateStr);
      const isWeekday = dayObj.getDay() !== 0 && dayObj.getDay() !== 6;
      const isPast = dayObj < new Date(today);

      const statuses =
        attendance.length > 0
          ? attendance.map((a) => a.status)
          : isWeekday && isPast
            ? ["A"]
            : ["-"];

      currentWeek.push({ date: dateStr, statuses });

      if (currentWeek.length === 7) {
        weeks.push([...currentWeek]);
        currentWeek = [];
      }
    }

    while (currentWeek.length < 7) {
      currentWeek.push({ date: "", statuses: [""] });
    }
    weeks.push(currentWeek);

    return weeks;
  }, [selectedDate, attendanceData]);

  const columns = useMemo(
    () =>
      daysOfWeek.map((day, index) => ({
        accessorKey: index.toString(),
        header: (
          <span
            className={`font-bold ${
              index === 5 || index === 6
                ? "text-red-500"
                : index === 4
                  ? "text-green-500"
                  : "text-gray-700"
            }`}
          >
            {day}
          </span>
        ),
        cell: ({ getValue }) => {
          const cellData = getValue();
          let textColor = "";
          let bgColor = cellData.date ? "bg-gray-200" : "";

          if (cellData.date) {
            if (index === 5 || index === 6) textColor = "text-red-500";
            else if (index === 4) textColor = "text-green-500";
          }

          return (
            <div className={`p-2 text-center flex flex-col ${bgColor}`}>
              {cellData.date && (
                <div className={`font-bold ${textColor}`}>
                  {new Date(cellData.date).getDate()}
                </div>
              )}
              <div className="flex flex-wrap justify-center gap-1">
                {cellData.statuses.map((status, i) => (
                  <div
                    key={i}
                    className={`px-2 py-1 text-xs rounded ${
                      statusColors[status]
                    }`}
                  >
                    {status.charAt(0).toUpperCase()}
                  </div>
                ))}
              </div>
            </div>
          );
        },
      })),
    []
  );

  const table = useReactTable({
    data: tableData,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="bg-white rounded-md mb-6">
      <h2 className="text-lg font-semibold mb-2">Data Absensi</h2>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse border border-gray-300">
          <thead className="bg-gray-100">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id} className="border-b">
                {headerGroup.headers.map((header) => (
                  <th key={header.id} className="p-2 border text-center">
                    {flexRender(
                      header.column.columnDef.header,
                      header.getContext()
                    )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.map((row) => (
              <tr key={row.id} className="border-b hover:bg-gray-50">
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id} className="border">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UserDailyAttendanceTable;
