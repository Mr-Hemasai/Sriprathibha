import React, { useContext, useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import { motion } from 'framer-motion';
import axiosInstance from '../api/axiosInstance';

const ProtectedRoute = ({ children }) => {
  const { token, logout } = useContext(AuthContext);
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isVerified, setIsVerified] = useState(false);

  useEffect(() => {
    const verifyToken = async () => {
      try {
        if (!token) {
          setIsVerified(false);
          return;
        }

        // Set token in localStorage immediately
        localStorage.setItem('token', token);

        // Use the full path to the auth verify endpoint
        await axiosInstance.get('/api/auth/verify');
        setIsVerified(true);
        setError('');
      } catch (err) {
        console.error('Token verification error:', err);
        if (err.response?.status === 401) {
          setError('Authentication required');
          logout();
        } else {
          setError('Failed to verify authentication');
        }
        setIsVerified(false);
      } finally {
        setLoading(false);
      }
    };

    verifyToken();
  }, [token, logout]);

  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="min-h-screen flex items-center justify-center bg-white"
      >
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </motion.div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
          <strong className="font-bold">Error!</strong>
          <span className="block sm:inline"> {error}</span>
        </div>
      </div>
    );
  }

  if (!isVerified) {
    // Redirect to login with state
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  return children;
};

export default ProtectedRoute;
