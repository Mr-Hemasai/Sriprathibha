const mongoose = require('mongoose');

const TeacherSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    degrees: { type: [String], default: [] },
    experience: { type: Number, default: 0 }, // years
    subjects: { type: [String], default: [] },
    contactNumber: { type: String, trim: true, default: '' },
    tag: {
      type: String,
      trim: true,
      lowercase: true,
      enum: ['principal', 'vice_principal', 'senior_teacher', 'teacher', 'assistant_teacher', 'hod', 'coordinator', ''],
      default: '',
    },
    createdBy: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Teacher', TeacherSchema);
