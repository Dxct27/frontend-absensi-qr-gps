import { useEffect, useState } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  flexRender,
} from "@tanstack/react-table";
import { fetchQRCodes, fetchAPI } from "../../utils/api";
import QRFormModal from "../../components/Modal/QRFormModal";
import QRCodeModal from "../../components/Modal/QRCodeModal";

const formatDate = (dateString) => {
  if (!dateString) return "-";
  const date = new Date(dateString);
  return (
    date.toLocaleTimeString("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
    }) +
    " " +
    date.toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    })
  );
};

const QRCodeListTable = () => {
  const [qrCodes, setQrCodes] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedQrId, setSelectedQrId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadQRCodes();
  }, []);

  const loadQRCodes = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetchQRCodes();
      setQrCodes(response);
    } catch (err) {
      console.error("Error fetching QR codes:", err);
      setError("Failed to fetch QR codes");
    } finally {
      setLoading(false);
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedQrId(null);
    loadQRCodes();
  };

  const handleShowQR = (qr) => {
    setSelectedQrId(qr.id);
    setIsModalOpen(true);
  };

  const handleUpdate = (qr) => {
    if (!qr || !qr.id) {
      console.error("QR ID is undefined:", qr);
      return;
    }
    console.log("Selected QR Data:", qr);
    setSelectedQrId(qr.id);
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this QR Code?")) return;
    try {
      await fetchAPI(`/qrcodes/${id}`, "DELETE");
      setQrCodes(qrCodes.filter((qr) => qr.id !== id));
    } catch (err) {
      console.error("Error deleting QR code:", err);
      alert("Failed to delete QR code");
    }
    loadQRCodes();
  };

  const columns = [
    { accessorKey: "name", header: "Nama" },
    { accessorKey: "latitude", header: "Latitude" },
    { accessorKey: "longitude", header: "Longitude" },
    { accessorKey: "radius", header: "Radius (m)" },
    {
      accessorKey: "waktu_awal",
      header: "Waktu Awal",
      cell: ({ getValue }) => formatDate(getValue()),
    },
    {
      accessorKey: "waktu_akhir",
      header: "Waktu Akhir",
      cell: ({ getValue }) => formatDate(getValue()),
    },
    {
      header: "Show QR",
      cell: ({ row }) => (
        <button
          onClick={() => handleShowQR(row.original)}
          className="px-2 py-1 bg-green-500 text-white rounded"
        >
          Show QR
        </button>
      ),
    },
    {
      header: "Update",
      cell: ({ row }) => (
        <button
          onClick={() => handleUpdate(row.original)}
          className="px-2 py-1 bg-yellow-500 text-white rounded"
        >
          Update
        </button>
      ),
    },
    {
      header: "Delete",
      cell: ({ row }) => (
        <button
          onClick={() => handleDelete(row.original.id)}
          className="px-2 py-1 bg-red-500 text-white rounded"
        >
          Delete
        </button>
      ),
    },
  ];

  const table = useReactTable({
    data: qrCodes,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  return (
    <>
      <QRFormModal
        isOpen={isModalOpen}
        onClose={closeModal}
        qrId={selectedQrId}
      />
      <QRCodeModal
        isOpen={isModalOpen}
        onClose={closeModal}
        qrCodeId={selectedQrId}
      />

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

      {/* Pagination Controls */}
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

export default QRCodeListTable;
