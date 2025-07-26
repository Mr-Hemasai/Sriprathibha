const validateEvent = (data) => {
  const errors = [];
  
  if (!data.title || typeof data.title !== 'string' || data.title.trim().length < 3) {
    errors.push('Title is required and must be at least 3 characters');
  }

  if (!data.date) {
    errors.push('Date is required');
  } else if (new Date(data.date) > new Date()) {
    errors.push('Date cannot be in the future');
  }

  if (!data.description || typeof data.description !== 'string' || data.description.trim().length < 10) {
    errors.push('Description is required and must be at least 10 characters');
  }

  return errors.length > 0 ? { errors } : null;
};

const validateAdmission = (data) => {
  const errors = [];
  
  if (!data.studentName || typeof data.studentName !== 'string' || data.studentName.trim().length < 2) {
    errors.push('Student name is required and must be at least 2 characters');
  }

  if (!data.dob) {
    errors.push('Date of birth is required');
  }

  if (!data.className || typeof data.className !== 'string') {
    errors.push('Class name is required');
  }

  if (!data.parentName || typeof data.parentName !== 'string' || data.parentName.trim().length < 2) {
    errors.push('Parent name is required and must be at least 2 characters');
  }

  if (!data.contact || !/^[0-9]{10}$/.test(data.contact)) {
    errors.push('Contact number must be a 10-digit number');
  }

  if (!data.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    errors.push('Invalid email address');
  }

  return errors.length > 0 ? { errors } : null;
};

const validateContact = (data) => {
  const errors = [];
  
  if (!data.name || typeof data.name !== 'string' || data.name.trim().length < 2) {
    errors.push('Name is required and must be at least 2 characters');
  }

  if (!data.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    errors.push('Invalid email address');
  }

  if (!data.message || typeof data.message !== 'string' || data.message.trim().length < 10) {
    errors.push('Message is required and must be at least 10 characters');
  }

  return errors.length > 0 ? { errors } : null;
};

module.exports = {
  validateEvent,
  validateAdmission,
  validateContact
};
