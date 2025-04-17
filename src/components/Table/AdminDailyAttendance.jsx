import { useMemo, useState } from "react";
import { useReactTable, getCoreRowModel } from "@tanstack/react-table";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import AttendanceDetailModal from "../Modal/AttendanceDetailModal";

const AdminDailyAttendanceTable = ({
  attendanceData,
  users,
  days,
  filterType,
}) => {
  const [selectedAttendanceData, setSelectedAttendanceData] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleDateClick = (date, selectedAttendanceData) => {
    setSelectedAttendanceData(selectedAttendanceData);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedAttendanceData(null);
  };

  const statusTypes = ["hadir", "dinas luar", "izin", "sakit", "absen"];

  const statusColors = {
    hadir: "bg-green-200",
    "dinas luar": "bg-blue-200",
    izin: "bg-purple-200",
    sakit: "bg-yellow-200",
    absen: "bg-red-200",
    empty: "bg-gray-100",
  };

  const exportToExcel = async () => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Attendance");

    let headers = [
      "Name",
      "NIP",
      ...days.map((day) => day.toISOString().split("T")[0]),
    ];
    if (filterType !== "daily") {
      headers.push("Hadir", "Dinas Luar", "Izin", "Sakit", "Absen");
    }
    worksheet.addRow(headers);

    const statusColors = {
      H: "FF90EE90",
      D: "FF87CEEB",
      I: "FFADD8E6",
      S: "FFDDA0DD",
      A: "FFFFA07A",
    };

    mergedData.forEach((row) => {
      let rowData = [row.name, row.nip];

      days.forEach((day) => {
        const dateKey = day.toISOString().split("T")[0];
        let status = row.attendance[dateKey] || "-";

        let formattedStatus = status
          .split(",")
          .map((s) =>
            s.trim() === "dinas luar" ? "D" : s.trim().charAt(0).toUpperCase()
          )
          .join(",");

        rowData.push(formattedStatus);
      });

      if (filterType !== "daily") {
        rowData.push(
          Object.values(row.attendance).filter((s) => s.includes("hadir"))
            .length,
          Object.values(row.attendance).filter((s) => s.includes("dinas luar"))
            .length,
          Object.values(row.attendance).filter((s) => s.includes("izin"))
            .length,
          Object.values(row.attendance).filter((s) => s.includes("sakit"))
            .length,
          Object.values(row.attendance).filter((s) => s.includes("absen"))
            .length
        );
      }

      let excelRow = worksheet.addRow(rowData);

      excelRow.eachCell((cell, colNumber) => {
        if (colNumber > 2) {
          let cellStatus = cell.value;
          if (statusColors[cellStatus]) {
            cell.fill = {
              type: "pattern",
              pattern: "solid",
              fgColor: { argb: statusColors[cellStatus] },
            };
          }
        }
      });
    });

    worksheet.columns.forEach((column) => {
      column.width = 15;
    });

    const dateString =
      filterType === "daily"
        ? days[0].toISOString().split("T")[0]
        : `${days[0].toISOString().split("T")[0]}_to_${
            days[days.length - 1].toISOString().split("T")[0]
          }`;

    const fileName = `Data Absen ${filterType} ${dateString}.xlsx`;

    const buffer = await workbook.xlsx.writeBuffer();
    saveAs(new Blob([buffer]), fileName);
  };

  const mergedData = useMemo(() => {
    const attendanceMap = new Map();

    attendanceData.forEach((record) => {
      if (!record.user) return;

      if (!attendanceMap.has(record.user.id)) {
        attendanceMap.set(record.user.id, { ...record.user, attendance: {} });
      }

      const existing = attendanceMap.get(record.user.id);
      const formattedDate = new Date(record.date).toISOString().split("T")[0];
      
      existing.attendance[formattedDate] = {
        status: record.status || "-",
        fullDetails: record,
      };return
    });

    const today = new Date().toISOString().split("T")[0];

    return users
      .map((user) => {
        const attendance = attendanceMap.get(user.id)?.attendance || {};

        days.forEach((day) => {
          const dateKey = day.toLocaleDateString("en-CA"); 
          
          if (
            !attendance[dateKey] &&
            day.getDay() !== 0 &&
            day.getDay() !== 6 &&
            dateKey < today
          ) {
            attendance[dateKey] = {
              status: "absen",
              fullDetails: null,
            };
          }
        });

        return {
          id: user.id,
          name: user.name,
          nip: user.nip,
          attendance,
        };
      })
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [attendanceData, users, days]);

  const columns = useMemo(() => {
    let baseColumns = [
      { accessorKey: "name", header: "Nama" },
      { accessorKey: "nip", header: "NIP" },
    ];

    if (filterType === "daily") {
      baseColumns.push({
        accessorKey: "attendance",
        header: "Status",
        cell: ({ row }) => {
          const attendanceRecord =
            Object.values(row.original.attendance)[0] || {};
          const status = attendanceRecord.status || "-";

          return (
            <div
              className={`px-2 py-1 text-xs rounded ${
                statusColors[status] || "bg-gray-100"
              }`}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </div>
          );
        },
      });
    } else {
      baseColumns.push(
        ...days.map((day) => ({
          accessorKey: day.toISOString().split("T")[0],
          header: (
            <span
              className={`font-bold ${
                day.getDay() === 0 || day.getDay() === 6
                  ? "text-red-500"
                  : day.getDay() === 5
                  ? "text-green-500"
                  : "text-gray-700"
              }`}
            >
              {day.toLocaleDateString("id-ID", {
                day: "2-digit",
                month: "short",
              })}
            </span>
          ),
          cell: ({ row }) => {
            const dateKey = day.toLocaleDateString("en-CA");
            const attendanceRecord = row.original.attendance[dateKey] || {};
            const status = attendanceRecord.status || "-";

            return (
              <div
                className="flex flex-wrap justify-center gap-1 cursor-pointer"
                onClick={() =>
                  handleDateClick(dateKey, attendanceRecord.fullDetails)
                }
              >
                <div
                  className={`px-2 py-1 text-xs rounded ${
                    statusColors[status] || "bg-gray-100"
                  }`}
                >
                  {status === "absen" ? "A" : status.charAt(0).toUpperCase()}
                </div>
              </div>
            );
          },
        }))
      );
      
      statusTypes.forEach((status) => {
        baseColumns.push({
          accessorKey: `summary_${status}`,
          header: status.charAt(0).toUpperCase(),
          cell: ({ row }) => {
            let count = 0;

            Object.values(row.original.attendance).forEach(({ status: s }) => {
              if (s && s.split(",").some((item) => item.trim() === status))
                count++;
            });

            return (
              <div
                className={`px-2 py-1 text-xs rounded ${
                  statusColors[status] || "bg-gray-100"
                }`}
              >
                {count}
              </div>
            );
          },
        });
      });
    }

    return baseColumns;
  }, [days, filterType, attendanceData]);

  const pageSize = 15;
  const [pageIndex, setPageIndex] = useState(0);
  const totalPages = Math.ceil(mergedData.length / pageSize);

  const paginatedData = useMemo(() => {
    return mergedData.slice(pageIndex * pageSize, (pageIndex + 1) * pageSize);
  }, [mergedData, pageIndex, pageSize]);

  const table = useReactTable({
    data: paginatedData,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="w-full overflow-auto">
      <AttendanceDetailModal
        isOpen={isModalOpen}
        onClose={closeModal}
        attendanceData={selectedAttendanceData}
      />
      <button
        onClick={exportToExcel}
        className="mb-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
      >
        Export to Excel
      </button>
      <table className="w-full border-collapse border whitespace-nowrap border-gray-300">
        <thead>
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <th key={header.id} className="border p-2">
                  {header.column.columnDef.header}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody>
          {table.getRowModel().rows.map((row) => (
            <tr key={row.id}>
              {row.getVisibleCells().map((cell) => (
                <td key={cell.id} className="border p-2">
                  {cell.column.columnDef.cell
                    ? cell.column.columnDef.cell(cell.getContext())
                    : cell.getValue()}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>

      <div className="flex justify-between items-center mt-4">
        <button
          onClick={() => setPageIndex((prev) => Math.max(prev - 1, 0))}
          disabled={pageIndex === 0}
          className="px-3 py-1 border rounded disabled:opacity-50"
        >
          Previous
        </button>
        <span>
          Page {pageIndex + 1} of {totalPages}
        </span>
        <button
          onClick={() =>
            setPageIndex((prev) => Math.min(prev + 1, totalPages - 1))
          }
          disabled={pageIndex === totalPages - 1}
          className="px-3 py-1 border rounded disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default AdminDailyAttendanceTable;
