import NavBarUser from "../NavBar/User";
const LayoutUser = ({children}) => {
  return (
    <div className="">
      <NavBarUser />
      <div className="bg-gray-200 p-5 md:p-10">
        <div className="flex flex-col rounded-md shadow-lg px-5 bg-white">
            <main>{children}</main>
        </div>
      </div>
    </div>
  );
};
export default LayoutUser;
