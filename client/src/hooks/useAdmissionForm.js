import { useState } from 'react';

const useAdmissionForm = (initialState) => {
  const [formData, setFormData] = useState(initialState);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
    setSuccess('');
  };

  const resetForm = () => {
    setFormData(initialState);
  };

  return {
    formData,
    setFormData,
    loading,
    setLoading,
    error,
    setError,
    success,
    setSuccess,
    handleChange,
    resetForm,
  };
};

export default useAdmissionForm;
