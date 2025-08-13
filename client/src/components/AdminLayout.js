import React, { useContext, useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  FaTachometerAlt, FaUsers, FaBook,
  FaCalendarAlt, FaSignOutAlt, FaRegUserCircle, FaBars, FaUserGraduate
} from 'react-icons/fa';
import { AuthContext } from '../contexts/AuthContext';

const AdminLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useContext(AuthContext);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const navLinks = [
    { title: 'Dashboard', path: '/admin', icon: <FaTachometerAlt /> },
    { title: 'Syllabus', path: '/admin/syllabus', icon: <FaBook /> },
    { title: 'Events', path: '/admin/events', icon: <FaCalendarAlt /> },
    { title: 'Teachers', path: '/admin/teachers', icon: <FaUsers /> },
    { title: 'Applications', path: '/admin/applications', icon: <FaUserGraduate /> },
    { title: 'Contacts', path: '/admin/contacts', icon: <FaUsers /> },
  ];

  return (
    <div className="min-h-screen flex bg-blue-50">
      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 bg-blue-900 text-white w-64 p-4 flex flex-col transform transition-transform duration-300 ease-in-out z-30
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 md:static`}>
        <div className="flex items-center justify-between mb-6">
          <Link to="/admin" className="text-2xl font-bold hover:text-blue-300">
            Sri Prathibha Model Admin
          </Link>
          <button
            className="md:hidden focus:outline-none"
            aria-label="Close menu"
            onClick={toggleSidebar}
          >
            <FaBars size={24} />
          </button>
        </div>
        <nav className="flex flex-col space-y-3 flex-grow">
          {navLinks.map(({ title, path, icon }) => (
            <Link
              key={path}
              to={path}
              className={`flex items-center px-4 py-2.5 text-base rounded hover:bg-blue-700 transition ${
                location.pathname === path ? 'bg-blue-700' : ''
              }`}
              onClick={() => setSidebarOpen(false)}
            >
              <span className="mr-3 text-lg">{icon}</span>
              {title}
            </Link>
          ))}
        </nav>
        <div className="mt-auto">
          <div className="flex items-center space-x-3 mb-4 p-2 bg-blue-800 rounded-lg">
            <FaRegUserCircle size={28} className="flex-shrink-0" />
            <div>
              <span className="font-medium text-base">Admin User</span>
              <p className="text-sm text-blue-300">admin@sriprathibha.edu.in</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center justify-center gap-2 text-blue-100 hover:text-white transition w-full py-2.5 text-base font-medium hover:bg-blue-800 rounded-lg"
          >
            <FaSignOutAlt className="text-lg" />
            Logout
          </button>
        </div>
      </aside>

      {/* Overlay for mobile when sidebar is open */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black opacity-50 z-20 md:hidden"
          onClick={toggleSidebar}
        />
      )}

      {/* Main content */}
      <div className="flex-1 w-0 min-h-screen bg-white">
        {/* Mobile top bar */}
        <div className="md:hidden flex items-center justify-between p-3 bg-blue-900 text-white">
          <button
            className="focus:outline-none"
            aria-label="Open menu"
            onClick={toggleSidebar}
          >
            <FaBars size={20} />
          </button>
        </div>
        
        {/* Page content */}
        <div className="p-4">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;
