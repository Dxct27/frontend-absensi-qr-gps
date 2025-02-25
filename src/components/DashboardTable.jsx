import React, { useState } from "react";
import {
  createColumnHelper,
  useReactTable,
  getCoreRowModel,
} from "@tanstack/react-table";

const defaultData = Array.from({ length: 50 }, (_, i) => ({
  nip: (i + 1000000000).toString(),
  name: "John Smith",
  jenis_asn: "PNS",
  opd: "Dinas Komunikasi dan Informatika Trenggalek",
  waktu_absen: `2024-02-18 ${String(8 + (i % 5)).padStart(2, "0")}:00:00`,
  status: ["present", "sick", "excused", "latest", "absent"][i % 5],
}));

const getStatusColor = (status) => {
  switch (status) {
    case "present":
      return "bg-green-200";
    case "sick":
      return "bg-yellow-200";
    case "excused":
      return "bg-blue-200";
    case "latest":
      return "bg-purple-200";
    case "absent":
      return "bg-red-200";
    default:
      return "";
  }
};

const columnHelper = createColumnHelper();

const columns = [
  // columnHelper.display({
  //   id: "index",
  //   header: "#",
  //   cell: (info) => <span>{info.row.index + 1}</span>,
  // }),
  columnHelper.accessor("name", {
    header: "Name",
    cell: (info) => info.getValue(),
  }),
  columnHelper.accessor("nip", {
    header: "NIP",
    cell: (info) => info.getValue(),
  }),
  columnHelper.accessor("jenis_asn", {
    header: "Jenis ASN",
    cell: (info) => info.getValue(),
  }),
  columnHelper.accessor("opd", {
    header: "OPD",
    cell: (info) => info.getValue(),
  }),
  columnHelper.accessor("waktu_absen", {
    header: "Waktu Absen",
    cell: (info) => info.getValue(),
  }),
  columnHelper.accessor("status", {
    header: "Status",
    cell: (info) => (
      <span className={`p-1 rounded ${getStatusColor(info.getValue())}`}>
        {info.getValue()}
      </span>
    ),
  }),
];

const DashboardTable = () => {
  const [pageIndex, setPageIndex] = useState(0);
  const pageSize = 10;

  const table = useReactTable({
    data: defaultData,
    columns,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    pageCount: Math.ceil(defaultData.length / pageSize),
  });

  return (
    <div className="pb-5 shadow-md w-full mx-auto overflow-x-auto">
      <table className="w-full border-collapse border border-gray-300">
        <thead>
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id} className="border-b bg-gray-100">
              {headerGroup.headers.map((header) => (
                <th key={header.id} className="p-2 border text-left">
                  {header.column.columnDef.header}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody>
          {defaultData.slice(pageIndex * pageSize, (pageIndex + 1) * pageSize).map((row, rowIndex) => (
            <tr key={row.nip} className="border-b">
              {/* <td className="p-2 border">{pageIndex * pageSize + rowIndex + 1}</td> */}
              <td className="p-2 border">{row.name}</td>
              <td className="p-2 border">{row.nip}</td>
              <td className="p-2 border">{row.jenis_asn}</td>
              <td className="p-2 border">{row.opd}</td>
              <td className="p-2 border">{row.waktu_absen}</td>
              <td className={`p-2 border ${getStatusColor(row.status)}`}>{row.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="flex justify-between mt-4">
        <button
          onClick={() => setPageIndex((prev) => Math.max(prev - 1, 0))}
          disabled={pageIndex === 0}
          className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
        >
          Previous
        </button>
        <span>
          Page {pageIndex + 1} of {Math.ceil(defaultData.length / pageSize)}
        </span>
        <button
          onClick={() =>
            setPageIndex((prev) =>
              Math.min(prev + 1, Math.ceil(defaultData.length / pageSize) - 1)
            )
          }
          disabled={pageIndex >= Math.ceil(defaultData.length / pageSize) - 1}
          className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default DashboardTable;
