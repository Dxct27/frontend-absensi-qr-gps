import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  flexRender,
} from "@tanstack/react-table";
import QRCodeModal from "../Modal/QRCodeModal";
import QRCodeListModal from "../Modal/QRCodeListModal";
import QRFormModal from "../Modal/QRFormModal";
import ConfirmModal from "../Modal/ConfirmModal";
import { fetchAPI } from "../../utils/api";
import { toast } from "react-toastify";
import { formattedDate } from "../../utils/date";

const AdminSpecialEventTable = ({ refreshKey }) => {
  const [isShowQRModalOpen, setIsShowQRModalOpen] = useState(false);
  const [isQRListModalOpen, setIsQRListModalOpen] = useState(false);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [selectedQrId, setSelectedQrId] = useState(null);
  const [selectedEventId, setSelectedEventId] = useState(null);
  const [openDropdownId, setOpenDropdownId] = useState(null);
  const [qrList, setQrList] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [eventToDelete, setEventToDelete] = useState(null);
  const dropdownRef = useRef(null);

  const loadSpecialEvents = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetchAPI("/special-events");
      setEvents(response);
    } catch (err) {
      console.error("Error fetching special events:", err);
      toast.error("Failed to load special events");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSpecialEvents();
  }, [refreshKey]);

  const handleShowQRList = (qrcodes) => {
    if (!qrcodes || qrcodes.length === 0) {
      alert("Tidak ada QR Code untuk event ini.");
      return;
    }

    if (qrcodes.length === 1) {
      setSelectedQrId(qrcodes[0].id);
      setIsShowQRModalOpen(true);
    } else {
      setQrList(qrcodes);
      setIsQRListModalOpen(true);
    }
  };

  const handleSelectQR = (qr) => {
    console.log("Selected QR Code:", qr);
    setSelectedQrId(qr.id);
    setIsQRListModalOpen(false);
    setIsShowQRModalOpen(true);
  };

  const handleUpdate = (row) => {
    setSelectedQrId(row.qrcodes[0]?.id || null);
    setSelectedEventId(row.id);
    setIsFormModalOpen(true);
  };

  const handleCreateQR = (eventId) => {
    setSelectedEventId(eventId);
    setIsFormModalOpen(true);
  };

  const handleDelete = async () => {
    if (!eventToDelete) return;
    try {
      await fetchAPI(`/special-events/${eventToDelete}`, "DELETE");
      toast.success("Event berhasil dihapus!");
      setEventToDelete(null);
      setIsConfirmOpen(false);
      loadSpecialEvents();
    } catch (err) {
      console.error("Error deleting event:", err);
      toast.error("Failed to delete event");
      setIsConfirmOpen(false);
    }
  };

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

  const columns = useMemo(() => [
    {
      header: "Nama Event",
      accessorKey: "name",
    },
    {
      header: "Tanggal",
      accessorKey: "date",
      cell: ({ getValue }) => formattedDate(getValue()),
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
            {!row.original.qrcodes || row.original.qrcodes.length === 0 ? (
              <button
                onClick={() => handleCreateQR(row.original.id)}
                className="block w-full text-left px-4 py-2 hover:bg-gray-100"
              >
                Create New QR
              </button>
            ) : (
              <button
                onClick={() => handleShowQRList(row.original.qrcodes)}
                className="block w-full text-left px-4 py-2 hover:bg-gray-100"
              >
                Tampilkan QR
              </button>
            )}
            <button
              onClick={() => handleUpdate(row.original)}
              className="block w-full text-left px-4 py-2 hover:bg-gray-100"
            >
              Edit
            </button>
            <button
              onClick={() => {
                setEventToDelete(row.original.id);
                setIsConfirmOpen(true);
              }}
              className="block w-full text-left px-4 py-2 hover:bg-gray-100 text-red-600"
            >
              Hapus
            </button>
          </div>
        </details>
      ),
    },
  ]);

  const sortedEvents = useMemo(() => {
    return [...events].sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [events]);

  const table = useReactTable({
    data: sortedEvents,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  return (
    <>
      <QRCodeListModal
        isOpen={isQRListModalOpen}
        onClose={() => setIsQRListModalOpen(false)}
        qrList={qrList}
        onSelectQR={handleSelectQR}
      />
      <QRFormModal
        isOpen={isFormModalOpen}
        onClose={() => {
          setIsFormModalOpen(false);
          setSelectedQrId(null);
          loadSpecialEvents();
        }}
        eventId={selectedEventId}
        qrId={selectedQrId}
        type={"specialEventForm"}
      />
      <QRCodeModal
        isOpen={isShowQRModalOpen}
        onClose={() => {
          setIsShowQRModalOpen(false);
          setSelectedQrId(null);
        }}
        qrCodeId={selectedQrId}
      />
      <ConfirmModal
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        title="Konfirmasi Hapus"
        message="Apakah Anda yakin ingin menghapus event ini?"
        confirmText="Hapus"
        confirmButtonStyles="bg-red-500 hover:bg-red-600"
        cancelText="Batal"
        onConfirm={handleDelete}
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

export default AdminSpecialEventTable;
