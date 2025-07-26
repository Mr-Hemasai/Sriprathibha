import React, { useState, useEffect, useContext, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../api/axiosInstance';
import { AuthContext } from '../contexts/AuthContext';
import { 
  FaSearch, 
  FaSort, 
  FaSortUp, 
  FaSortDown, 
  FaUser, 
  FaCalendarAlt, 
  FaPhone, 
  FaEnvelope, 
  FaMapMarkerAlt, 
  FaVenusMars, 
  FaSchool, 
  FaTimes,
  FaUserTie,
  FaCalendarDay,
  FaTransgender,
  FaGraduationCap,
  FaInfoCircle
} from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';

const AdminApplications = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: 'createdAt', direction: 'desc' });
  const [selectedClass, setSelectedClass] = useState('all');
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { isAuthenticated } = useContext(AuthContext);
  const navigate = useNavigate();

  // Format date to readable format
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Handle view details
  const handleViewDetails = (app) => {
    setSelectedApplication(app);
    setIsModalOpen(true);
    // Disable body scroll when modal is open
    document.body.style.overflow = 'hidden';
  };

  // Close modal
  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedApplication(null);
    // Re-enable body scroll
    document.body.style.overflow = 'unset';
  };

  // Close modal when clicking outside
  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      closeModal();
    }
  };

  // Close modal on Escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        closeModal();
      }
    };

    if (isModalOpen) {
      window.addEventListener('keydown', handleEscape);
    }

    return () => {
      window.removeEventListener('keydown', handleEscape);
    };
  }, [isModalOpen]);

  const fetchApplications = React.useCallback(async () => {
    if (!isAuthenticated) {
      navigate('/admin/login');
      return;
    }

    try {
      console.log('Fetching applications...');
      const response = await axiosInstance.get('/admissions');
      const apps = Array.isArray(response.data) ? response.data : response.data?.data || [];
      // Ensure all applications have a createdAt field
      const appsWithDate = apps.map(app => ({
        ...app,
        createdAt: app.createdAt || new Date().toISOString()
      }));
      setApplications(appsWithDate);
    } catch (err) {
      console.error('Error fetching applications:', err);
      const errorMessage = err.response?.data?.message || 'Failed to fetch applications';
      setError(errorMessage);
      
      if (err.response?.status === 401) {
        navigate('/admin/login');
      }
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    fetchApplications();
  }, [fetchApplications]);

  const handleSort = (key) => {
    setSortConfig(prevConfig => ({
      key,
      direction: prevConfig.key === key && prevConfig.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const getSortIcon = (key) => {
    if (sortConfig.key !== key) return <FaSort className="ml-1 inline opacity-30" />;
    return sortConfig.direction === 'asc' 
      ? <FaSortUp className="ml-1 inline" /> 
      : <FaSortDown className="ml-1 inline" />;
  };

  const filteredAndSortedApplications = useMemo(() => {
    let result = [...applications];
    
    // Apply search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(app => 
        Object.values(app).some(val => 
          String(val).toLowerCase().includes(term)
        )
      );
    }

    // Apply class filter
    if (selectedClass !== 'all') {
      result = result.filter(app => app.class === selectedClass);
    }

    // Apply sorting
    if (sortConfig.key) {
      result.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }

    return result;
  }, [applications, searchTerm, selectedClass, sortConfig]);

  // Get unique class values for filter
  const classOptions = useMemo(() => {
    const classes = [...new Set(applications.map(app => app.class))].filter(Boolean).sort();
    return ['all', ...classes];
  }, [applications]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-red-50 border-l-4 border-red-400 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-200 sm:flex sm:items-center sm:justify-between">
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-gray-900">Admission Applications</h2>
              <p className="mt-1 text-sm text-gray-500">
                {filteredAndSortedApplications.length} application{filteredAndSortedApplications.length !== 1 ? 's' : ''} found
              </p>
            </div>
            <div className="mt-4 sm:mt-0">
              <button
                onClick={fetchApplications}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Refresh
              </button>
            </div>
          </div>

          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
            <div className="flex flex-col space-y-4 sm:flex-row sm:space-y-0 sm:space-x-4">
              <div className="flex-1">
                <label htmlFor="search" className="sr-only">Search</label>
                <div className="relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaSearch className="h-4 w-4 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    name="search"
                    id="search"
                    className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md p-2 border"
                    placeholder="Search applications..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
              <div className="w-full sm:w-48">
                <label htmlFor="class-filter" className="sr-only">Filter by class</label>
                <select
                  id="class-filter"
                  className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                  value={selectedClass}
                  onChange={(e) => setSelectedClass(e.target.value)}
                >
                  <option value="all">All Classes</option>
                  {classOptions.filter(cls => cls !== 'all').map(cls => (
                    <option key={cls} value={cls}>
                      Class {cls}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th 
                    scope="col" 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:text-gray-700"
                    onClick={() => handleSort('studentName')}
                  >
                    <div className="flex items-center">
                      Student
                      {getSortIcon('studentName')}
                    </div>
                  </th>
                  <th 
                    scope="col" 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:text-gray-700"
                    onClick={() => handleSort('class')}
                  >
                    <div className="flex items-center">
                      Class
                      {getSortIcon('class')}
                    </div>
                  </th>
                  <th 
                    scope="col" 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:text-gray-700"
                    onClick={() => handleSort('parentName')}
                  >
                    <div className="flex items-center">
                      Parent
                      {getSortIcon('parentName')}
                    </div>
                  </th>
                  <th 
                    scope="col" 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:text-gray-700"
                    onClick={() => handleSort('createdAt')}
                  >
                    <div className="flex items-center">
                      Applied On
                      {getSortIcon('createdAt')}
                    </div>
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Details
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredAndSortedApplications.length > 0 ? (
                  filteredAndSortedApplications.map((app) => (
                    <tr key={app._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                            <FaUser className="h-5 w-5 text-blue-600" />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{app.studentName}</div>
                            <div className="text-sm text-gray-500">
                              <FaVenusMars className="inline mr-1" />
                              {app.gender || 'Not specified'}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">Class {app.class}</div>
                        <div className="text-sm text-gray-500">
                          <FaCalendarAlt className="inline mr-1" />
                          {app.dob ? new Date(app.dob).toLocaleDateString() : 'N/A'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{app.parentName}</div>
                        <div className="text-sm text-gray-500">
                          <FaPhone className="inline mr-1" />
                          {app.contact || 'N/A'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(app.createdAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => handleViewDetails(app)}
                          className="text-blue-600 hover:text-blue-900 font-medium hover:underline focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 rounded px-2 py-1 transition-colors"
                        >
                          View Details
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="px-6 py-4 text-center text-sm text-gray-500">
                      No applications found matching your criteria.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Application Details Modal */}
      <AnimatePresence>
        {isModalOpen && selectedApplication && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-50 z-40"
              onClick={handleBackdropClick}
            />
            
            {/* Modal */}
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <motion.div
                initial={{ scale: 0.95, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.95, opacity: 0, y: 20 }}
                transition={{ type: 'spring', damping: 25, stiffness: 400 }}
                className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto"
              >
                {/* Modal Header */}
                <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
                  <h3 className="text-xl font-semibold text-gray-900">
                    Application Details
                  </h3>
                  <button
                    onClick={closeModal}
                    className="text-gray-400 hover:text-gray-500 focus:outline-none"
                    aria-label="Close"
                  >
                    <FaTimes className="h-6 w-6" />
                  </button>
                </div>

                {/* Modal Body */}
                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Student Information */}
                    <div className="space-y-4">
                      <h4 className="text-lg font-medium text-gray-900 border-b pb-2 flex items-center">
                        <FaUser className="mr-2 text-blue-600" />
                        Student Information
                      </h4>
                      
                      <div className="space-y-3">
                        <DetailItem 
                          icon={FaUser} 
                          label="Full Name" 
                          value={selectedApplication.studentName} 
                        />
                        <DetailItem 
                          icon={FaCalendarDay} 
                          label="Date of Birth" 
                          value={formatDate(selectedApplication.dob)} 
                        />
                        <DetailItem 
                          icon={FaTransgender} 
                          label="Gender" 
                          value={selectedApplication.gender || 'Not specified'} 
                        />
                        <DetailItem 
                          icon={FaGraduationCap} 
                          label="Class" 
                          value={`Class ${selectedApplication.class}`} 
                        />
                        <DetailItem 
                          icon={FaSchool} 
                          label="Previous School" 
                          value={selectedApplication.previousSchool || 'N/A'} 
                        />
                      </div>
                    </div>

                    {/* Parent/Guardian Information */}
                    <div className="space-y-4">
                      <h4 className="text-lg font-medium text-gray-900 border-b pb-2 flex items-center">
                        <FaUserTie className="mr-2 text-blue-600" />
                        Parent/Guardian Information
                      </h4>
                      
                      <div className="space-y-3">
                        <DetailItem 
                          icon={FaUser} 
                          label="Name" 
                          value={selectedApplication.parentName} 
                        />
                        <DetailItem 
                          icon={FaPhone} 
                          label="Contact" 
                          value={selectedApplication.contact || 'N/A'} 
                        />
                        <DetailItem 
                          icon={FaEnvelope} 
                          label="Email" 
                          value={selectedApplication.email || 'N/A'} 
                        />
                        <DetailItem 
                          icon={FaMapMarkerAlt} 
                          label="Address" 
                          value={selectedApplication.address || 'N/A'}
                          fullWidth 
                        />
                      </div>
                    </div>
                  </div>

                  {/* Additional Information */}
                  <div className="mt-6 space-y-4">
                    <h4 className="text-lg font-medium text-gray-900 border-b pb-2 flex items-center">
                      <FaInfoCircle className="mr-2 text-blue-600" />
                      Additional Information
                    </h4>
                    
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">Application Status:</span>{' '}
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          selectedApplication.status === 'Accepted' ? 'bg-green-100 text-green-800' :
                          selectedApplication.status === 'Rejected' ? 'bg-red-100 text-red-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {selectedApplication.status || 'Pending'}
                        </span>
                      </p>
                      <p className="text-sm text-gray-600 mt-2">
                        <span className="font-medium">Submitted on:</span>{' '}
                        {new Date(selectedApplication.createdAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Modal Footer */}
                <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Close
                  </button>
                  <button
                    type="button"
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    onClick={() => {
                      // Handle action (e.g., print, download, etc.)
                      window.print();
                    }}
                  >
                    Print / Save
                  </button>
                </div>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

// Detail Item Component
const DetailItem = ({ icon: Icon, label, value, fullWidth = false }) => (
  <div className={`${fullWidth ? 'md:col-span-2' : ''}`}>
    <dt className="text-sm font-medium text-gray-500 flex items-center">
      <Icon className="mr-2 h-4 w-4 text-blue-500" />
      {label}
    </dt>
    <dd className="mt-1 text-sm text-gray-900 pl-6">
      {value || 'N/A'}
    </dd>
  </div>
);

export default AdminApplications;
