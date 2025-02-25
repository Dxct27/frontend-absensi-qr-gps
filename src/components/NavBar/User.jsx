import { useState } from "react";
import LogoKominfo from "../../assets/logo-kominfo.png";
import { Link } from "react-router-dom";

const NavBarUser = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="bg-gray-500 border-gray-200">
      <div className="w-screen-xl flex flex-wrap items-center justify-between  p-4">
        <a href="#" className="flex items-center space-x-3 rtl:space-x-reverse">
          <img src={LogoKominfo} className="h-[5vh]" alt="Kominfo" />
          <span className="self-center text-2xl font-semibold whitespace-nowrap text-white">
            Absensi
          </span>
        </a>
        <button
          onClick={() => setIsOpen(!isOpen)}
          type="button"
          className="inline-flex items-center p-2 w-10 h-10 justify-center text-sm text-gray-500 rounded-lg md:hidden hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200 dark:text-gray-400 "
        >
          <span className="sr-only">Open main menu</span>
          <svg
            className="w-5 h-5"
            aria-hidden="true"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 17 14"
          >
            <path
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M1 1h15M1 7h15M1 13h15"
            />
          </svg>
        </button>
        <div
          className={`${isOpen ? "block" : "hidden"} w-full md:block md:w-auto bg-gray-500`}
          id="navbar-default"
        >
          <ul className="font-medium flex flex-col p-4 md:p-0 mt-4 border border-gray-100 rounded-lg bg-gray-600 text-white md:flex-row md:space-x-8 rtl:space-x-reverse md:mt-0 md:border-0 md:bg-gray-500">
            <li>
              <Link to="#">LogOut</Link>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default NavBarUser;
