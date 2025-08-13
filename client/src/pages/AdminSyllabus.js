import React, { useState, useEffect } from 'react';
import { FaFileUpload, FaChevronDown, FaPlus, FaTimes } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../api/axiosInstance';

const AdminSyllabus = () => {
  const navigate = useNavigate();
  const [selectedClass, setSelectedClass] = useState('');
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState({ text: '', type: '' });
  const [isUploading, setIsUploading] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [syllabuses, setSyllabuses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingSyllabus, setEditingSyllabus] = useState(null);

  // Fetch syllabuses from the server
  const fetchSyllabuses = async () => {
    setIsLoading(true);
    try {
      const response = await axiosInstance.get('/admin/syllabus');
      setSyllabuses(response.data);
    } catch (error) {
      console.error('Error fetching syllabuses:', error);
      setMessage({ 
        text: 'Failed to load syllabuses. Please try again.', 
        type: 'error' 
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Check authentication status and fetch syllabuses on component mount
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }
    setIsAuthenticated(true);
    fetchSyllabuses();
    
    // Add response interceptor to handle 401 Unauthorized
    const interceptor = axiosInstance.interceptors.response.use(
      response => response,
      error => {
        if (error.response && error.response.status === 401) {
          localStorage.removeItem('token');
          navigate('/login');
        }
        return Promise.reject(error);
      }
    );
    
    // Cleanup interceptor on component unmount
    return () => {
      axiosInstance.interceptors.response.eject(interceptor);
    };
  }, [navigate]);


  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      if (selectedFile.type === 'application/pdf') {
        if (selectedFile.size <= 10 * 1024 * 1024) { // 10MB limit
          setFile(selectedFile);
          setMessage({ text: '', type: '' });
        } else {
          setMessage({ text: 'File size should be less than 10MB', type: 'error' });
          e.target.value = ''; // Reset file input
        }
      } else {
        setMessage({ text: 'Please upload a PDF file', type: 'error' });
        e.target.value = ''; // Reset file input
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedClass) {
      setMessage({ text: 'Please select a class', type: 'error' });
      return;
    }
    
    if (!file && !editingSyllabus) {
      setMessage({ text: 'Please select a file to upload', type: 'error' });
      return;
    }

    const formData = new FormData();
    formData.append('class', selectedClass);
    // Force single-term model: always use term=1 on backend
    formData.append('term', '1');
    if (file) {
      formData.append('file', file);
    }

    try {
      setIsUploading(true);
      setMessage({ text: editingSyllabus ? 'Updating syllabus...' : 'Uploading syllabus...', type: 'info' });
      
      if (editingSyllabus) {
        await axiosInstance.put(`/admin/syllabus/${editingSyllabus._id}`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
      } else {
        await axiosInstance.post('/admin/syllabus', formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
      }
      
      setMessage({ 
        text: editingSyllabus 
          ? `Syllabus for Class ${selectedClass} updated successfully!`
          : `Syllabus for Class ${selectedClass} uploaded successfully!`,
        type: 'success' 
      });
      
      // Reset form and refresh the list
      resetForm();
      fetchSyllabuses();
      
    } catch (error) {
      console.error('Upload/Update error:', error);
      let errorMessage = editingSyllabus 
        ? 'Failed to update syllabus. Please try again.'
        : 'Failed to upload syllabus. Please try again.';
      
      if (error.response) {
        if (error.response.data && error.response.data.errors) {
          errorMessage = error.response.data.errors.join('\n');
        } else if (error.response.data && error.response.data.message) {
          errorMessage = error.response.data.message;
        } else if (error.response.status === 401) {
          errorMessage = 'Session expired. Please log in again.';
          setTimeout(() => navigate('/login'), 2000);
        } else if (error.response.status === 400 && error.response.data.message && 
                 (error.response.data.message.includes('already exists') || 
                  error.response.data.message.includes('duplicate'))) {
          errorMessage = 'A syllabus already exists for this class and term combination.';
        }
      } else if (error.request) {
        errorMessage = 'No response from server. Please check your connection.';
      }
      
      setMessage({ text: errorMessage, type: 'error' });
      
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this syllabus?')) {
      try {
        await axiosInstance.delete(`/admin/syllabus/${id}`);
        setMessage({ 
          text: 'Syllabus deleted successfully', 
          type: 'success' 
        });
        fetchSyllabuses();
      } catch (error) {
        console.error('Delete error:', error);
        setMessage({ 
          text: 'Failed to delete syllabus. Please try again.', 
          type: 'error' 
        });
      }
    }
  };

  const handleEdit = (syllabus) => {
    setEditingSyllabus(syllabus);
    setSelectedClass(syllabus.class.toString());
    setShowForm(true);
  };

  const resetForm = () => {
    setFile(null);
    setSelectedClass('');
    setEditingSyllabus(null);
    setShowForm(false);
    const fileInput = document.getElementById('file-upload');
    if (fileInput) fileInput.value = '';
  };

  if (!isAuthenticated) {
    return null; // or a loading spinner
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-extrabold text-gray-900">Syllabus Management</h2>
          <p className="mt-2 text-sm text-gray-600">Upload and manage class syllabuses</p>
        </div>

        {/* Add Syllabus Button */}
        <div className="flex justify-end mb-6">
          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            {showForm ? (
              <>
                <FaTimes className="mr-2" />
                Cancel
              </>
            ) : (
              <>
                <FaPlus className="mr-2" />
                Add Syllabus
              </>
            )}
          </button>
        </div>

        {/* Syllabus Form */}
        {showForm && (
          <div className="bg-white shadow rounded-lg p-6 mb-8 transition-all duration-300">
            <h3 className="text-lg font-medium text-gray-900 mb-6">
              {editingSyllabus ? 'Edit Syllabus' : 'Upload New Syllabus'}
            </h3>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Class</label>
                  <div className="relative">
                    <select
                      value={selectedClass}
                      onChange={(e) => setSelectedClass(e.target.value)}
                      className="appearance-none w-full bg-white border border-gray-300 text-gray-700 py-3 px-4 pr-8 rounded-lg leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    >
                      <option value="">Select Class</option>
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(num => (
                        <option key={num} value={num}>Class {num}</option>
                      ))}
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                      <FaChevronDown className="fill-current h-4 w-4" />
                    </div>
                  </div>
                </div>
                
                {/* Term selection removed: single PDF per class */}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Syllabus File (PDF only) {editingSyllabus && !file && <span className="text-gray-500">- Leave empty to keep existing file</span>}
                </label>
                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg">
                  <div className="space-y-1 text-center">
                    <div className="flex text-sm text-gray-600 justify-center">
                      <label className="relative cursor-pointer rounded-md bg-white font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none">
                        <span>Upload a file</span>
                        <input 
                          id="file-upload"
                          name="file-upload" 
                          type="file" 
                          className="sr-only"
                          onChange={handleFileChange}
                          accept=".pdf"
                        />
                      </label>
                      <p className="pl-1">or drag and drop</p>
                    </div>
                    <p className="text-xs text-gray-500">
                      PDF up to 10MB
                    </p>
                  </div>
                </div>
                {file && (
                  <p className="mt-2 text-sm text-green-600">
                    Selected: {file.name}
                  </p>
                )}
              </div>

              {message.text && (
                <div className={`p-4 rounded-md ${
                  message.type === 'error' ? 'bg-red-50 text-red-700' :
                  message.type === 'success' ? 'bg-green-50 text-green-700' :
                  'bg-blue-50 text-blue-700'
                }`}>
                  {message.text}
                </div>
              )}

              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUploading || !selectedClass || !file}
                  className={`w-full flex justify-center items-center gap-2 px-6 py-3 rounded-xl font-semibold text-white shadow-lg transition ${
                    isUploading || !selectedClass || !file
                      ? 'bg-blue-400 cursor-not-allowed'
                      : 'bg-blue-700 hover:bg-blue-800 transform hover:-translate-y-0.5 hover:shadow-xl'
                  }`}
                >
                  {isUploading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Uploading...
                    </>
                  ) : (
                    <>
                      <FaFileUpload className="text-lg" />
                      Upload Syllabus for Class {selectedClass || '...'}
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Syllabus List */}
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Uploaded Syllabuses</h3>
          </div>
          
          {isLoading ? (
            <div className="p-6 text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
              <p className="mt-2 text-sm text-gray-600">Loading syllabuses...</p>
            </div>
          ) : syllabuses.length === 0 ? (
            <div className="p-6 text-center">
              <p className="text-gray-500">No syllabuses found. Upload one to get started.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Class</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">File</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {syllabuses.map((syllabus) => (
                    <tr key={syllabus._id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        Class {syllabus.class}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            window.open(`/api/admin/syllabus/file/${syllabus.fileId}`, '_blank');
                          }}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          View PDF
                        </button>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => handleEdit(syllabus)}
                          className="text-indigo-600 hover:text-indigo-900 mr-4"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(syllabus._id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminSyllabus;
