import { useMemo, useState } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  flexRender,
} from "@tanstack/react-table";

const SuperAdminUsersTable = ({
  users,
  opds,
  handleGroupChange,
  handleOpdChange,
  handleDelete,
}) => {
  const [sorting, setSorting] = useState([{ id: "name", desc: false }]); // Default to ASC name sorting

  const columns = useMemo(
    () => [
      {
        accessorKey: "name",
        header: "Name",
        cell: (info) => info.getValue(),
      },
      {
        accessorKey: "opd_id",
        header: "OPD",
        cell: ({ row }) => (
          <select
            className="p-1 border rounded"
            value={row.original.opd_id || ""}
            onChange={(e) => handleOpdChange(row.original.id, e.target.value)}
          >
            <option value="">—</option>
            {opds.map((opd) => (
              <option key={opd.id} value={opd.id}>
                {opd.name}
              </option>
            ))}
          </select>
        ),
      },
      {
        accessorKey: "email",
        header: "Email",
        cell: (info) => info.getValue(),
      },
      {
        accessorKey: "group",
        header: "Group",
        cell: ({ row }) => (
          <select
            className="p-1 border rounded"
            value={row.original.group}
            onChange={(e) => handleGroupChange(row.original.id, e.target.value)}
          >
            {["user", "admin", "superadmin"].map((group) => (
              <option key={group} value={group}>
                {group.charAt(0).toUpperCase() + group.slice(1)}
              </option>
            ))}
          </select>
        ),
      },
      {
        header: "Actions",
        cell: ({ row }) => (
          <button
            onClick={() => handleDelete(row.original.id)}
            className="px-2 py-1 bg-red-500 text-white rounded"
          >
            Delete
          </button>
        ),
      },
    ],
    [handleGroupChange, handleOpdChange, handleDelete, opds]
  );

  const table = useReactTable({
    data: users,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    state: { sorting },
    onSortingChange: setSorting,
  });

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse border border-gray-200">
        <thead className="bg-gray-100">
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <th key={header.id} className="p-2 border">
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
              <tr key={row.id} className="text-center">
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id} className="p-2 border">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={columns.length} className="p-2 text-center">
                No users found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default SuperAdminUsersTable;
