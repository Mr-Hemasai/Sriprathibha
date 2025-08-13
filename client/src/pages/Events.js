import React, { useState, useEffect } from 'react';
import api from '../api/axiosInstance';
import { FaCalendarAlt, FaSearch, FaMapMarkerAlt, FaClock } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { Link } from 'react-router-dom';
import { format, isFuture, isToday, parseISO } from 'date-fns';

const Events = () => {
  const [events, setEvents] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const [ref] = useInView({ triggerOnce: true, threshold: 0.1 });

  // Fetch events
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await api.get('/events');
        const sortedEvents = (response.data.data || []).sort((a, b) => 
          new Date(a.date) - new Date(b.date)
        );
        setEvents(sortedEvents);
        setFilteredEvents(sortedEvents);
      } catch (err) {
        console.error('Failed to fetch events', err);
        if (err.response) {
          console.error('Response data:', err.response.data);
          console.error('Response status:', err.response.status);
        }
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, []);

  // Filter and search events
  useEffect(() => {
    let result = [...events];
    
    // Apply search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(event => 
        event.title.toLowerCase().includes(term) || 
        event.description.toLowerCase().includes(term)
      );
    }

    // Apply date filter
    if (activeFilter === 'upcoming') {
      result = result.filter(event => isFuture(parseISO(event.date)) || isToday(parseISO(event.date)));
    } else if (activeFilter === 'past') {
      result = result.filter(event => !isFuture(parseISO(event.date)) && !isToday(parseISO(event.date)));
    }

    setFilteredEvents(result);
  }, [searchTerm, activeFilter, events]);

  const formatTime = (dateStr) => {
    return format(parseISO(dateStr), 'h:mm a');
  };
  
  const formatEventDate = (dateStr) => {
    return format(parseISO(dateStr), 'MMM d, yyyy');
  };

  const getEventStatus = (date) => {
    const eventDate = parseISO(date);
    if (isToday(eventDate)) return 'Today';
    if (isFuture(eventDate)) return 'Upcoming';
    return 'Past';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 px-4 py-12 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
      {/* Hero Section */}
      <section className="max-w-6xl mx-auto text-center mb-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-10"
        >
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-6">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
              School Events & Activities
            </span>
          </h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Discover exciting events, workshops, and activities happening at our school. 
            Join us for memorable learning experiences and community building.
          </p>
        </motion.div>

        {/* Search and Filter Bar */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="max-w-4xl mx-auto bg-white rounded-xl shadow-md p-6 mb-8"
        >
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaSearch className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search events..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div className="flex overflow-x-auto pb-2 md:pb-0 gap-2">
              {['all', 'upcoming', 'past'].map((filter) => (
                <button
                  key={filter}
                  onClick={() => setActiveFilter(filter)}
                  className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                    activeFilter === filter
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {filter.charAt(0).toUpperCase() + filter.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </motion.div>
      </section>

      {/* Events Grid */}
      <div ref={ref} className="max-w-7xl mx-auto">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[...Array(6)].map((_, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100 hover:shadow-xl transition-all duration-300"
              >
                <div className="h-48 bg-gray-200 animate-pulse"></div>
                <div className="p-6 space-y-4">
                  <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  <div className="h-16 bg-gray-100 rounded"></div>
                  <div className="h-10 bg-gray-200 rounded w-1/3"></div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : filteredEvents.length > 0 ? (
          <AnimatePresence>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredEvents.map((event, index) => (
                <motion.div
                  key={event._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100 hover:shadow-xl transition-all duration-300 flex flex-col h-full"
                >
                  {event.imageUrl && (
                    <div className="h-48 bg-gray-100 overflow-hidden">
                      <img 
                        src={event.imageUrl} 
                        alt={event.title}
                        className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                      />
                    </div>
                  )}
                  <div className="p-6 flex-1 flex flex-col">
                    <div className="flex justify-between items-start mb-3">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        getEventStatus(event.date) === 'Today' 
                          ? 'bg-yellow-100 text-yellow-800' 
                          : getEventStatus(event.date) === 'Upcoming'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-gray-100 text-gray-800'
                      }`}>
                        {getEventStatus(event.date)}
                      </span>
                      <span className="text-xs text-gray-500">
                        {formatEventDate(event.date)}
                      </span>
                    </div>
                    
                    <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2">
                      {event.title}
                    </h3>
                    
                    <div className="space-y-2 text-sm text-gray-600 mb-4">
                      <div className="flex items-center">
                        <FaClock className="mr-2 text-blue-500" />
                        <span>{formatTime(event.date)}</span>
                      </div>
                      {event.location && (
                        <div className="flex items-center">
                          <FaMapMarkerAlt className="mr-2 text-red-500" />
                          <span className="line-clamp-1">{event.location}</span>
                        </div>
                      )}
                    </div>
                    
                    <p className="text-gray-600 mb-6 line-clamp-3 flex-1">
                      {event.description}
                    </p>
                    <Link 
                      to={`/events/${event._id}`}
                      className="mt-auto inline-flex items-center justify-center px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                      onClick={(e) => e.stopPropagation()}
                    >
                      Learn More
                      <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                      </svg>
                    </Link>
                  </div>
                </motion.div>
              ))}
            </div>
          </AnimatePresence>
        ) : (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center text-gray-600 py-12"
          >
            <FaCalendarAlt className="mx-auto text-4xl text-gray-400 mb-4" />
            <p>No events found.</p>
            <p className="text-sm text-gray-500">Check back soon for new events!</p>
          </motion.div>
        )}
      </div>
    </div>
  </div>
  );
};

export default Events;
