import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { FaCalendarAlt, FaMapMarkerAlt, FaClock, FaArrowLeft } from 'react-icons/fa';
import { format, parseISO } from 'date-fns';

const EventDetail = () => {
  const { id } = useParams();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        console.log('Fetching event with ID:', id);
        const response = await axios.get(`http://localhost:3000/api/events/${id}`, {
          withCredentials: true,
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          }
        });
        console.log('Event data received:', response.data);
        
        if (response.data.data) {
          console.log('Event image URL:', response.data.data.imageUrl);
          setEvent(response.data.data);
        } else {
          console.error('No event data in response');
          setError('Event data is missing');
        }
      } catch (err) {
        console.error('Failed to fetch event:', err);
        if (err.response) {
          console.error('Response data:', err.response.data);
          console.error('Response status:', err.response.status);
          if (err.response.status === 403) {
            setError('Access denied. Please ensure you have the correct permissions.');
          } else if (err.response.status === 404) {
            setError('Event not found. It may have been removed or the link is incorrect.');
          } else {
            setError(`Error: ${err.response.data.message || 'Failed to load event details'}`);
          }
        } else {
          setError('Failed to connect to the server. Please check your connection.');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchEvent();
  }, [id]);

  const formatDate = (dateStr) => {
    return format(parseISO(dateStr), 'EEEE, MMMM do yyyy');
  };

  const formatTime = (dateStr) => {
    return format(parseISO(dateStr), 'h:mm a');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-10 bg-gray-200 rounded w-1/4"></div>
            <div className="h-6 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="h-64 bg-gray-200 rounded-lg"></div>
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded w-5/6"></div>
              <div className="h-4 bg-gray-200 rounded w-2/3"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">{error || 'Event not found'}</h2>
          <Link 
            to="/events" 
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <FaArrowLeft className="mr-2" />
            Back to Events
          </Link>
        </div>
      </div>
    );
  }

  // Debug log the full event object
  console.log('Full event object:', event);

  return (
    <div className="min-h-screen bg-white">
      {/* Back button */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        <Link 
          to="/events" 
          className="inline-flex items-center text-blue-600 hover:text-blue-800 transition-colors mb-4"
        >
          <FaArrowLeft className="mr-2" />
          Back to Events
        </Link>
      </div>

      {/* Event Image Banner */}
      {event.imageUrl ? (
        <div className="w-full h-96 bg-gray-200 overflow-hidden mb-8">
          <img 
            src={event.imageUrl} 
            alt={event.title}
            className="w-full h-full object-cover"
            onError={(e) => {
              console.error('Error loading image:', e);
              e.target.style.display = 'none';
              e.target.parentElement.classList.add('bg-gray-100', 'flex', 'items-center', 'justify-center');
              e.target.parentElement.innerHTML = '<p className="text-gray-500">Image not available</p>';
            }}
          />
        </div>
      ) : (
        <div className="w-full h-64 bg-gray-100 flex items-center justify-center mb-8">
          <p className="text-gray-500">No image available for this event</p>
        </div>
      )}

      {/* Event Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <article className="bg-white">
          <div className="mb-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6">
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 sm:mb-0">
                {event.title}
              </h1>
              <div className="flex items-center space-x-4">
                <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                  <FaCalendarAlt className="mr-2" />
                  {formatDate(event.date)}
                </span>
              </div>
            </div>
            
            <div className="space-y-3 mb-8">
              <div className="flex items-center text-gray-700">
                <FaClock className="mr-3 text-blue-500 w-5 h-5" />
                <span className="text-lg">{formatTime(event.date)}</span>
              </div>
              
              {event.location && (
                <div className="flex items-center text-gray-700">
                  <FaMapMarkerAlt className="mr-3 text-red-500 w-5 h-5" />
                  <span className="text-lg">{event.location}</span>
                </div>
              )}
            </div>
            
            <div className="prose max-w-none text-gray-700 text-lg leading-relaxed">
              {event.description.split('\n').map((paragraph, i) => (
                <p key={i} className="mb-4">{paragraph}</p>
              ))}
            </div>
          </div>
        </article>
      </div>
    </div>
  );
};

export default EventDetail;
