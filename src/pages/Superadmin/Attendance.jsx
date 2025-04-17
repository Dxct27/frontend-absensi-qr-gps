import { useEffect, useState } from "react";
import SuperAdminLayout from "../../components/Layout/SuperAdmin";
import SuperAdminAttendanceTable from "../../components/Table/SuperAdminAttendance";
import ConfirmModal from "../../components/Modal/ConfirmModal";
import { fetchAPI } from "../../utils/api";
import { ClipLoader } from "react-spinners";

const SuperAdminAttendance = () => {
  const [records, setRecords] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [recordToDelete, setRecordToDelete] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await fetchAPI(`/superadmin/attendance?page=${page}&search=${searchTerm}`);
      if (!response || !response.data) throw new Error("Invalid API response");

      setRecords(response.data);
      setTotalPages(response.last_page || 1);
    } catch (error) {
      ("Error fetching attendance:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [page, searchTerm]);

  const handleDelete = async () => {
    if (!recordToDelete) return;
    setDeleting(true);
    try {
      await fetchAPI(`/superadmin/attendance/${recordToDelete}`, "DELETE");
      await fetchData();
    } catch (error) {
      ("Delete failed:", error);
    } finally {
      setDeleting(false);
      setIsConfirmOpen(false);
      setRecordToDelete(null);
    }
  };

  const openConfirmDelete = (id) => {
    setRecordToDelete(id);
    setIsConfirmOpen(true);
  };

  return (
    <SuperAdminLayout>
      <ConfirmModal
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        title="Konfirmasi Hapus"
        message="Apakah Anda yakin ingin menghapus data ini?"
        confirmButtonStyles="bg-red-500 hover:bg-red-600"
        confirmText="Hapus"
        cancelText="Batal"
        onConfirm={handleDelete}
      />

      <h1 className="text-2xl font-bold mb-4">Manage Attendance</h1>

      <div className="flex gap-4 mb-4">
        <input
          type="text"
          placeholder="Search by name, date, or status..."
          className="p-2 border border-gray-300 rounded w-full"
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setPage(1);
          }}
          disabled={deleting}
        />
      </div>

      {loading ? (
        <div className="flex justify-center py-10">
          <ClipLoader color="#007bff" size={40} />
        </div>
      ) : (
        <SuperAdminAttendanceTable
          records={records}
          onDelete={openConfirmDelete}
          deleting={deleting}
        />
      )}

      <div className="flex justify-center mt-4">
        <button
          className="p-2 border border-gray-300 rounded mr-2"
          onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
          disabled={page === 1 || deleting}
        >
          Previous
        </button>
        <span className="p-2">{`Page ${page} of ${totalPages}`}</span>
        <button
          className="p-2 border border-gray-300 rounded ml-2"
          onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
          disabled={page === totalPages || deleting}
        >
          Next
        </button>
      </div>
    </SuperAdminLayout>
  );
};

export default SuperAdminAttendance;
