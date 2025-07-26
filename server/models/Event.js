const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');

const eventSchema = new mongoose.Schema({
  title: { type: String, required: true },
  date: { type: Date, required: true },
  description: { type: String, required: true },
  location: { type: String },
  fileId: { type: String }, // Store GridFS file ID
  originalName: { type: String }, // Original filename
  mimeType: { type: String }, // MIME type of the image
  size: { type: Number }, // File size in bytes
  categories: [{ type: String }],
  uploadedBy: { type: String, default: 'system' },
  uploadedAt: { type: Date, default: Date.now }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Add a virtual field for the image URL
eventSchema.virtual('imageUrl').get(function() {
  if (this.fileId) {
    return `${process.env.BASE_URL || 'http://localhost:3000'}/api/events/image/${this.fileId}`;
  }
  return null;
});

// Index for better query performance
eventSchema.index({ date: -1 });
eventSchema.index({ categories: 1 });

// Add pagination plugin
eventSchema.plugin(mongoosePaginate);

module.exports = mongoose.model('Event', eventSchema);
