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
import {
  downloadSingleQRAsPDF,
  downloadMultipleQRsAsPDF,
} from "../../utils/qrcodeDownload";
import { toast } from "react-toastify";

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

const QRCodeListTable = ({ showCheckbox, selectedQRs, setSelectedQRs }) => {
  const [qrCodes, setQrCodes] = useState([]);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isShowQRModalOpen, setIsShowQRModalOpen] = useState(false);
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

  const handleShowQR = (qr) => {
    setSelectedQrId(qr.id);
    console.log("qr data", qr);
    setIsShowQRModalOpen(true);
  };

  const handleUpdate = (qr) => {
    if (!qr || !qr.id) {
      console.error("QR ID is undefined:", qr);
      return;
    }
    console.log("Selected QR Data:", qr);
    setSelectedQrId(qr.id);
    setIsFormModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this QR Code?")) return;
    try {
      await fetchAPI(`/qrcodes/${id}`, "DELETE");
      setQrCodes(qrCodes.filter((qr) => qr.id !== id));
    } catch (err) {
      console.error("Error deleting QR code:", err);
      toast.err("Failed to delete QR code");
    }
    loadQRCodes();
  };

  const handleSelectQR = (qr) => {
    setSelectedQRs((prevSelected) =>
      prevSelected.some((q) => q.id === qr.id)
        ? prevSelected.filter((q) => q.id !== qr.id)
        : [...prevSelected, qr]
    );
  };

  const handleDownloadSingle = (qr) => {
    console.log("handleDownloadSingle called with:", qr);
    downloadSingleQRAsPDF(qr);
  };

  const handleDownloadMultiple = () => {
    console.log("All selected QR ", selectedQRs);
    downloadMultipleQRsAsPDF(selectedQRs, "Your OPD Name");
  };

  const columns = [
    ...(showCheckbox
      ? [
          {
            id: "select",
            header: "Select",
            cell: ({ row }) => (
              <input
                type="checkbox"
                checked={selectedQRs.some((qr) => qr.id === row.original.id)}
                onChange={() => handleSelectQR(row.original)}
              />
            ),
          },
        ]
      : []),
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
      header: "Download",
      cell: ({ row }) => (
        <button
          onClick={() => handleDownloadSingle(row.original)}
          className="px-2 py-1 bg-blue-500 text-white rounded"
        >
          Download
        </button>
      ),
    },
    {
      header: "Tampilkan QR",
      cell: ({ row }) => (
        <button
          onClick={() => handleShowQR(row.original)}
          className="px-2 py-1 bg-green-500 text-white rounded"
        >
          Tampilkan
        </button>
      ),
    },
    {
      header: "Edit",
      cell: ({ row }) => (
        <button
          onClick={() => handleUpdate(row.original)}
          className="px-2 py-1 bg-yellow-500 text-white rounded"
        >
          Edit
        </button>
      ),
    },
    {
      header: "Hapus",
      cell: ({ row }) => (
        <button
          onClick={() => handleDelete(row.original.id)}
          className="px-2 py-1 bg-red-500 text-white rounded"
        >
          Hapus
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
        isOpen={isFormModalOpen}
        onClose={() => {
          setIsFormModalOpen(false);
          setSelectedQrId(null);
          loadQRCodes();
        }}
        qrId={selectedQrId}
      />
      <QRCodeModal
        isOpen={isShowQRModalOpen}
        onClose={() => {
          setIsShowQRModalOpen(false);
          setSelectedQrId(null);
          loadQRCodes();
        }}
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
