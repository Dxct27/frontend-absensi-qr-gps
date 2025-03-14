import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext"; // Use useAuth hook
import LogoKominfo from "../../assets/logo-kominfo.png";

const NavBarAdmin = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout(); // ✅ Standardized logout function
    } catch (error) {
      console.error("Logout failed!", error);
      alert("Logout failed! Please try again.");
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
        <Link to="#" className="flex items-center space-x-3">
          <img src={LogoKominfo} className="h-[5vh]" alt="Kominfo" />
          <span className="text-2xl font-semibold text-white">
            Absensi Admin
          </span>
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
            <li>
              <Link to="/adminpanel" className="hover:text-gray-300">
                Dashboard
              </Link>
            </li>
            <li>
              <Link to="/qrcode" className="hover:text-gray-300">
                QR
              </Link>
            </li>

            {/* User Info */}
            {user && (
              <li className="font-semibold">
                <span className="text-white">👤 {user.name}</span>
              </li>
            )}

            {/* Logout Button */}
            <li>
              <button
                onClick={handleLogout} // ✅ Call the function properly
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

export default NavBarAdmin;
