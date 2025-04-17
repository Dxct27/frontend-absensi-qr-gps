import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import LogoKominfo from "../../assets/logo-kominfo.png";
import { useAuth } from "../../context/AuthContext";
import { toast } from "react-toastify";

const NavBarUser = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      ("Logout failed!", error);
      toast.error("Logout failed! Please try again.");
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        !event.target.closest("#navbar-default") &&
        !event.target.closest("#menu-button") &&
        !event.target.closest("#profile-button")
      ) {
        setIsOpen(false);
        setProfileOpen(false);
      }
    };

    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  return (
    <nav className="bg-gray-500 border-gray-200">
      <div className="w-full flex flex-wrap items-center justify-between p-4">
        {/* Logo & Title */}
        <Link to="/dashboard" className="flex items-center space-x-3">
          <img src={LogoKominfo} className="h-[5vh]" alt="Kominfo" />
          <span className="text-2xl font-semibold text-white">Absensi</span>
        </Link>

        {/* Mobile Menu Button */}
        <button
          id="menu-button"
          onClick={() => setIsOpen(!isOpen)}
          type="button"
          className="md:hidden p-2 w-10 h-10 text-white rounded-lg hover:bg-gray-600 focus:outline-none !bg-inherit"
        >
          <svg
            className="w-6 h-6"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M4 6h16M4 12h16m-7 6h7"
            />
          </svg>
        </button>

        {/* Menu Items */}
        <div
          className={`${isOpen ? "block" : "hidden"} md:block w-full md:w-auto`}
          id="navbar-default"
        >
          <ul className="flex flex-col md:flex-row md:space-x-6 bg-gray-600 text-white rounded-lg md:bg-gray-500 p-4 md:p-0">
            <li>
              <Link to="/dashboard" className="hover:text-gray-300">
                Dashboard
              </Link>
            </li>
            <li>
              <Link to="/history" className="hover:text-gray-300">
                Riwayat
              </Link>
            </li>
            {user && (
              <li className="relative">
                <button
                  id="profile-button"
                  onClick={() => setProfileOpen(!profileOpen)}
                  className="flex items-center space-x-2 text-white hover:text-gray-300 !bg-inherit focus:outline-none"
                >
                  Profile
                </button>
                {profileOpen && (
                  <div className="absolute right-0 mt-2 w-40 bg-white rounded-lg shadow-lg text-gray-700">
                    <span className="block px-4 py-2 font-semibold">
                      {user.name}
                    </span>
                    <hr />
                    <button
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-2 hover:bg-gray-200"
                    >
                      Log Out
                    </button>
                  </div>
                )}
              </li>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default NavBarUser;
