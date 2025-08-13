import React, { useState } from 'react';
import api from '../api/axiosInstance';
import { FaEnvelope, FaPhoneAlt, FaMapMarkerAlt } from 'react-icons/fa';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: '',
    mobile: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
    setSuccess('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    console.log('Submitting contact form data:', formData);
    try {
      await api.post('/contact', formData);
      setSuccess('✅ Your message has been sent successfully!');
      setFormData({ name: '', email: '', message: '', mobile: '' });
    } catch (error) {
      console.error(error);
      setError('❌ Failed to send message. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex flex-col items-center justify-start px-4 sm:px-6 lg:px-8 pt-24">
      <section className="w-full max-w-5xl grid md:grid-cols-2 gap-12 bg-white rounded-xl shadow-lg p-10">
        {/* Form Section */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <h1 className="text-3xl font-bold text-blue-800 mb-2">Get in Touch</h1>
          <input
            type="text"
            name="name"
            placeholder="Your Name"
            value={formData.name}
            onChange={handleChange}
            required
            className="w-full px-5 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-4 focus:ring-blue-300 transition"
          />
          <input
            type="email"
            name="email"
            placeholder="Your Email"
            value={formData.email}
            onChange={handleChange}
            required
            className="w-full px-5 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-4 focus:ring-blue-300 transition"
          />
          <input
            type="tel"
            name="mobile"
            placeholder="Your Mobile Number"
            value={formData.mobile}
            onChange={handleChange}
            required
            className="w-full px-5 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-4 focus:ring-blue-300 transition"
          />
          <textarea
            name="message"
            placeholder="Your Message"
            value={formData.message}
            onChange={handleChange}
            required
            rows={5}
            className="w-full px-5 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-4 focus:ring-blue-300 transition"
          />
          {error && <p className="text-red-600 text-sm">{error}</p>}
          {success && <p className="text-green-600 text-sm">{success}</p>}
          <button
            type="submit"
            disabled={loading}
            className={`w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition transform hover:-translate-y-1 hover:shadow-lg focus:outline-none focus:ring-4 focus:ring-blue-300 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {loading ? 'Sending...' : 'Send Message'}
          </button>
        </form>

        {/* Info Section */}
        <div className="text-blue-800 space-y-6">
          <h2 className="text-2xl font-semibold">Contact Information</h2>
          <p className="text-gray-600">
            We'd love to hear from you! Whether you have a question about admissions, activities, or anything else—our team is ready to help.
          </p>
          <div className="space-y-4 text-blue-700">
            <div className="flex items-center gap-3">
              <FaMapMarkerAlt className="text-xl" />
              <span>Sri Prathibha Model High School, Adarsh Nagar, Anantapur, Andhra Pradesh 515002</span>
            </div>
            <div className="flex items-center gap-3">
              <FaPhoneAlt className="text-xl" />
              <a href="tel:+917947149847" className="hover:underline">+91 79471 49847</a>
            </div>
            <div className="flex items-center gap-3">
              <FaEnvelope className="text-xl" />
              <a href="mailto:info@sriprathibha.edu.in" className="hover:underline">info@sriprathibha.edu.in</a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Contact;