import { useEffect, useMemo, useState } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  flexRender,
} from "@tanstack/react-table";
import { fetchAPI } from "../../utils/api";
import { formattedDate, formattedTimeDate } from "../../utils/date";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";

const AdminQRAttendanceTable = ({ qrCodeId, qrCodeName, refreshKey }) => {
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadAttendanceRecords();
  }, [qrCodeId, refreshKey]);

  const loadAttendanceRecords = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetchAPI(`/qrcodes/${qrCodeId}/attendances`);
      setAttendanceRecords(response);
    } catch (err) {
      console.error("Error fetching attendance records:", err);
      setError(
        err?.data?.message || "Failed to fetch attendance records."
      );
    } finally {
      setLoading(false);
    }
  };

  const columns = useMemo(
    () => [
      { accessorKey: "user.name", header: "Nama" },
      { accessorKey: "user.nip", header: "NIP" },
      { accessorKey: "user.opd.name", header: "OPD" },
      { accessorKey: "status", header: "Status" },
      {
        accessorKey: "created_at",
        header: "Timestamp",
        cell: ({ getValue }) => formattedTimeDate(getValue()),
      },
    ],
    []
  );

  const sortedAttendanceRecords = useMemo(() => {
    return [...attendanceRecords].sort((a, b) => {
      const opdA = (a.user?.opd?.name || "").localeCompare(b.user?.opd?.name || "");
      if (opdA !== 0) return opdA;
      return (a.user?.name || "").localeCompare(b.user?.name || "");
    });
  }, [attendanceRecords]);

  const table = useReactTable({
    data: sortedAttendanceRecords,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  const exportToExcel = async () => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("QR Attendance");

    const headers = ["Nama", "NIP", "OPD", "Status", "Timestamp"];
    worksheet.addRow(headers);

    attendanceRecords.forEach((record) => {
      worksheet.addRow([
        record.user?.name || "",
        record.user?.nip || "",
        record.user?.opd?.name || "",
        record.status || "",
        formattedTimeDate(record.created_at),
      ]);
    });

    worksheet.columns.forEach((column) => {
      column.width = 20;
    });

    const fileName = `QR_Attendance_${qrCodeName}_${formattedDate(new Date())}.xlsx`;

    const buffer = await workbook.xlsx.writeBuffer();
    saveAs(new Blob([buffer]), fileName);
  };

  return (
    <>
      <button
        onClick={exportToExcel}
        className="mb-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
      >
        Export to Excel
      </button>
      {loading ? (
        <p>Loading...</p>
      ) : error ? (
        <p className="text-red-500">{error}</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full border-collapse border">
            <thead>
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <th key={header.id} className="border p-2 bg-gray-200">
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
                <tr key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="border p-2">
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="flex justify-between items-center mt-4">
        <button
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
          className="px-4 py-2 bg-blue-500 text-white rounded disabled:bg-gray-300"
        >
          Prev
        </button>
        <span>
          Page {table.getState().pagination.pageIndex + 1} of{" "}
          {table.getPageCount()}
        </span>
        <button
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
          className="px-4 py-2 bg-blue-500 text-white rounded disabled:bg-gray-300"
        >
          Next
        </button>
      </div>
    </>
  );
};

export default AdminQRAttendanceTable;