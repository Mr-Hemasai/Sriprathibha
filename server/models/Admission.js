const mongoose = require('mongoose');

const admissionSchema = new mongoose.Schema({
  // Student Information
  studentName: { 
    type: String, 
    required: [true, 'Student name is required'],
    trim: true
  },
  dob: { 
    type: Date, 
    required: [true, 'Date of birth is required']
  },
  gender: {
    type: String,
    enum: ['Male', 'Female', 'Other', ''],
    default: ''
  },
  class: { 
    type: String, 
    required: [true, 'Class is required'],
    trim: true
  },
  
  // Parent/Guardian Information
  parentName: { 
    type: String, 
    required: [true, 'Parent/Guardian name is required'],
    trim: true
  },
  contact: {
    type: String,
    trim: true,
    match: [/^[0-9]{10}$/, 'Please enter a valid 10-digit phone number']
  },
  email: {
    type: String,
    trim: true,
    lowercase: true,
    match: [/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/, 'Please enter a valid email address']
  },
  
  // Address Information
  address: { 
    type: String, 
    required: [true, 'Address is required'],
    trim: true
  },
  
  // Educational Background
  previousSchool: {
    type: String,
    trim: true,
    default: ''
  },
  
  // System Fields
  status: {
    type: String,
    enum: ['Pending', 'Under Review', 'Accepted', 'Rejected'],
    default: 'Pending'
  },
  notes: {
    type: String,
    default: ''
  }
}, {
  timestamps: true // Adds createdAt and updatedAt fields
});

module.exports = mongoose.model('Admission', admissionSchema);
