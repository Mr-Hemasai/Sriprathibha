import React from 'react';
import axiosInstance from '../api/axiosInstance';
import { FaUserGraduate, FaUserTie, FaAddressCard } from 'react-icons/fa';
import useAdmissionForm from '../hooks/useAdmissionForm';
import { toast } from 'react-toastify';

const Admissions = () => {
  const {
    formData,
    loading,
    error,
    success,
    handleChange,
    setLoading,
    setError,
    setSuccess,
    resetForm,
  } = useAdmissionForm({
    studentName: '',
    dob: '',
    gender: '',
    className: '',
    parentName: '',
    contact: '',
    email: '',
    address: '',
    previousSchool: '',
  });

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    // Ensure the date is valid
    if (isNaN(date.getTime())) {
      throw new Error('Invalid date');
    }
    // Format as YYYY-MM-DD
    return date.toISOString().split('T')[0];
  };

  const validateForm = (data) => {
    const errors = [];
    
    // Required fields
    if (!data.studentName?.trim()) errors.push('Student name is required');
    if (!data.dob) errors.push('Date of birth is required');
    if (!data.class?.trim()) errors.push('Class is required');
    if (!data.parentName?.trim()) errors.push('Parent/Guardian name is required');
    if (!data.address?.trim()) errors.push('Address is required');
    
    // Contact validation
    if (data.contact && !/^[0-9]{10}$/.test(data.contact)) {
      errors.push('Contact must be a valid 10-digit number');
    }
    
    // Email validation
    if (data.email && !/^[\w-]+(\.[\w-]+)*@([\w-]+\.)+[\w-]{2,4}$/.test(data.email)) {
      errors.push('Please enter a valid email address');
    }
    
    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    
    try {
      // Format the date and validate inputs
      const formattedDob = formData.dob ? formatDate(formData.dob) : '';
      
      // Prepare the data in the format expected by the server
      const submissionData = {
        studentName: formData.studentName.trim(),
        dob: formattedDob,
        class: formData.className.trim(),
        parentName: formData.parentName.trim(),
        address: formData.address.trim(),
        gender: formData.gender || '',
        contact: formData.contact?.trim() || '',
        email: formData.email?.trim().toLowerCase() || '',
        previousSchool: formData.previousSchool?.trim() || ''
      };
      
      // Validate form data
      const validationErrors = validateForm(submissionData);
      if (validationErrors.length > 0) {
        throw new Error(validationErrors.join('\n'));
      }

      try {
        console.log('Submitting admission form:', submissionData);
        
        // Use the full path to the admissions endpoint
        const response = await axiosInstance.post('/admissions', submissionData, {
          headers: {
            'Content-Type': 'application/json'
          }
        });
        
        console.log('Submission successful:', response.data);
        setSuccess('✅ Admission form submitted successfully!');
        resetForm();
        toast.success('Admission form submitted successfully!');
      } catch (err) {
        console.error('Submission error:', {
          error: err,
          response: err.response?.data,
          status: err.response?.status,
          statusText: err.response?.statusText,
          headers: err.response?.headers
        });
        
        let errorMessage = 'Failed to submit the form. Please try again.';
        
        if (err.response) {
          // The request was made and the server responded with a status code
          if (err.response.data && err.response.data.error) {
            errorMessage = err.response.data.error;
          } else if (err.response.status === 400) {
            errorMessage = 'Invalid form data. Please check your inputs.';
            if (err.response.data?.errors) {
              errorMessage += '\n' + Object.values(err.response.data.errors).join('\n');
            }
          } else if (err.response.status === 401) {
            errorMessage = 'Please log in to submit the form.';
          } else if (err.response.status === 500) {
            errorMessage = 'Server error. Please try again later.';
          }
        } else if (err.request) {
          // The request was made but no response was received
          errorMessage = 'No response from server. Please check your connection.';
        } else {
          // Something happened in setting up the request that triggered an Error
          errorMessage = err.message || 'An error occurred while submitting the form.';
        }
        
        setError(`❌ ${errorMessage}`);
        toast.error(errorMessage);
      } finally {
        setLoading(false);
      }
    } catch (err) {
      console.error('Validation error:', err);
      setError(`❌ ${err.message}`);
      toast.error(err.message);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white px-4 py-12 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-4xl font-extrabold text-center text-blue-800 mb-6">
          Apply for Admission
        </h1>
        <p className="text-gray-700 text-center mb-10 max-w-xl mx-auto">
          Fill out the form below to apply for admission at Sri Prathibha Model High School.
        </p>

        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-2xl shadow-xl p-8 space-y-8"
        >
          {/* Student Info */}
          <section>
            <h2 className="flex items-center gap-2 text-lg font-semibold text-blue-700 border-b pb-2 mb-4">
              <FaUserGraduate />
              Student Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Student Name</label>
                <input
                  type="text"
                  name="studentName"
                  value={formData.studentName}
                  onChange={handleChange}
                  required
                  placeholder="Full name"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
                <input
                  type="date"
                  name="dob"
                  value={formData.dob}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
                >
                  <option value="">Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Class</label>
                <select
                  name="className"
                  value={formData.className}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
                >
                  <option value="">Select Class</option>
                  <option value="Nursery">Nursery</option>
                  <option value="LKG">LKG</option>
                  <option value="UKG">UKG</option>
                  <option value="1">Class 1</option>
                  <option value="2">Class 2</option>
                  <option value="3">Class 3</option>
                  <option value="4">Class 4</option>
                  <option value="5">Class 5</option>
                  <option value="6">Class 6</option>
                  <option value="7">Class 7</option>
                  <option value="8">Class 8</option>
                  <option value="9">Class 9</option>
                  <option value="10">Class 10</option>
                </select>
              </div>
            </div>
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Previous School</label>
              <input
                type="text"
                name="previousSchool"
                value={formData.previousSchool}
                onChange={handleChange}
                placeholder="Last attended school"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
              />
            </div>
          </section>

          {/* Parent/Guardian Info */}
          <section>
            <h2 className="flex items-center gap-2 text-lg font-semibold text-blue-700 border-b pb-2 mb-4">
              <FaUserTie />
              Parent / Guardian Details
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Parent Name</label>
                <input
                  type="text"
                  name="parentName"
                  value={formData.parentName}
                  onChange={handleChange}
                  required
                  placeholder="Full name"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Contact Number</label>
                <input
                  type="tel"
                  name="contact"
                  value={formData.contact}
                  onChange={handleChange}
                  required
                  placeholder="+91 79471 49847"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
                />
              </div>
            </div>
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="example@email.com"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
              />
            </div>
          </section>

          {/* Address */}
          <section>
            <h2 className="flex items-center gap-2 text-lg font-semibold text-blue-700 border-b pb-2 mb-4">
              <FaAddressCard />
              Residential Address
            </h2>
            <textarea
              name="address"
              value={formData.address}
              onChange={handleChange}
              required
              rows={4}
              placeholder="Complete residential address"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
            />
          </section>

          {/* Feedback Messages */}
          {error && <p className="text-red-600 text-center">{error}</p>}
          {success && <p className="text-green-600 text-center">{success}</p>}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className={`w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition transform hover:-translate-y-1 hover:shadow-md focus:outline-none focus:ring-4 focus:ring-blue-300 ${
              loading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {loading ? 'Submitting...' : 'Submit Application'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Admissions;