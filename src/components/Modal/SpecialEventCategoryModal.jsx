import { useEffect, useState } from "react";
import { fetchAPI } from "../../utils/api";
import Modal from "../Modal";
import ConfirmModal from "./ConfirmModal";
import SpecialEventCategoryTable from "../Table/SpecialEventCategory";
import { toast } from "react-toastify";

const SpecialEventCategoryModal = ({ isOpen, onClose }) => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState(null);
  const [newCategory, setNewCategory] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editingName, setEditingName] = useState("");

  const fetchCategories = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchAPI("/special-event-categories", "GET");
      setCategories(data);
    } catch (err) {
      setError("Gagal mengambil kategori.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) fetchCategories();
  }, [isOpen]);

  const handleAdd = async () => {
    if (!newCategory.trim()) return;
    try {
      await fetchAPI("/special-event-categories", "POST", {
        name: newCategory,
      });
      toast.success("Kategori berhasil ditambahkan!");
      setNewCategory("");
      fetchCategories();
    } catch (errors) {
      if (typeof errors.data?.errors === "string") {
        toast.error(errors.data.errors);
      } else if (
        errors.data?.errors &&
        typeof errors.data.errors === "object" &&
        !Array.isArray(errors.data.errors)
      ) {
        const firstKey = Object.keys(errors.data.errors)[0];
        const firstMsg = errors.data.errors[firstKey][0];
        toast.error(firstMsg);
      } else {
        toast.error("Gagal menambah kategori.");
      }
    }
  };

  const handleEdit = async (id) => {
    if (!editingName.trim()) return;
    try {
      await fetchAPI(`/special-event-categories/${id}`, "PUT", {
        name: editingName,
      });
      toast.success("Kategori berhasil diubah!");
      setEditingId(null);
      setEditingName("");
      fetchCategories();
    } catch {
      toast.error("Gagal mengubah kategori.");
    }
  };

  const handleDelete = async () => {
    if (!categoryToDelete) return;
    try {
      await fetchAPI(`/special-event-categories/${categoryToDelete}`, "DELETE");
      toast.success("Kategori berhasil dihapus!");
      setCategoryToDelete(null);
      setIsConfirmOpen(false);
      fetchCategories();
    } catch {
      toast.error("Gagal menghapus kategori.");
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Kelola Kategori">
      <div className="p-4">
        <div className="mb-4 flex gap-2">
          <input
            className="border px-2 py-1 rounded w-full"
            placeholder="Tambah kategori baru"
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAdd()}
          />
          <button
            className="bg-blue-500 text-white px-4 py-1 rounded"
            onClick={handleAdd}
          >
            Tambah
          </button>
        </div>
        {loading ? (
          <p>Loading...</p>
        ) : error ? (
          <p className="text-red-500">{error}</p>
        ) : (
          <SpecialEventCategoryTable
            categories={categories}
            editingId={editingId}
            editingName={editingName}
            setEditingId={setEditingId}
            setEditingName={setEditingName}
            handleEdit={handleEdit}
            setCategoryToDelete={setCategoryToDelete}
            setIsConfirmOpen={setIsConfirmOpen}
          />
        )}
      </div>
      <ConfirmModal
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        title="Konfirmasi Hapus"
        message="Apakah Anda yakin ingin menghapus kategori ini?"
        confirmText="Hapus"
        confirmButtonStyles="bg-red-500 hover:bg-red-600"
        cancelText="Batal"
        onConfirm={handleDelete}
      />
    </Modal>
  );
};

export default SpecialEventCategoryModal;
