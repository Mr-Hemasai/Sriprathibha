import React from 'react';
import { Outlet, useNavigate, Link } from 'react-router-dom';
import { FaUserShield, FaBook, FaCalendarAlt, FaUserGraduate, FaEnvelopeOpenText, FaSignOutAlt } from 'react-icons/fa';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-toastify';

const AdminLayout = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to logout?')) {
      logout();
      navigate('/admin/login');
      toast.success('Logged out successfully!');
    }
  };

  const menuItems = [
    { 
      title: 'Dashboard', 
      icon: <FaBook />, 
      path: '/admin/dashboard' 
    },
    { 
      title: 'Syllabus', 
      icon: <FaBook />, 
      path: '/admin/syllabus' 
    },
    { 
      title: 'Admissions', 
      icon: <FaUserGraduate />, 
      path: '/admin/admissions' 
    },
    { 
      title: 'Events', 
      icon: <FaCalendarAlt />, 
      path: '/admin/events' 
    },
    { 
      title: 'Contacts', 
      icon: <FaEnvelopeOpenText />, 
      path: '/admin/contacts' 
    }
  ];

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-52 bg-white shadow flex-shrink-0 border-r border-gray-200">
        <div className="p-2">
          <div className="flex items-center space-x-2 mb-4 p-2">
            <FaUserShield className="text-xl text-blue-600" />
            <span className="text-base font-semibold">Admin</span>
          </div>
          
          <nav className="space-y-0.5">
            {menuItems.map((item) => (
              <Link 
                key={item.title}
                to={item.path}
                className="flex items-center space-x-2 px-2 py-1.5 text-gray-700 hover:bg-blue-50 rounded transition-colors text-xs"
              >
                {item.icon}
                <span>{item.title}</span>
              </Link>
            ))}
          </nav>

          <div className="mt-4 pt-2 border-t border-gray-100">
            <button 
              onClick={handleLogout}
              className="flex items-center space-x-2 w-full px-2 py-1.5 text-red-600 hover:bg-red-50 rounded transition-colors text-xs"
            >
              <FaSignOutAlt className="text-sm" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto bg-gray-50 p-0">
        <div className="p-3">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
