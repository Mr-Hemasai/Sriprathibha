import React, { useState, useContext, useEffect, useCallback } from 'react';
import axiosInstance from '../api/axiosInstance';
import { AuthContext } from '../contexts/AuthContext';
import { FiSearch, FiMail, FiPhone, FiUser, FiClock, FiChevronDown, FiChevronUp } from 'react-icons/fi';
import { toast } from 'react-toastify';

// Delete Confirmation Modal Component
const DeleteConfirmationModal = ({ isOpen, onClose, onConfirm, loading, contactName }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
            <svg
              className="h-6 w-6 text-red-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Delete Message</h3>
          <p className="text-gray-500 mb-6">
            Are you sure you want to delete {contactName ? `the message from ${contactName}` : 'this message'}? This action cannot be undone.
          </p>
          <div className="flex justify-center gap-4">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className={`px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={onConfirm}
              disabled={loading}
              className={`px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
            >
              {loading ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Deleting...
                </span>
              ) : 'Delete'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const AdminContacts = () => {
  const [contacts, setContacts] = useState([]);
  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    contactId: null,
    contactName: '',
    isDeleting: false
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [sortOrder, setSortOrder] = useState('desc');
  const [statusFilter, setStatusFilter] = useState('all');
  const [expandedMessage, setExpandedMessage] = useState(null);
  const { token } = useContext(AuthContext);

  const fetchContacts = useCallback(async () => {
    if (!token) {
      setError('User is not authenticated.');
      setLoading(false);
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      console.log('Fetching contacts with params:', {
        search,
        sort: sortOrder,
        status: statusFilter,
        limit: 100
      });
      
      const response = await axiosInstance.get('/api/contact', {
        params: {
          search: search || undefined, // Only include if not empty
          sort: sortOrder,
          status: statusFilter === 'all' ? undefined : statusFilter, // Don't send status if 'all'
          limit: 100
        },
        paramsSerializer: params => {
          const searchParams = new URLSearchParams();
          Object.entries(params).forEach(([key, value]) => {
            if (value !== undefined && value !== '') {
              searchParams.append(key, value);
            }
          });
          return searchParams.toString();
        }
      });
      
      console.log('Received contacts:', response.data);
      setContacts(Array.isArray(response.data.data) ? response.data.data : []);
    } catch (err) {
      console.error('Error fetching contacts:', err);
      const errorMessage = err.response?.data?.error || 'Failed to fetch contacts. Please try again.';
      setError(errorMessage);
      toast.error(errorMessage);
      setContacts([]);
    } finally {
      setLoading(false);
    }
  }, [token, search, sortOrder, statusFilter]);

  // Fetch contacts when filter or sort changes
  useEffect(() => {
    fetchContacts();
  }, [fetchContacts, statusFilter, sortOrder]);

  // Debounce search input
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchContacts();
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [fetchContacts, search]);

  const toggleMessage = (id) => {
    setExpandedMessage(expandedMessage === id ? null : id);
  };

  const updateContactStatus = async (id, status) => {
    if (!id) {
      console.error('No contact ID provided for status update');
      return false;
    }
    
    try {
      console.log('Sending PATCH request to:', `/api/contact/${id}`);
      const response = await axiosInstance.patch(
        `/api/contact/${id}`,
        { status },
        {
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
          withCredentials: true,
          validateStatus: (status) => status < 500 // Accept all status codes less than 500 for error handling
        }
      );
      
      console.log('Response status:', response.status);
      console.log('Response data:', response.data);
      
      if (response.status >= 200 && response.status < 300) {
        // Update the local state to reflect the status change
        setContacts(prevContacts =>
          prevContacts.map(contact =>
            contact._id === id ? { ...contact, status } : contact
          )
        );
        return true;
      } else {
        console.error('Unexpected response status:', response.status);
        toast.error(`Failed to update message status: ${response.status} ${response.statusText}`);
        return false;
      }
    } catch (error) {
      console.error('Error updating contact status:', error);
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        console.error('Error response data:', error.response.data);
        console.error('Error response status:', error.response.status);
        console.error('Error response headers:', error.response.headers);
        toast.error(`Server error: ${error.response.status} - ${error.response.data?.message || 'Unknown error'}`);
      } else if (error.request) {
        // The request was made but no response was received
        console.error('No response received:', error.request);
        toast.error('No response from server. Please check your connection.');
      } else {
        // Something happened in setting up the request that triggered an Error
        console.error('Request setup error:', error.message);
        toast.error(`Request error: ${error.message}`);
      }
      return false;
    }
  };

  const markAsRead = async (id, e) => {
    e.stopPropagation();
    try {
      await updateContactStatus(id, 'read');
      toast.success('Marked as read');
    } catch (err) {
      toast.error('Failed to update status');
    }
  };

  const openDeleteModal = (id, name, e) => {
    if (e) e.stopPropagation();
    setDeleteModal({
      isOpen: true,
      contactId: id,
      contactName: name,
      isDeleting: false
    });
  };

  const closeDeleteModal = () => {
    if (deleteModal.isDeleting) return; // Prevent closing while deleting
    setDeleteModal({
      isOpen: false,
      contactId: null,
      contactName: '',
      isDeleting: false
    });
  };

  const deleteContact = async () => {
    const { contactId } = deleteModal;
    if (!contactId) return;
    
    setDeleteModal(prev => ({ ...prev, isDeleting: true }));
    
    try {
      console.log('Sending DELETE request to:', `/api/contact/${contactId}`);
      const response = await axiosInstance.delete(`/api/contact/${contactId}`, {
        withCredentials: true,
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });
      
      console.log('Delete response:', response.data);
      
      if (response.status === 200) {
        // Remove the deleted contact from the local state
        setContacts(prevContacts => prevContacts.filter(contact => contact._id !== contactId));
        toast.success('Message deleted successfully');
        closeDeleteModal();
      } else {
        throw new Error(response.data?.error || 'Failed to delete message');
      }
    } catch (error) {
      console.error('Error deleting contact:', error);
      const errorMessage = error.response?.data?.error || error.message || 'Failed to delete message';
      toast.error(errorMessage);
      setDeleteModal(prev => ({ ...prev, isDeleting: false }));
    }
  };

  if (loading && contacts.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <>
      <DeleteConfirmationModal
        isOpen={deleteModal.isOpen}
        onClose={closeDeleteModal}
        onConfirm={deleteContact}
        loading={deleteModal.isDeleting}
        contactName={deleteModal.contactName}
      />
      <div className="p-4 md:p-6">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          {/* Header */}
          <div className="px-6 py-5 border-b border-gray-100">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h2 className="text-2xl font-semibold text-gray-800">Contact Messages</h2>
                <p className="text-gray-500 mt-1">Manage and respond to inquiries from visitors</p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1 max-w-md">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiSearch className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    placeholder="Search messages..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                
                <div className="flex items-center gap-2">
                  <div className="relative w-full">
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      disabled={loading}
                      className={`block w-full pl-3 pr-10 py-2 text-base border ${loading ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'} rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
                    >
                      <option value="all">All Messages</option>
                      <option value="unread">Unread</option>
                      <option value="read">Read</option>
                    </select>
                    {loading && (
                      <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                        <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                      </div>
                    )}
                  </div>
                  
                  <button
                    onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                    className="flex items-center gap-1 px-3 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <FiClock className="h-5 w-5 text-gray-500" />
                    <span className="text-sm font-medium text-gray-700">
                      {sortOrder === 'asc' ? 'Oldest' : 'Newest'}
                    </span>
                    {sortOrder === 'asc' ? (
                      <FiChevronUp className="h-4 w-4 text-gray-500" />
                    ) : (
                      <FiChevronDown className="h-4 w-4 text-gray-500" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
          
          {/* Messages List */}
          <div className="divide-y divide-gray-100">
            {error ? (
              <div className="p-6 text-center text-red-600">
                {error}
              </div>
            ) : contacts.length === 0 ? (
              <div className="p-12 text-center">
                <div className="mx-auto h-24 w-24 text-gray-300">
                  <FiMail className="w-full h-full" />
                </div>
                <h3 className="mt-2 text-lg font-medium text-gray-900">No messages found</h3>
                <p className="mt-1 text-gray-500">All caught up! No contact messages to display.</p>
              </div>
            ) : (
              contacts.map((contact) => (
                <div 
                  key={contact._id}
                  className={`p-5 hover:bg-gray-50 cursor-pointer transition-colors ${contact.status === 'unread' ? 'bg-blue-50' : ''}`}
                  onClick={() => toggleMessage(contact._id)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3">
                        <div className="flex-shrink-0 h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                          <FiUser className="h-5 w-5 text-blue-600" />
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <h3 className="text-base font-medium text-gray-900 truncate">
                              {contact.name}
                            </h3>
                            {contact.status === 'unread' && (
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                New
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-500 flex items-center gap-1">
                            <FiMail className="h-3.5 w-3.5" />
                            <span className="truncate">{contact.email}</span>
                          </p>
                        </div>
                      </div>
                      
                      {expandedMessage === contact._id && (
                        <div className="mt-3 pl-13">
                          <div className="bg-gray-50 p-4 rounded-lg">
                            <p className="text-gray-700 whitespace-pre-line">{contact.message}</p>
                            {contact.phone && (
                              <p className="mt-2 text-sm text-gray-600 flex items-center gap-2">
                                <FiPhone className="h-4 w-4" />
                                {contact.phone}
                              </p>
                            )}
                            <div className="mt-3 pt-3 border-t border-gray-200 flex justify-between items-center">
                              <span className="text-xs text-gray-500">
                                {new Date(contact.createdAt).toLocaleString()}
                              </span>
                              <div className="flex gap-2">
                                <a 
                                  href={`mailto:${contact.email}`}
                                  onClick={(e) => e.stopPropagation()}
                                  className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-xs font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                >
                                  Reply
                                </a>
                                {contact.status === 'unread' && (
                                  <button
                                    onClick={(e) => markAsRead(contact._id, e)}
                                    className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                  >
                                    Mark as Read
                                  </button>
                                )}
                                <button
                                  onClick={(e) => openDeleteModal(contact._id, contact.name, e)}
                                  className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-red-700 hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                                >
                                  Delete
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                    
                    <div className="ml-4 flex-shrink-0 flex">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleMessage(contact._id);
                        }}
                        className="text-gray-400 hover:text-gray-500"
                      >
                        {expandedMessage === contact._id ? (
                          <FiChevronUp className="h-5 w-5" />
                        ) : (
                          <FiChevronDown className="h-5 w-5" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
          
          {/* Pagination (you can implement this later) */}
          {contacts.length > 0 && (
            <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
              <div className="text-sm text-gray-700">
                Showing <span className="font-medium">1</span> to <span className="font-medium">{contacts.length}</span> of{' '}
                <span className="font-medium">{contacts.length}</span> results
              </div>
              <div className="flex space-x-2">
                <button className="px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
                  Previous
                </button>
                <button className="px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
                  Next
                </button>
              </div>
            </div>
          )}
          </div>
        </div>
      </div>
    </>
  );
};

export default AdminContacts;
