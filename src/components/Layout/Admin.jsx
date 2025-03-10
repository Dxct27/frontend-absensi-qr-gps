import NavBarAdmin from "../NavBar/Admin";
const LayoutAdmin = ({children}) => {
  return (
    <div className="">
      <NavBarAdmin />
      <div className="bg-gray-200 p-5 md:p-10">
        <div className="flex flex-col rounded-md shadow-lg p-5 bg-white">
            <main>{children}</main>
        </div>
      </div>
    </div>
  );
};
export default LayoutAdmin;
