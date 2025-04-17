import { useEffect, useRef, useState } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  flexRender,
} from "@tanstack/react-table";
import { fetchQRCodes, fetchAPI } from "../../utils/api";
import QRFormModal from "../../components/Modal/QRFormModal";
import QRCodeModal from "../../components/Modal/QRCodeModal";
import { downloadSingleQRAsPDF } from "../../utils/qrcodeDownload";
import { toast } from "react-toastify";
import ConfirmModal from "../../components/Modal/ConfirmModal";

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

const QRCodeListTable = ({
  showCheckbox,
  selectedQRs,
  setSelectedQRs,
  setVisibleQRs,
  refreshKey,
}) => {
  const [qrCodes, setQrCodes] = useState([]);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isShowQRModalOpen, setIsShowQRModalOpen] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [selectedQrId, setSelectedQrId] = useState(null);
  const [qrToDelete, setQrToDelete] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [openDropdownId, setOpenDropdownId] = useState(null);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest(".group")) {
        setOpenDropdownId(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleDropdownToggle = (rowId) => {
    setOpenDropdownId(openDropdownId === rowId ? null : rowId);
  };

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
    setIsShowQRModalOpen(true);
  };

  const handleUpdate = (qr) => {
    if (!qr || !qr.id) return;
    setSelectedQrId(qr.id);
    setIsFormModalOpen(true);
  };

  const handleDelete = async () => {
    if (!qrToDelete) return;
    try {
      await fetchAPI(`/qrcodes/${qrToDelete}`, "DELETE");
      setQrCodes((prev) => prev.filter((qr) => qr.id !== qrToDelete));
      toast.success("QR code deleted successfully");
    } catch (err) {
      console.error("Error deleting QR code:", err);
      toast.error("Failed to delete QR code");
    }
    setQrToDelete(null);
    setIsConfirmModalOpen(false);
    loadQRCodes();
  };

  const openConfirmDelete = (id) => {
    setQrToDelete(id);
    setIsConfirmModalOpen(true);
  };

  const handleSelectQR = (qr) => {
    setSelectedQRs((prevSelected) =>
      prevSelected.some((q) => q.id === qr.id)
        ? prevSelected.filter((q) => q.id !== qr.id)
        : [...prevSelected, qr]
    );
  };

  const handleDownloadSingle = (qr) => {
    downloadSingleQRAsPDF(qr);
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
      header: "Actions",
      cell: ({ row }) => (
        <details
          ref={dropdownRef}
          className="relative group"
          open={openDropdownId === row.original.id}
          onClick={() => handleDropdownToggle(row.original.id)}
        >
          <summary className="flex justify-between items-center px-2 py-1 bg-gray-200 rounded cursor-pointer list-none">
            Actions
            <span className="ml-2 transform group-open:rotate-180 transition-transform">
              ▼
            </span>
          </summary>
          <div className="relative z-10 mt-1 bg-white border shadow-lg rounded w-40">
            <button
              onClick={() => handleDownloadSingle(row.original)}
              className="block w-full text-left px-4 py-2 hover:bg-gray-100"
            >
              Download
            </button>
            <button
              onClick={() => handleShowQR(row.original)}
              className="block w-full text-left px-4 py-2 hover:bg-gray-100"
            >
              Tampilkan QR
            </button>
            <button
              onClick={() => handleUpdate(row.original)}
              className="block w-full text-left px-4 py-2 hover:bg-gray-100"
            >
              Edit
            </button>
            <button
              onClick={() => openConfirmDelete(row.original.id)}
              className="block w-full text-left px-4 py-2 hover:bg-gray-100 text-red-600"
            >
              Hapus
            </button>
          </div>
        </details>
      ),
    },
  ];

  const table = useReactTable({
    data: qrCodes,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  useEffect(() => {
    const visibleRows = table.getRowModel().rows.map((row) => row.original);
    setVisibleQRs?.(visibleRows);
  }, [table.getRowModel().rows]);

  useEffect(() => {
    loadQRCodes();
  }, [refreshKey]);

  return (
    <>
      <ConfirmModal
        isOpen={isConfirmModalOpen}
        onClose={() => {
          setIsConfirmModalOpen(false);
          setQrToDelete(null);
        }}
        title="Konfirmasi Hapus"
        message="Apakah Anda yakin ingin menghapus QR code ini?"
        confirmText="Hapus"
        confirmButtonStyles="bg-red-500 hover:bg-red-600"
        cancelText="Batal"
        onConfirm={handleDelete}
      />

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
