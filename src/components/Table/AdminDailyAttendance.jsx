import { useMemo, useState } from "react";
import { useReactTable, getCoreRowModel } from "@tanstack/react-table";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";

const AdminDailyAttendanceTable = ({
  attendanceData,
  users,
  days,
  filterType,
}) => {
  const statusTypes = ["hadir", "izin", "sakit", "absen"];

  const statusColors = {
    hadir: "bg-green-200",
    izin: "bg-blue-200",
    sakit: "bg-purple-200",
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
      headers.push("Hadir", "Izin", "Sakit", "Absen");
    }

    worksheet.addRow(headers);

    const statusColors = {
      H: "FF90EE90", // Light Green for Hadir
      I: "FFADD8E6", // Light Blue for Izin
      S: "FFDDA0DD", // Plum for Sakit
      A: "FFFFA07A", // Light Red for Absen
    };

    mergedData.forEach((row) => {
      let rowData = [row.name, row.nip];

      days.forEach((day) => {
        const dateKey = day.toISOString().split("T")[0];
        let status = row.attendance[dateKey] || "-";
        let formattedStatus = status.charAt(0).toUpperCase();

        rowData.push(formattedStatus);
      });

      if (filterType !== "daily") {
        rowData.push(
          Object.values(row.attendance).filter((s) => s.includes("hadir"))
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
      const formattedDate = record.date;
      existing.attendance[formattedDate] = record.status || "-";
    });

    const today = new Date().toISOString().split("T")[0];

    return users
      .map((user) => {
        const attendance = attendanceMap.get(user.id)?.attendance || {};

        days.forEach((day) => {
          const dateKey = day.toISOString().split("T")[0];
          if (
            !attendance[dateKey] &&
            day.getDay() !== 0 &&
            day.getDay() !== 6 &&
            dateKey < today
          ) {
            attendance[dateKey] = "absen";
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
          const status = Object.values(row.original.attendance)[0] || "-";
          return (
            <div
              className={`px-2 py-1 text-xs rounded ${statusColors[status] || "bg-gray-100"}`}
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
            const dateKey = day.toISOString().split("T")[0];
            let status = row.original.attendance[dateKey] || "-";

            return (
              <div className="flex flex-wrap justify-center gap-1">
                {status.split(",").map((s, i) => {
                  let trimmedStatus = s.trim().toLowerCase();
                  let displayStatus =
                    trimmedStatus === "absen"
                      ? "A"
                      : trimmedStatus.charAt(0).toUpperCase();

                  return (
                    <div
                      key={i}
                      className={`px-2 py-1 text-xs rounded ${statusColors[trimmedStatus] || "bg-gray-100"}`}
                    >
                      {displayStatus}
                    </div>
                  );
                })}
              </div>
            );
          },
        }))
      );

      // Summary columns
      statusTypes.forEach((status) => {
        baseColumns.push({
          accessorKey: `summary_${status}`,
          header: status.charAt(0).toUpperCase(),
          cell: ({ row }) => {
            let count = 0;
            Object.entries(row.original.attendance).forEach(([dateKey, s]) => {
              const day = new Date(dateKey);
              const today = new Date().toISOString().split("T")[0];
              let adjustedStatus = s;
              if (
                s === "-" &&
                day.getDay() !== 0 &&
                day.getDay() !== 6 &&
                dateKey < today
              ) {
                adjustedStatus = "absen";
              }
              adjustedStatus.split(",").forEach((item) => {
                if (item.trim() === status) count++;
              });
            });

            return (
              <div
                className={`px-2 py-1 text-xs rounded ${statusColors[status] || "bg-gray-100"}`}
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
