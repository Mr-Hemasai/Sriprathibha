import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FiMenu, FiX, FiUserPlus, FiBook, FiCalendar, FiPhone } from 'react-icons/fi';

const NavBar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const isDashboard = location.pathname.startsWith('/admin');

  const navItems = [
    { path: '/', label: 'Home', icon: FiMenu },
    { path: '/admissions', label: 'Admissions', icon: FiUserPlus },
    { path: '/academics', label: 'Academics', icon: FiBook },
    { path: '/events', label: 'Events', icon: FiCalendar },
    { path: '/contact', label: 'Contact', icon: FiPhone },
  ];

  const renderNavItem = (item) => {
    const Icon = item.icon;
    return (
      <li key={item.path} role="menuitem">
        <Link
          to={item.path}
          className={`flex items-center space-x-2 px-3 py-2 rounded-md transition-colors ${
            location.pathname === item.path
              ? 'bg-blue-50 text-blue-600'
              : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'
          }`}
        >
          <Icon className="w-5 h-5" />
          <span>{item.label}</span>
        </Link>
      </li>
    );
  };

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  return (
    <header className="sticky top-0 bg-white shadow-lg z-50 border-b border-blue-200">
      <nav className="max-w-[1200px] mx-auto flex items-center justify-between px-6 py-4" aria-label="Main navigation">
        {/* Logo Section */}
        <div className="flex items-center space-x-4 hover:opacity-90 transition duration-300">
          <img
            src="/logo.svg"
            alt="Sri Prathibha Model High School Logo"
            className="h-14 w-14 rounded-lg shadow-md"
          />
          <Link to="/" className="flex items-center space-x-2">
            <span className="text-2xl font-bold text-blue-600">Sri Prathibha</span>
            <span className="text-sm text-gray-600">Model High School</span>
          </Link>
        </div>
        
        {/* Navigation */}
        <div className="hidden md:flex items-center space-x-4">
          <ul className="flex space-x-8">
            {navItems.map(renderNavItem)}
          </ul>
          
          {!isDashboard && (
            <Link
              to="/admin/login"
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors flex items-center space-x-2"
            >
              <FiMenu className="w-5 h-5" />
              <span>Admin Login</span>
            </Link>
          )}
        </div>

        {/* Hamburger Menu Button for Mobile */}
        <button
          onClick={toggleMenu}
          className="md:hidden text-blue-800 focus:outline-none"
          aria-label={isOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={isOpen}
        >
          {isOpen ? <FiX size={28} /> : <FiMenu size={28} />}
        </button>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="md:hidden absolute top-full left-0 w-full bg-white shadow-lg border-t border-blue-200">
            <div className="px-6 py-4 space-y-4">
              <ul>
                {navItems.map(renderNavItem)}
              </ul>
              
              {!isDashboard && (
                <Link
                  to="/admin/login"
                  className="block w-full text-center bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
                >
                  Admin Login
                </Link>
              )}
            </div>
          </div>
        )}
      </nav>
    </header>
  );
};

export default NavBar;
