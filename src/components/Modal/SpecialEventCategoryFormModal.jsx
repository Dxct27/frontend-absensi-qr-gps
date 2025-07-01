import { useState } from "react";
import Modal from "../Modal";
import InputLabeled from "../InputLabeled";
import RectangleButton from "../RectangleButton";
import { fetchAPI } from "../../utils/api";
import { toast } from "react-toastify";

const SpecialEventCategoryFormModal = ({ isOpen, onClose, onSuccess }) => {
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!name.trim()) {
      toast.error("Nama kategori tidak boleh kosong");
      return;
    }

    setLoading(true);
    try {
      const res = await fetchAPI("/special-event-categories", "POST", { name });
      toast.success("Kategori berhasil ditambahkan");
      onSuccess(res);
      setName("");
      onClose();
    } catch (err) {
      toast.error("Gagal menambahkan kategori");
    }
    setLoading(false);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Tambah Kategori Baru">
      <div className="space-y-4">
        <InputLabeled
          label="Nama Kategori"
          name="category"
          placeholder="Misal: Seminar, Rapat"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <RectangleButton className={"p-2 bg-blue-500 text-white"} onClick={handleSubmit} disabled={loading}>
          {loading ? "Menyimpan..." : "Simpan"}
        </RectangleButton>
      </div>
    </Modal>
  );
};

export default SpecialEventCategoryFormModal;
