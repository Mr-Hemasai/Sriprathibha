import React, { useEffect, useState, useContext, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  FaBook, FaCalendarAlt, FaUserGraduate, 
  FaEnvelopeOpenText, FaArrowUp, FaArrowDown, FaChalkboardTeacher
} from 'react-icons/fa';
import { FiExternalLink } from 'react-icons/fi';
import axiosInstance from '../api/axiosInstance';
import { motion } from 'framer-motion';
import { AuthContext } from '../contexts/AuthContext';

const StatCard = ({ title, count, icon, color, trend, trendValue, lastUpdated }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow duration-300"
  >
    <div className="p-6">
      <div className="flex items-center justify-between">
        <div className={`p-3 rounded-lg ${color} bg-opacity-10`}>
          {React.cloneElement(icon, { className: 'text-3xl' })}
        </div>
        <span className="text-sm font-medium text-gray-500">
          {lastUpdated || 'Updated recently'}
        </span>
      </div>
      <div className="mt-4">
        <h3 className="text-base font-medium text-gray-600">{title}</h3>
        <div className="mt-2 flex items-baseline justify-between">
          <p className="text-3xl font-semibold text-gray-900">{count}</p>
          {trend && (
            <span className={`inline-flex items-baseline px-3 py-1 rounded-full text-sm font-medium ${
              trend === 'up' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
            }`}>
              {trend === 'up' ? (
                <FaArrowUp className="-ml-1 mr-1.5 flex-shrink-0 self-center" />
              ) : (
                <FaArrowDown className="-ml-1 mr-1.5 flex-shrink-0 self-center" />
              )}
              {trendValue}
            </span>
          )}
        </div>
      </div>
    </div>
  </motion.div>
);

const QuickAction = ({ icon, title, description, to, color }) => (
  <Link to={to} className="block group">
    <div className="bg-white p-6 rounded-xl border border-gray-100 hover:border-blue-100 hover:shadow-md transition-all duration-200 h-full">
      <div className={`inline-flex items-center justify-center w-14 h-14 rounded-lg ${color} bg-opacity-10 mb-5`}>
        {React.cloneElement(icon, { className: 'text-2xl' })}
      </div>
      <h3 className="text-xl font-medium text-gray-900 mb-2">{title}</h3>
      <p className="text-base text-gray-600 mb-4">{description}</p>
      <div className="inline-flex items-center text-base font-medium text-blue-600 group-hover:text-blue-800">
        Manage <FiExternalLink className="ml-2" />
      </div>
    </div>
  </Link>
);

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    syllabus: { count: 0, trend: 'up', trendValue: '12%' },
    admissions: { count: 0, trend: 'down', trendValue: '5%' },
    events: { count: 0, trend: 'up', trendValue: '8%' },
    contacts: { count: 0, trend: 'up', trendValue: '15%' },
  });
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { isAuthenticated } = useContext(AuthContext);

  // Memoized error handler to avoid re-creating on each render
  const handleError = useCallback((err) => {
    console.error('API Error:', err);
    if (err.response?.status === 401) {
      navigate('/admin/login');
    }
    return { data: {} };
  }, [navigate]);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/admin/login');
      return;
    }

    const fetchData = async () => {
      setLoading(true);
      try {
        // Simulated API calls - replace with actual API calls
        const [syllabusRes, admissionsRes, eventsRes, contactsRes] = await Promise.all([
          axiosInstance.get('/admin/syllabus/count').catch(handleError),
          axiosInstance.get('/admissions').catch(handleError),
          axiosInstance.get('/events').catch(handleError),
          axiosInstance.get('/contact').catch(handleError),
        ]);

        setStats({
          syllabus: { 
            ...stats.syllabus, 
            count: syllabusRes?.data?.count || 0 
          },
          admissions: { 
            ...stats.admissions, 
            count: admissionsRes?.data?.totalRecords || 0 
          },
          events: { 
            ...stats.events, 
            count: eventsRes?.data?.pagination?.total || eventsRes?.data?.totalRecords || 0 
          },
          contacts: { 
            ...stats.contacts, 
            count: contactsRes?.data?.totalRecords || 0 
          },
        });

        // Simulated recent activity
        setRecentActivity([
          { id: 1, type: 'syllabus', action: 'New syllabus uploaded', time: '2 hours ago', icon: <FaBook /> },
          { id: 2, type: 'admission', action: 'New application received', time: '5 hours ago', icon: <FaUserGraduate /> },
          { id: 3, type: 'event', action: 'New event created', time: '1 day ago', icon: <FaCalendarAlt /> },
          { id: 4, type: 'contact', action: 'New message received', time: '2 days ago', icon: <FaEnvelopeOpenText /> },
        ]);
      } catch (error) {
        console.error('Error fetching data:', error);
        if (error.response?.status === 401) {
          navigate('/admin/login');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [isAuthenticated, navigate, handleError]);

  const quickActions = [
    {
      title: 'Upload New Syllabus',
      description: 'Add new syllabus for different classes',
      icon: <FaBook />,
      to: '/admin/syllabus',
      color: 'text-blue-600 bg-blue-50',
    },
    {
      title: 'Create Event',
      description: 'Schedule a new school event',
      icon: <FaCalendarAlt />,
      to: '/admin/events',
      color: 'text-yellow-600 bg-yellow-50',
    },
    {
      title: 'View Applications',
      description: 'Check new admission applications',
      icon: <FaUserGraduate />,
      to: '/admin/applications',
      color: 'text-green-600 bg-green-50',
    },
    {
      title: 'Add New Teacher',
      description: 'Create a teacher profile with photo and details',
      icon: <FaChalkboardTeacher />,
      to: '/admin/teachers',
      color: 'text-pink-600 bg-pink-50',
    },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-pulse flex space-x-4 justify-center">
            <div className="rounded-full bg-blue-100 h-12 w-12"></div>
          </div>
          <p className="text-gray-600 text-sm">Loading dashboard data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="md:flex md:items-center md:justify-between mb-10">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Dashboard Overview</h1>
            <p className="mt-2 text-base text-gray-600">Welcome back! Here's what's happening with your school.</p>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-10">
          <StatCard
            title="Syllabus"
            count={stats.syllabus.count}
            icon={<FaBook className="text-blue-600" />}
            color="bg-blue-100"
            trend={stats.syllabus.trend}
            trendValue={stats.syllabus.trendValue}
            lastUpdated="Today"
          />
          <StatCard
            title="Admissions"
            count={stats.admissions.count}
            icon={<FaUserGraduate className="text-green-600" />}
            color="bg-green-100"
            trend={stats.admissions.trend}
            trendValue={stats.admissions.trendValue}
            lastUpdated="Today"
          />
          <StatCard
            title="Events"
            count={stats.events.count}
            icon={<FaCalendarAlt className="text-yellow-600" />}
            color="bg-yellow-100"
            trend={stats.events.trend}
            trendValue={stats.events.trendValue}
            lastUpdated="Today"
          />
          <StatCard
            title="Contacts"
            count={stats.contacts.count}
            icon={<FaEnvelopeOpenText className="text-purple-600" />}
            color="bg-purple-100"
            trend={stats.contacts.trend}
            trendValue={stats.contacts.trendValue}
            lastUpdated="Today"
          />
        </div>

        {/* Quick Actions */}
        <div className="mb-10">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">Quick Actions</h2>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {quickActions.map((action, index) => (
              <QuickAction key={index} {...action} />
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white shadow rounded-xl overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-200">
            <h3 className="text-xl font-semibold text-gray-900">Recent Activity</h3>
          </div>
          <div className="divide-y divide-gray-200">
            {recentActivity.map((activity) => (
              <div key={activity.id} className="px-6 py-4 hover:bg-gray-50 transition-colors duration-150">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="flex items-center justify-center h-12 w-12 rounded-full bg-blue-50 text-blue-600">
                      {React.cloneElement(activity.icon, { className: 'text-xl' })}
                    </div>
                  </div>
                  <div className="ml-4 flex-1">
                    <div className="flex items-center justify-between">
                      <p className="text-base font-medium text-gray-900">{activity.action}</p>
                      <div className="text-sm text-gray-500">{activity.time}</div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="px-6 py-4 bg-gray-50 text-right">
            <Link to="/admin/activity" className="text-base font-medium text-blue-600 hover:text-blue-500">
              View all activity
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
