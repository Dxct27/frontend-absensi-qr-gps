import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  createColumnHelper,
} from "@tanstack/react-table";
import { useMemo } from "react";

const SpecialEventCategoryTable = ({
  categories,
  editingId,
  editingName,
  setEditingId,
  setEditingName,
  handleEdit,
  setCategoryToDelete,
  setIsConfirmOpen,
}) => {
  const columnHelper = createColumnHelper();

  const columns = useMemo(
    () => [
      columnHelper.accessor("name", {
        header: "Nama Kategori",
        cell: (info) =>
          editingId === info.row.original.id ? (
            <input
              className="border px-2 py-1 rounded w-full"
              value={editingName}
              onChange={(e) => setEditingName(e.target.value)}
              onKeyDown={(e) =>
                e.key === "Enter" && handleEdit(info.row.original.id)
              }
              autoFocus
            />
          ) : (
            info.getValue()
          ),
      }),
      columnHelper.display({
        id: "actions",
        header: "Aksi",
        cell: (info) =>
          editingId === info.row.original.id ? (
            <div className="flex gap-2">
              <button
                className="bg-green-500 text-white px-2 py-1 rounded"
                onClick={() => handleEdit(info.row.original.id)}
              >
                Simpan
              </button>
              <button
                className="bg-gray-300 px-2 py-1 rounded"
                onClick={() => {
                  setEditingId(null);
                  setEditingName("");
                }}
              >
                Batal
              </button>
            </div>
          ) : (
            <div className="flex gap-2">
              <button
                className="bg-yellow-400 px-2 py-1 rounded"
                onClick={() => {
                  setEditingId(info.row.original.id);
                  setEditingName(info.row.original.name);
                }}
              >
                Edit
              </button>
              <button
                className="bg-red-500 text-white px-2 py-1 rounded"
                onClick={() => {
                  setCategoryToDelete(info.row.original.id);
                  setIsConfirmOpen(true);
                }}
              >
                Hapus
              </button>
            </div>
          ),
      }),
    ],
    [
      editingId,
      editingName,
      setEditingId,
      setEditingName,
      handleEdit,
      setCategoryToDelete,
      setIsConfirmOpen,
    ]
  );

  const table = useReactTable({
    data: categories,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
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
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default SpecialEventCategoryTable;
