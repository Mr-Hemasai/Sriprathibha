const mongoose = require('mongoose');

const TeacherSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    degrees: { type: [String], default: [] },
    experience: { type: Number, default: 0 }, // years
    subjects: { type: [String], default: [] },
    photoFileId: { type: mongoose.Schema.Types.ObjectId, ref: 'fs.files', default: null },
    photoOriginalName: { type: String, default: null },
    photoMimeType: { type: String, default: null },
    createdBy: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Teacher', TeacherSchema);
