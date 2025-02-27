import { useState, useContext, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import LogoKominfo from "../../assets/logo-kominfo.png";
import { apiFetch } from "../../utils/api";

const NavBarUser = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await apiFetch("auth/logout", "POST"); // Use API helper function
      localStorage.removeItem("token"); // Clear token
      logout();
    } catch (error) {
      alert("Logout failed!");
    }
  };

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        !event.target.closest("#navbar-default") &&
        !event.target.closest("#menu-button")
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  return (
    <nav className="bg-gray-500 border-gray-200">
      <div className="w-full flex flex-wrap items-center justify-between p-4">
        {/* Logo & Title */}
        <Link to="/" className="flex items-center space-x-3">
          <img src={LogoKominfo} className="h-[5vh]" alt="Kominfo" />
          <span className="text-2xl font-semibold text-white">Absensi</span>
        </Link>

        {/* Mobile Menu Button */}
        <button
          id="menu-button"
          onClick={() => setIsOpen(!isOpen)}
          type="button"
          className="md:hidden p-2 w-10 h-10 text-white rounded-lg hover:bg-gray-600 focus:outline-none"
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
            {/* User Info */}
            {user && (
              <li className="font-semibold">
                <span className="text-white">👤 {user.name}</span>
              </li>
            )}

            {/* Logout Button */}
            <li>
              <button
                onClick={handleLogout}
                className="text-white hover:text-red-400 transition"
              >
                🚪 Log Out
              </button>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default NavBarUser;
