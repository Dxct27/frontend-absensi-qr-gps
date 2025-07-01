import { useEffect, useState } from "react";
import InputLabeled from "../InputLabeled";
import RectangleButton from "../RectangleButton";
import { fetchAPI } from "../../utils/api";
import Modal from "../Modal";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { format } from "date-fns";
import Label from "../Label";
import SpecialEventCategoryModal from "./SpecialEventCategoryFormModal.jsx"; // You'll create this

const SpecialEventFormModal = ({ isOpen, onClose, onSubmit, initialData }) => {
  const user = JSON.parse(localStorage.getItem("user"));

  const defaultFormData = {
    name: "",
    date: new Date(),
    categoryId: "",
  };

  const [formData, setFormData] = useState(defaultFormData);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || "",
        date: initialData.date ? new Date(initialData.date) : new Date(),
        categoryId: initialData.special_event_category_id || "",
      });
    } else {
      setFormData(defaultFormData);
    }
  }, [initialData]);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const res = await fetchAPI("/special-event-categories");
      setCategories(res.data || []);
    } catch (err) {
      console.error("Failed to fetch categories:", err);
      toast.error("Gagal memuat kategori");
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "categoryId" && value === "add_new") {
      setIsCategoryModalOpen(true);
      return;
    }

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleDateChange = (date) => {
    setFormData((prev) => ({
      ...prev,
      date,
    }));
  };

  const handleSubmit = async () => {
    if (!formData.name || !formData.categoryId) {
      toast.error("Nama dan Kategori wajib diisi");
      return;
    }

    const payload = {
      name: formData.name,
      date: format(formData.date, "yyyy-MM-dd"),
      special_event_category_id: formData.categoryId,
      opd_id: user?.opd_id,
    };

    try {
      setLoading(true);
      await fetchAPI("/special-events", "POST", payload);
      toast.success("Event berhasil dibuat!");
      setFormData(defaultFormData);
      onSubmit?.();
      onClose();
    } catch (err) {
      toast.error("Gagal menyimpan event");
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryAdded = async (newCategory) => {
    await fetchCategories();
    setFormData((prev) => ({
      ...prev,
      categoryId: newCategory.id,
    }));
    setIsCategoryModalOpen(false);
  };

  const handleClose = () => {
    setFormData(defaultFormData);
    onClose();
  };

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={handleClose}
        title="Buat Event Khusus"
        sizeClasses="w-full md:w-2/3"
      >
        <div className="space-y-4">
          <InputLabeled
            label="Nama Event"
            name="name"
            placeholder="Misal: Libur Nasional"
            value={formData.name}
            onChange={handleChange}
          />

          <div className="flex flex-col">
            <Label className="mb-1 font-medium">Tanggal</Label>
            <DatePicker
              selected={formData.date}
              onChange={handleDateChange}
              dateFormat="dd/MM/yyyy"
              className="opacity-70 border-2 transform transition ease-in-out duration-100 rounded-lg border-gray-100 focus:border-primary500 py-4 px-3 w-full focus:outline-none"
            />
          </div>

          <div className="flex flex-col">
            <Label className="mb-1 font-medium">Kategori</Label>
            <select
              name="categoryId"
              value={formData.categoryId}
              onChange={handleChange}
              className="border border-gray-200 rounded-lg px-4 py-2"
            >
              <option value="">Pilih kategori</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
              <option value="add_new">+ Tambah Kategori Baru</option>
            </select>
          </div>

          <RectangleButton onClick={handleSubmit} disabled={loading}>
            {loading ? "Menyimpan..." : "Simpan Event"}
          </RectangleButton>
        </div>
      </Modal>

      {/* Nested modal for adding category */}
      <SpecialEventCategoryModal
        isOpen={isCategoryModalOpen}
        onClose={() => setIsCategoryModalOpen(false)}
        onSuccess={handleCategoryAdded}
      />
    </>
  );
};

export default SpecialEventFormModal;
