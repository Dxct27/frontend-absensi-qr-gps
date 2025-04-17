import { useState } from "react";
import Modal from "../Modal";
import InputLabeled from "../InputLabeled";
import { fetchAPI } from "../../utils/api";

const SetPasswordModal = ({ isOpen, onClose, onSuccess }) => {
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
  
    try {
      const response = await fetchAPI("/auth/set-password", "POST", {
        password: password,
        password_confirmation: passwordConfirm,
      });
  
      if (response?.message === "Password set successfully") {
        onSuccess();
      } else {
        setError("Failed to set password. Please try again.");
      }
    } catch (err) {
      ("Error setting password:", err);
      setError("Failed to set password.");
    } finally {
      setLoading(false);
    }
  };
  

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Buat Password">
      <form onSubmit={handleSubmit} className="space-y-4">
        <InputLabeled
          label="Password"
          type="password"
          value={password}
          placeholder="Masukkan password"
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <InputLabeled
          label="Konfirmasi Password"
          type="password"
          value={passwordConfirm}
          placeholder="Masukkan ulang password"
          onChange={(e) => setPasswordConfirm(e.target.value)}
          required
        />
        {error && <p className="text-red-500">{error}</p>}
        <button
          type="submit"
          className="w-full bg-blue-500 text-white py-2 rounded disabled:opacity-50"
          disabled={loading}
        >
          {loading ? "Menyimpan..." : "Simpan Password"}
        </button>
        <button
          type="button"
          onClick={onClose}
          className="w-full text-blue-400 py-2 rounded"
        >
          Skip
        </button>
      </form>
    </Modal>
  );
};

export default SetPasswordModal;
