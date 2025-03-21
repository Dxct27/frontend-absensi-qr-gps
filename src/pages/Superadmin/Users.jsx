import { useEffect, useState } from "react";
import SuperAdminLayout from "../../components/Layout/SuperAdmin";
import SuperAdminUsersTable from "../../components/Table/SuperAdminUsers";
import ConfirmModal from "../../components/Modal/ConfirmModal"; // Import ConfirmModal
import { fetchAPI } from "../../utils/api";
import { ClipLoader } from "react-spinners";

const SuperAdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [opdFilter, setOpdFilter] = useState("");
  const [opds, setOpds] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await fetchAPI(`/superadmin/users?page=${page}&search=${searchTerm}&opd=${opdFilter}`);
      const opdData = await fetchAPI("/opd");

      if (!response || !response.data) throw new Error("Invalid API response");

      setUsers(response.data);
      setOpds(opdData);
      setTotalPages(response.last_page || 1);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [page, searchTerm, opdFilter]);

  const handleUpdate = async (url, method, body) => {
    setUpdating(true);
    try {
      await fetchAPI(url, method, body);
      await fetchData();
    } catch (error) {
      console.error("Error updating data:", error);
    } finally {
      setUpdating(false);
    }
  };

  const openConfirmDelete = (userId) => {
    setUserToDelete(userId);
    setIsConfirmOpen(true);
  };

  const handleDelete = async () => {
    if (!userToDelete) return;
    await handleUpdate(`/superadmin/users/${userToDelete}`, "DELETE");
    setIsConfirmOpen(false);
    setUserToDelete(null);
  };

  const handleGroupChange = async (userId, newGroup) => {
    await handleUpdate(`/superadmin/users/${userId}/group`, "PUT", { group: newGroup });
  };

  const handleOpdChange = async (userId, newOpdId) => {
    await handleUpdate(`/superadmin/users/${userId}/opd`, "PUT", { opd_id: newOpdId });
  };

  return (
    <SuperAdminLayout>
      <ConfirmModal
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        title="Confirm Delete"
        message="Are you sure you want to delete this user?"
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={handleDelete}
      />

      <h1 className="text-2xl font-bold mb-4">Manage Users</h1>

      <div className="flex gap-4 mb-4">
        <input
          type="text"
          placeholder="Search by name, email, or OPD..."
          className="p-2 border border-gray-300 rounded w-full"
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setPage(1);
          }}
          disabled={updating}
        />

        <select
          className="p-2 border border-gray-300 rounded"
          value={opdFilter}
          onChange={(e) => {
            setOpdFilter(e.target.value);
            setPage(1);
          }}
          disabled={updating}
        >
          <option value="">All OPDs</option>
          {opds.map((opd) => (
            <option key={opd.id} value={opd.id.toString()}>{opd.name}</option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="flex justify-center py-10">
          <ClipLoader color="#007bff" size={40} />
        </div>
      ) : (
        <SuperAdminUsersTable
          users={users}
          opds={opds}
          handleGroupChange={handleGroupChange}
          handleOpdChange={handleOpdChange}
          handleDelete={openConfirmDelete} // Use modal confirmation
          updating={updating}
        />
      )}

      <div className="flex justify-center mt-4">
        <button
          className="p-2 border border-gray-300 rounded mr-2"
          onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
          disabled={page === 1 || updating}
        >
          Previous
        </button>
        <span className="p-2">{`Page ${page} of ${totalPages}`}</span>
        <button
          className="p-2 border border-gray-300 rounded ml-2"
          onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
          disabled={page === totalPages || updating}
        >
          Next
        </button>
      </div>
    </SuperAdminLayout>
  );
};

export default SuperAdminUsers;
