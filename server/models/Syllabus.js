const mongoose = require('mongoose');

const syllabusSchema = new mongoose.Schema({
  class: {
    type: Number,
    required: true,
    min: 1,
    max: 12,
    validate: {
      validator: Number.isInteger,
      message: 'Class must be an integer between 1 and 12'
    }
  },
  term: {
    type: Number,
    required: true,
    min: 1,
    max: 2,
    validate: {
      validator: Number.isInteger,
      message: 'Term must be either 1 or 2'
    }
  },
  originalName: {
    type: String,
    required: true
  },
  fileId: {
    type: String,
    required: true
  },
  size: {
    type: Number,
    required: true
  },
  uploadedBy: {
    type: String,  
    default: 'system'
  },
  uploadedAt: {
    type: Date,
    default: Date.now,
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for file URL
syllabusSchema.virtual('fileUrl').get(function() {
  return `/api/syllabus/file/${this.fileId}`;
});

// Create a compound index for class and term
syllabusSchema.index({ class: 1, term: 1 }, { unique: true });

module.exports = mongoose.model('Syllabus', syllabusSchema);
