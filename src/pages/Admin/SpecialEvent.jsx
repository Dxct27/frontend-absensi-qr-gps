import { useState } from "react";
import LayoutAdmin from "../../components/Layout/Admin";
import RectangleButton from "../../components/RectangleButton";
import AdminSpecialEventTable from "../../components/Table/AdminSpecialEvent";
import QRFormModal from "../../components/Modal/QRFormModal";
import { IoAdd } from "react-icons/io5";
import SpecialEventCategoryModal from "../../components/Modal/SpecialEventCategoryModal";

const SpecialEvent = () => {
  const [selectedQrId, setSelectedQrId] = useState(null);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isManageCategoryModalOpen, setIsManageCategoryModalOpen] =
    useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleCreateSpecialEvent = () => {
    setIsFormModalOpen(true);
    setSelectedQrId(null);
    console.log("Create Special Event");
  };

  const handleManageCategory = () => {
    setIsManageCategoryModalOpen(true);
  };

  return (
    <LayoutAdmin>
      <SpecialEventCategoryModal
        isOpen={isManageCategoryModalOpen}
        onClose={() => setIsManageCategoryModalOpen(false)}
      />
      <QRFormModal
        isOpen={isFormModalOpen}
        onClose={() => {
          setIsFormModalOpen(false);
          setSelectedQrId(null);
          setRefreshKey((k) => k + 1);
        }}
        type={"specialEventForm"}
      />
      <div className="flex flex-col gap-4">
        <h2 className="text-2xl font-bold mb-5">Event</h2>
      </div>
      <div className="flex flex-row justify-between mb-4">
        <RectangleButton className={"p-2"} onClick={handleCreateSpecialEvent}>
          <IoAdd className="mr-2" />
          Tambah Event
        </RectangleButton>
        <RectangleButton className={"p-2"} onClick={handleManageCategory}>
          Kelola Kategori
        </RectangleButton>
      </div>
      <AdminSpecialEventTable refreshKey={refreshKey} />
    </LayoutAdmin>
  );
};
export default SpecialEvent;
