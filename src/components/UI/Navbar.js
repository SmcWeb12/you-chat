import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FaUserCircle, FaSignOutAlt, FaHome, FaUsers, FaBars } from 'react-icons/fa';

const Navbar = ({ onLogout }) => {
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  // Close menus if clicked outside of the Navbar
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.navbar')) {
        setIsProfileMenuOpen(false);
        setIsMobileMenuOpen(false);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, []);

  const toggleProfileMenu = () => setIsProfileMenuOpen((prev) => !prev);
  const toggleMobileMenu = () => setIsMobileMenuOpen((prev) => !prev);

  const closeMenus = () => {
    setIsProfileMenuOpen(false);
    setIsMobileMenuOpen(false);
  };

  // Determine the active link
  const getLinkClass = (path) =>
    location.pathname === path ? 'text-yellow-400' : 'text-white';

  return (
    <nav className="bg-blue-600 p-4 flex justify-between items-center shadow-lg fixed top-0 left-0 w-full z-50 navbar">
      {/* Logo */}
      <div>
        <Link
          to="/home"
          className="text-white text-xl font-bold flex items-center"
          onClick={closeMenus}
        >
          <FaHome className="mr-2" />
        </Link>
      </div>

      {/* Hamburger Icon (Mobile Only) */}
      <div className="md:hidden">
        <button
          onClick={toggleMobileMenu}
          className="text-white text-2xl"
          aria-label="Toggle navigation menu"
        >
          <FaBars />
        </button>
      </div>

      {/* Navbar Links (Desktop and Mobile) */}
      <div
        className={`${
          isMobileMenuOpen ? 'block' : 'hidden'
        } absolute top-16 left-0 w-full bg-blue-600 md:static md:w-auto md:flex md:items-center md:gap-6`}
      >
        <Link
          to="/home"
          className={`block md:inline-block px-4 py-2 ${getLinkClass(
            '/home'
          )} hover:text-yellow-400 transition-all duration-200 ease-in-out`}
          onClick={closeMenus}
        >
          <FaHome className="inline mr-2" /> Home
        </Link>
        <Link
          to="/profile/edit"
          className={`block md:inline-block px-4 py-2 ${getLinkClass(
            '/profile/edit'
          )} hover:text-yellow-400 transition-all duration-200 ease-in-out`}
          onClick={closeMenus}
        >
          <FaUserCircle className="inline mr-2" /> Profile
        </Link>
        <Link
          to="/groupchat"
          className={`block md:inline-block px-4 py-2 ${getLinkClass(
            '/groupchat'
          )} hover:text-yellow-400 transition-all duration-200 ease-in-out`}
          onClick={closeMenus}
        >
          <FaUsers className="inline mr-2" /> Group Chat
        </Link>
        <button
          onClick={() => {
            onLogout();
            closeMenus();
          }}
          className="block md:inline-block px-4 py-2 text-white hover:text-yellow-400 transition-all duration-200 ease-in-out"
        >
          <FaSignOutAlt className="inline mr-2" /> Logout
        </button>
      </div>

      {/* Profile Dropdown (Mobile Only) */}
      <div className="md:hidden relative">
        <button
          onClick={toggleProfileMenu}
          className="text-white text-2xl"
          aria-label="Toggle profile menu"
        >
          <FaUserCircle />
        </button>
        {isProfileMenuOpen && (
          <div
            className="absolute top-16 right-0 bg-white text-black p-4 rounded-lg shadow-lg"
            onBlur={() => setIsProfileMenuOpen(false)}
            tabIndex={0}
          >
            <Link
              to="/profile/edit"
              className="block mb-2 text-gray-700 hover:text-blue-600"
              onClick={closeMenus}
            >
              Edit Profile
            </Link>
            <button
              onClick={() => {
                onLogout();
                closeMenus();
              }}
              className="block text-red-500"
            >
              Logout
            </button>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
