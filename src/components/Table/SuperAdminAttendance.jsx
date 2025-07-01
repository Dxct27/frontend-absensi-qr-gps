import { useMemo } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  flexRender,
} from "@tanstack/react-table";

const SuperAdminAttendanceTable = ({ records, onDelete, deleting }) => {
  const columns = useMemo(
    () => [
      {
        accessorKey: "user.name",
        header: "Name",
        cell: (info) => info.getValue() || "-",
      },
      {
        accessorKey: "opd.name",
        header: "OPD",
        cell: (info) => info.getValue() || "-",
      },
      {
        accessorKey: "qrcode.type",
        header: "Type",
        cell: (info) => info.getValue() === "special_event" ? "Special Event" : "Daily",
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: (info) => info.getValue(),
      },
      {
        accessorKey: "date",
        header: "Date",
        cell: (info) => info.getValue(),
      },
      {
        accessorKey: "timestamp",
        header: "Time",
        cell: (info) => info.getValue(),
      },
      {
        header: "Actions",
        cell: ({ row }) => (
          <button
            onClick={() => onDelete(row.original.id)}
            className="px-2 py-1 bg-red-500 text-white rounded disabled:opacity-50"
            disabled={deleting}
          >
            Delete
          </button>
        ),
      },
    ],
    [onDelete, deleting]
  );

  const table = useReactTable({
    data: records,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse border border-gray-200 text-sm">
        <thead className="bg-gray-100">
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <th key={header.id} className="p-2 border text-left">
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
          {table.getRowModel().rows.length > 0 ? (
            table.getRowModel().rows.map((row) => (
              <tr key={row.id}>
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id} className="p-2 border">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={columns.length} className="p-4 text-center">
                No attendance records found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default SuperAdminAttendanceTable;
