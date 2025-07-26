import React from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import NavBar from './NavBar';

const Layout = () => {
  const location = useLocation();
  const isDashboard = location.pathname.startsWith('/admin');

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white">
      <NavBar />
      
      <main className="flex flex-col flex-1">
        <div className="container mx-auto px-4 py-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="flex-grow"
          >
            <Outlet />
          </motion.div>
        </div>
      </main>

      {!isDashboard && (
        <footer className="bg-white text-center py-8 border-t border-blue-100">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
              <div>
                <h3 className="text-lg font-semibold mb-4">About Us</h3>
                <p className="text-gray-600 text-sm">
                  Sri Prathibha Model High School is dedicated to providing quality education and fostering holistic development.
                </p>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
                <ul className="space-y-2">
                  <li>
                    <Link to="/about" className="text-gray-600 hover:text-blue-600 transition-colors">
                      About Us
                    </Link>
                  </li>
                  <li>
                    <Link to="/admissions" className="text-gray-600 hover:text-blue-600 transition-colors">
                      Admissions
                    </Link>
                  </li>
                  <li>
                    <Link to="/academics" className="text-gray-600 hover:text-blue-600 transition-colors">
                      Academics
                    </Link>
                  </li>
                  <li>
                    <Link to="/events" className="text-gray-600 hover:text-blue-600 transition-colors">
                      Events
                    </Link>
                  </li>
                </ul>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold mb-4">Contact Info</h3>
                <ul className="space-y-2 text-gray-600">
                  <li>
                    <span className="font-medium">Address:</span> Adarsh Nagar, Anantapur, Andhra Pradesh 515002
                  </li>
                  <li>
                    <span className="font-medium">Phone:</span> +91 79471 49847
                  </li>
                  <li>
                    <span className="font-medium">Email:</span> info@sriprathibha.edu.in
                  </li>
                </ul>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold mb-4">Follow Us</h3>
                <div className="flex space-x-4 justify-center">
                  <button type="button" className="text-gray-600 hover:text-blue-600 transition-colors p-1 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2">
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                    </svg>
                  </button>
                  <button type="button" className="text-gray-600 hover:text-blue-600 transition-colors p-1 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2">
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                    </svg>
                  </button>
                  <button type="button" className="text-gray-600 hover:text-blue-600 transition-colors p-1 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2">
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 0C8.745 0 8.333.015 7.053.073 5.77.134 4.907.437 4.13 1.053c-.78.617-1.063 1.65-1.053 2.627.015.977.283 1.836.737 2.627l.143.357c.046.112.087.223.13.335.046.112.087.223.13.335l.143.357c.454 1.092 1.049 2.008 1.777 2.627.729.619 1.626.93 2.627.915.977-.015 1.836-.283 2.627-.737l.357-.143c.112-.046.223-.087.335-.13.112-.046.223-.087.335-.13l.357-.143C15.663.283 14.255.03 12.008 0h-.015zm-7.953 15.93c-.797 0-1.44-.656-1.44-1.457 0-.797.643-1.44 1.44-1.44.797 0 1.44.643 1.44 1.44 0 .797-.643 1.457-1.44 1.457zm13.906 0c-.797 0-1.44-.656-1.44-1.457 0-.797.643-1.44 1.44-1.44.797 0 1.44.643 1.44 1.44 0 .797-.643 1.457-1.44 1.457z"/>
                    </svg>
                  </button>
                </div>
              </div>
            </div>
            
            <div className="border-t border-blue-100 mt-8 pt-8">
              <p className="text-gray-600 text-sm mb-1">&copy; {new Date().getFullYear()} Sri Prathibha Model High School. All rights reserved.</p>
              <p className="text-blue-600 text-sm">
                <Link to="/contact" className="hover:underline">Contact Us</Link> | <Link to="/about" className="hover:underline">About</Link>
              </p>
            </div>
          </div>
        </footer>
      )}
    </div>
  );
};

export default Layout;
