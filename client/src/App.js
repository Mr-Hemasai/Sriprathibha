import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Layout from './components/Layout';
import AdminLayout from './components/AdminLayout';
import ErrorBoundary from './components/ErrorBoundary';
import Home from './pages/Home';
import Academics from './pages/Academics';
import Admissions from './pages/Admissions';
import Events from './pages/Events';
import EventDetail from './pages/EventDetail';
import Contact from './pages/Contact';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';
import AdminSyllabus from './pages/AdminSyllabus';
import AdminEvents from './pages/AdminEvents';
import AdminApplications from './pages/AdminApplications';
import AdminContacts from './pages/AdminContacts';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastContainer
          position="top-right"
          autoClose={5000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="light"
        />
        <Routes>
          {/* Public Routes */}
          <Route path="/admin/login" element={<AdminLogin />} />
          
          {/* Protected Admin Routes */}
          <Route
            path="/admin/*"
            element={
              <ProtectedRoute>
                <ErrorBoundary>
                  <AdminLayout />
                </ErrorBoundary>
              </ProtectedRoute>
            }
          >
            <Route index element={<AdminDashboard />} />
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="syllabus" element={<AdminSyllabus />} />
            <Route path="events" element={<AdminEvents />} />
            <Route path="applications" element={<AdminApplications />} />
            <Route path="contacts" element={<AdminContacts />} />
          </Route>

          {/* Public Routes */}
          <Route
            path="/*"
            element={
              <ErrorBoundary>
                <Layout />
              </ErrorBoundary>
            }
          >
            <Route index element={<Home />} />
            <Route path="academics" element={<Academics />} />
            <Route path="admissions" element={<Admissions />} />
            <Route path="events" element={<Events />} />
            <Route path="events/:id" element={<EventDetail />} />
            <Route path="contact" element={<Contact />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
