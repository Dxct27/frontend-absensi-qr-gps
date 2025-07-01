import { useMemo, useState } from "react";
import { useReactTable, getCoreRowModel } from "@tanstack/react-table";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import AttendanceDetailModal from "../Modal/AttendanceDetailModal";
import { formattedDate, formattedDateEnCa } from "../../utils/date";
import { IoExitOutline } from "react-icons/io5";
import RectangleButton from "../RectangleButton";

const AdminDailyAttendanceTable = ({
  attendanceData,
  users,
  days,
  filterType,
}) => {
  const [selectedAttendanceData, setSelectedAttendanceData] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const handleAttendanceDetailModal = (selectedAttendanceData) => {
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

  const hoverColor = {
    hadir: "hover:bg-green-300",
    "dinas luar": "hover:bg-blue-300",
    izin: "hover:bg-purple-300",
    sakit: "hover:bg-yellow-300",
    absen: "hover:bg-red-300",
    empty: "hover:bg-gray-200",
  };

  const exportToExcel = async () => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Attendance");

    let headers = ["Name", "NIP", ...days.map((day) => formattedDate(day))];
    if (filterType !== "daily") {
      headers.push("Hadir", "Dinas Luar", "Izin", "Sakit", "Absen");
    }
    worksheet.addRow(headers);

    const statusColors = {
      H: "FF90EE90",
      D: "FF87CEEB",
      I: "FFDDA0DD",
      S: "FFADD8E6",
      A: "FFFFA07A",
    };

    // Iterate over merged data
    mergedData.forEach((row) => {
      let rowData = [row.name, row.nip];

      days.forEach((day) => {
        const dateKey = formattedDate(day);
        let status = row.attendance[dateKey]?.status || "-";

        // Ensure status is a string before splitting
        let formattedStatus =
          typeof status === "string"
            ? status
                .split(",")
                .map((s) =>
                  s.trim() === "dinas luar"
                    ? "D"
                    : s.trim().charAt(0).toUpperCase()
                )
                .join(",")
            : "-";

        rowData.push(formattedStatus);
      });

      if (filterType !== "daily") {
        rowData.push(
          Object.values(row.attendance).filter((s) =>
            s.status?.includes("hadir")
          ).length,
          Object.values(row.attendance).filter((s) =>
            s.status?.includes("dinas luar")
          ).length,
          Object.values(row.attendance).filter((s) =>
            s.status?.includes("izin")
          ).length,
          Object.values(row.attendance).filter((s) =>
            s.status?.includes("sakit")
          ).length,
          Object.values(row.attendance).filter((s) =>
            s.status?.includes("absen")
          ).length
        );
      }

      let excelRow = worksheet.addRow(rowData);

      // Apply colors to cells
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

    // Adjust column widths
    worksheet.columns.forEach((column) => {
      column.width = 15;
    });

    // Generate file name
    const dateString =
      filterType === "daily"
        ? formattedDate(days[0])
        : `${formattedDate(days[0])}_to_${formattedDate(
            days[days.length - 1]
          )}`;

    const fileName = `Data Absen ${filterType} ${dateString}.xlsx`;

    // Save the file
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

      existing.attendance[formattedDate(new Date(record.date))] = {
        status: record.status || "-",
        fullDetails: record,
      };
      return;
    });

    const today = formattedDateEnCa(new Date());

    return users
      .map((user) => {
        const attendance = attendanceMap.get(user.id)?.attendance || {};

        days.forEach((day) => {
          const dateKey = formattedDate(day);
          const formattedDay = formattedDateEnCa(day);

          if (
            !attendance[dateKey] &&
            day.getDay() !== 0 &&
            day.getDay() !== 6 &&
            formattedDay < today
          ) {
            attendance[dateKey] = {
              // for this to work properly, the datestring must yyyy-mm-dd (en-CA) no id-ID, or
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
              className={`px-2 py-1 text-xs rounded cursor-pointer ${
                statusColors[status] || "bg-gray-100"
              } ${hoverColor[status] || "hover:bg-gray-200"}`}
              onClick={() =>
                handleAttendanceDetailModal(attendanceRecord.fullDetails)
              }
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </div>
          );
        },
      });
    } else if (filterType === "weekly" || filterType === "monthly") {
      baseColumns.push(
        ...days.map((day) => ({
          accessorKey: formattedDate(day),
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
            const dateKey = formattedDate(day);
            const attendanceRecord = row.original.attendance[dateKey] || {};
            const status = attendanceRecord.status || "-";

            return (
              <div
                className="flex flex-wrap justify-center gap-1 cursor-pointer"
                onClick={() => {
                  handleAttendanceDetailModal(attendanceRecord.fullDetails);
                  console.log("dateKey: ", dateKey);
                }}
              >
                <div
                  className={`px-2 py-1 text-xs rounded ${
                    statusColors[status] || "bg-gray-100"
                  } ${hoverColor[status] || "hover:bg-gray-200"}`}
                >
                  {status === "absen" ? "A" : status.charAt(0).toUpperCase()}
                  {/* {console.log("status:", status)} */}
                </div>
              </div>
            );
          },
        }))
      );
    }

    if (filterType !== "daily") {
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

  const filteredData = useMemo(() => {
    if (!searchQuery) return mergedData;
    const lower = searchQuery.toLowerCase();
    return mergedData.filter(
      (row) =>
        row.name.toLowerCase().includes(lower) ||
        row.nip.toLowerCase().includes(lower)
    );
  }, [mergedData, searchQuery]);

  const pageSize = 15;
  const [pageIndex, setPageIndex] = useState(0);
  const totalPages = Math.ceil(mergedData.length / pageSize);

  const paginatedData = useMemo(() => {
    return filteredData.slice(pageIndex * pageSize, (pageIndex + 1) * pageSize);
  }, [filteredData, pageIndex, pageSize]);

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
      <RectangleButton
        className="p-2 bg-green-500 text-white rounded hover:bg-green-600 mb-4"
        onClick={exportToExcel}
      >
        <IoExitOutline className="mr-2" />
        Export to Excel
      </RectangleButton>
      <div className="mb-2">
        <input
          type="text"
          className="border px-2 py-1 rounded w-full md:w-1/3"
          placeholder="Cari nama atau NIP..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>
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
