import React, { useState, useEffect, useRef } from 'react';
import axiosInstance from '../api/axiosInstance';
import { FaEdit, FaTrash, FaCalendarAlt, FaImage, FaUpload, FaMapMarkerAlt, FaTags } from 'react-icons/fa';

// Initial states
const initialDeleteDialog = {
  isOpen: false,
  eventId: null,
  eventTitle: ''
};

const initialFormState = {
  _id: '',
  title: '',
  date: '',
  description: '',
  location: '',
  categories: '',
  picture: null,
  imagePreview: null
};

const AdminEvents = () => {
  // State management
  const [events, setEvents] = useState([]);
  const [form, setForm] = useState(initialFormState);
  const [message, setMessage] = useState({ text: '', type: '' });
  const [deleteDialog, setDeleteDialog] = useState(initialDeleteDialog);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef(null);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get('/events');
      setEvents(response.data.data || []);
    } catch (error) {
      console.error('Failed to fetch events', error);
      setMessage({ text: 'Failed to load events', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const handleDelete = async () => {
    if (deleteDialog.eventId) {
      try {
        setLoading(true);
        await axiosInstance.delete(`/events/${deleteDialog.eventId}`);
        setMessage({ text: 'Event deleted successfully!', type: 'success' });
        fetchEvents();
      } catch (error) {
        console.error('Error deleting event:', error);
        const errorMessage = error.response?.data?.error || 'Failed to delete event';
        setMessage({ text: errorMessage, type: 'error' });
      } finally {
        setLoading(false);
      }
      setDeleteDialog({
        isOpen: false,
        eventId: null,
        eventTitle: ''
      });
    }
  };

  const openDeleteDialog = (id, title) => {
    setDeleteDialog({
      isOpen: true,
      eventId: id,
      eventTitle: title
    });
  };

  const closeDeleteDialog = () => {
    setDeleteDialog({
      isOpen: false,
      eventId: null,
      eventTitle: ''
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setForm(prev => ({
          ...prev,
          picture: file,
          imagePreview: reader.result
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current.click();
  };

  const resetForm = () => {
    setForm(initialFormState);
    setMessage({ text: '', type: '' });
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleEdit = (event) => {
    setForm({
      _id: event._id,
      title: event.title,
      date: event.date.split('T')[0],
      description: event.description,
      location: event.location || '',
      categories: event.categories ? event.categories.join(', ') : '',
      picture: null,
      imagePreview: event.imageUrl || null
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Form validation
    const errors = [];
    if (!form.title.trim()) errors.push('Title is required');
    if (!form.date) errors.push('Date is required');
    if (!form.description.trim()) errors.push('Description is required');

    if (errors.length > 0) {
      setMessage({ text: errors.join('\n'), type: 'error' });
      return;
    }

    setLoading(true);
    setMessage({ text: '', type: '' });
    
    try {
      const formData = new FormData();
      
      // Add all form fields
      formData.append('title', form.title.trim());
      formData.append('date', form.date);
      formData.append('description', form.description.trim());
      
      // Add optional fields if they exist
      if (form.location) formData.append('location', form.location.trim());
      if (form.categories) {
        const categoriesArray = Array.isArray(form.categories) 
          ? form.categories 
          : form.categories.split(',').map(cat => cat.trim()).filter(Boolean);
        formData.append('categories', JSON.stringify(categoriesArray));
      }
      
      // Add file if it exists
      if (form.picture) {
        formData.append('picture', form.picture, form.picture.name);
      }

      // Log form data for debugging
      console.log('Submitting form data:');
      for (let [key, value] of formData.entries()) {
        console.log(key, value);
      }

      const config = {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Accept': 'application/json'
        },
        withCredentials: true
      };

      let response;
      if (form._id) {
        // Update existing event
        response = await axiosInstance.put(`/events/${form._id}`, formData, config);
        setMessage({ text: 'Event updated successfully!', type: 'success' });
      } else {
        // Create new event
        response = await axiosInstance.post('/events', formData, config);
        setMessage({ text: 'Event created successfully!', type: 'success' });
      }
      
      console.log('Server response:', response.data);
      resetForm();
      await fetchEvents();
    } catch (error) {
      console.error('Error saving event:', error);
      const errorMessage = error.response?.data?.error || 
                          error.response?.data?.message || 
                          error.message || 
                          'Failed to save event';
      
      // Handle validation errors
      if (error.response?.data?.details) {
        const details = Array.isArray(error.response.data.details) 
          ? error.response.data.details.join('\n') 
          : error.response.data.details;
        setMessage({ 
          text: `${errorMessage}:\n${details}`,
          type: 'error' 
        });
      } else {
        setMessage({ 
          text: errorMessage,
          type: 'error' 
        });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-gray-800">Manage Events</h1>
      
      {/* Delete Confirmation Dialog */}
      {deleteDialog.isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 transform transition-all duration-300 scale-100">
            <div className="flex items-center justify-center w-16 h-16 mx-auto bg-red-100 rounded-full mb-4">
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-center text-gray-900 mb-2">Delete Event</h3>
            <p className="text-gray-600 text-center mb-6">
              Are you sure you want to delete <span className="font-semibold">"{deleteDialog.eventTitle}"</span>? This action cannot be undone.
            </p>
            <div className="flex justify-center space-x-4">
              <button
                onClick={closeDeleteDialog}
                className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors flex items-center gap-2"
              >
                <FaTrash className="w-4 h-4" />
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Message Alert */}
      {message.text && (
        <div 
          className={`p-4 mb-6 rounded-lg shadow-md ${
            message.type === 'error' 
              ? 'bg-red-50 border-l-4 border-red-500 text-red-700' 
              : 'bg-green-50 border-l-4 border-green-500 text-green-700'
          }`}
        >
          <div className="flex">
            <div className="flex-shrink-0">
              {message.type === 'error' ? (
                <svg className="h-5 w-5 text-red-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              ) : (
                <svg className="h-5 w-5 text-green-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              )}
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium">
                {message.text}
              </p>
            </div>
          </div>
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="bg-white shadow-md rounded-lg p-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-6">
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="title">
                Title *
              </label>
              <input
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                id="title"
                type="text"
                name="title"
                value={form.title}
                onChange={handleInputChange}
                placeholder="Event title"
                required
              />
            </div>
            
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="date">
                Date *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaCalendarAlt className="text-gray-400" />
                </div>
                <input
                  className="shadow appearance-none border rounded w-full py-2 pl-10 pr-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  id="date"
                  type="date"
                  name="date"
                  value={form.date}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>
            
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="location">
                Location
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaMapMarkerAlt className="text-gray-400" />
                </div>
                <input
                  className="shadow appearance-none border rounded w-full py-2 pl-10 pr-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  id="location"
                  type="text"
                  name="location"
                  value={form.location}
                  onChange={handleInputChange}
                  placeholder="Event location"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="categories">
                Categories (comma separated)
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaTags className="text-gray-400" />
                </div>
                <input
                  className="shadow appearance-none border rounded w-full py-2 pl-10 pr-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  id="categories"
                  type="text"
                  name="categories"
                  value={form.categories}
                  onChange={handleInputChange}
                  placeholder="e.g., Sports, Academic, Cultural"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Event Image
              </label>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/*"
                className="hidden"
                id="picture"
              />
              <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                <div className="space-y-1 text-center">
                  {form.imagePreview ? (
                    <div className="relative">
                      <img 
                        src={form.imagePreview} 
                        alt="Preview" 
                        className="mx-auto h-48 w-full object-cover rounded-md"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setForm(prev => ({ ...prev, imagePreview: null, picture: null }));
                          if (fileInputRef.current) fileInputRef.current.value = '';
                        }}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                      >
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  ) : (
                    <>
                      <div className="flex justify-center">
                        <FaImage className="mx-auto h-12 w-12 text-gray-400" />
                      </div>
                      <div className="flex text-sm text-gray-600">
                        <button
                          type="button"
                          onClick={triggerFileInput}
                          className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none"
                        >
                          <span>Upload an image</span>
                        </button>
                        <p className="pl-1">or drag and drop</p>
                      </div>
                      <p className="text-xs text-gray-500">
                        PNG, JPG, GIF up to 5MB
                      </p>
                    </>
                  )}
                </div>
              </div>
              {form.id && !form.picture && !form.imagePreview && (
                <p className="mt-2 text-sm text-gray-500">Current image will be kept if no new image is selected.</p>
              )}
            </div>
          </div>
          
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="description">
              Description *
            </label>
            <textarea
              className="shadow appearance-none border rounded w-full h-64 py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              id="description"
              name="description"
              value={form.description}
              onChange={handleInputChange}
              placeholder="Enter event description..."
              required
            />
          </div>
        </div>
        
        <div className="flex items-center justify-end mt-6 space-x-4">
          {form.id && (
            <button
              type="button"
              onClick={resetForm}
              disabled={loading}
              className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline disabled:opacity-50"
            >
              Cancel
            </button>
          )}
          <button
            type="submit"
            disabled={loading}
            className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-6 rounded focus:outline-none focus:shadow-outline disabled:opacity-50 flex items-center"
          >
            {loading ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processing...
              </>
            ) : form.id ? (
              <><FaEdit className="mr-2" /> Update Event</>
            ) : (
              <><FaUpload className="mr-2" /> Add Event</>
            )}
          </button>
        </div>
      </form>
      
      <div className="bg-white shadow-md rounded-lg p-6">
        <h2 className="text-2xl font-bold mb-6 text-gray-800">Events List</h2>
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : events.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No events found. Add your first event above.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((event) => (
              <div key={event._id} className="border rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300">
                {event.imageUrl ? (
                  <div className="h-48 bg-gray-100 overflow-hidden">
                    <img 
                      src={event.imageUrl} 
                      alt={event.title}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.parentElement.innerHTML = (
                          '<div class="w-full h-full flex items-center justify-center bg-gray-100">' +
                          '<FaImage className="text-gray-300 text-4xl" />' +
                          '</div>'
                        );
                      }}
                    />
                  </div>
                ) : (
                  <div className="h-48 bg-gray-100 flex items-center justify-center">
                    <FaImage className="text-gray-300 text-4xl" />
                  </div>
                )}
                <div className="p-4">
                  <h3 className="text-xl font-semibold text-gray-800 mb-2 line-clamp-2">{event.title}</h3>
                  <p className="text-gray-600 text-sm mb-2">
                    <FaCalendarAlt className="inline mr-1" />
                    {new Date(event.date).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </p>
                  {event.location && (
                    <p className="text-gray-600 text-sm mb-3">
                      <FaMapMarkerAlt className="inline-block mr-1 -mt-1" />
                      {event.location}
                    </p>
                  )}
                  <p className="text-gray-700 text-sm line-clamp-3 mb-4">{event.description}</p>
                  <div className="flex justify-between items-center">
                    <div className="flex flex-wrap gap-2">
                      {event.categories?.map((category, idx) => (
                        <span key={idx} className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded">
                          {category}
                        </span>
                      ))}
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEdit(event)}
                        disabled={loading}
                        className="text-blue-600 hover:text-blue-800 p-1 rounded-full hover:bg-blue-50"
                        title="Edit"
                      >
                        <FaEdit />
                      </button>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          openDeleteDialog(event._id, event.title);
                        }}
                        className="text-red-600 hover:text-red-800 p-2 rounded-full hover:bg-red-50 transition-colors"
                        title="Delete Event"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminEvents;
