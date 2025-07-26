const Admission = require('../models/Admission');

// Validation function
const validateAdmission = (data) => {
  const errors = [];
  
  // Required fields
  const requiredFields = ['studentName', 'dob', 'class', 'parentName', 'address'];
  requiredFields.forEach(field => {
    if (!data[field]) {
      errors.push(`${field.replace(/[A-Z]/g, ' $&').replace(/^./, str => str.toUpperCase())} is required`);
    }
  });

  // Validate email format if provided
  if (data.email && !/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(data.email)) {
    errors.push('Please provide a valid email address');
  }

  // Validate contact number if provided
  if (data.contact && !/^[0-9]{10}$/.test(data.contact)) {
    errors.push('Contact number must be a 10-digit number');
  }

  // Validate date format
  if (data.dob && isNaN(new Date(data.dob).getTime())) {
    errors.push('Invalid date of birth');
  }

  return errors.length > 0 ? errors : null;
};

exports.createAdmission = async (req, res) => {
  try {
    // Extract only the fields we expect
    const admissionData = {
      studentName: req.body.studentName,
      dob: req.body.dob,
      class: req.body.class,
      gender: req.body.gender || '',
      parentName: req.body.parentName,
      contact: req.body.contact || '',
      email: req.body.email ? req.body.email.toLowerCase().trim() : '',
      address: req.body.address,
      previousSchool: req.body.previousSchool || '',
      status: 'Pending',
      notes: ''
    };

    // Validate the data
    const validationErrors = validateAdmission(admissionData);
    if (validationErrors) {
      return res.status(400).json({ 
        error: 'Validation failed',
        details: validationErrors
      });
    }

    // Format the date to ISO string
    if (admissionData.dob) {
      admissionData.dob = new Date(admissionData.dob).toISOString();
    }

    const admission = new Admission(admissionData);
    const savedAdmission = await admission.save();
    
    res.status(201).json({
      message: 'Admission submitted successfully',
      data: savedAdmission
    });
  } catch (err) {
    console.error('Error saving admission:', err);
    
    // Handle duplicate key errors (e.g., duplicate email)
    if (err.code === 11000) {
      const field = Object.keys(err.keyPattern)[0];
      return res.status(400).json({ 
        error: `${field} already exists`,
        details: [`The ${field} is already registered`]
      });
    }
    
    // Handle validation errors from Mongoose
    if (err.name === 'ValidationError') {
      const errors = Object.values(err.errors).map(e => e.message);
      return res.status(400).json({
        error: 'Validation failed',
        details: errors
      });
    }
    
    res.status(500).json({ 
      error: 'Failed to process admission',
      details: ['An unexpected error occurred. Please try again later.']
    });
  }
};

exports.getAdmissions = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const admissions = await Admission.find().skip(skip).limit(limit);
    const total = await Admission.countDocuments();

    res.status(200).json({
      data: admissions,
      page,
      totalPages: Math.ceil(total / limit),
      totalRecords: total,
    });
  } catch (err) {
    console.error('Error fetching admissions:', err);
    res.status(500).json({ error: 'Failed to fetch admissions.' });
  }
};
