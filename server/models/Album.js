const mongoose = require('mongoose');

const photoSchema = new mongoose.Schema(
  {
    fileId: { type: String, required: true },
    originalName: { type: String },
    mimeType: { type: String },
    caption: { type: String },
    size: { type: Number },
    uploadedBy: { type: String, default: 'system' },
    uploadedAt: { type: Date, default: Date.now },
  },
  { _id: true }
);

const albumSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String },
    coverPhotoFileId: { type: String },
    photos: [photoSchema],
    createdBy: { type: String, default: 'system' },
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

albumSchema.virtual('coverPhotoUrl').get(function () {
  if (this.coverPhotoFileId) {
    return `${process.env.BASE_URL || 'http://localhost:3000'}/api/gallery/photo/${this.coverPhotoFileId}`;
  }
  // fallback to first photo
  const firstPhoto = (this.photos || [])[0];
  if (firstPhoto?.fileId) {
    return `${process.env.BASE_URL || 'http://localhost:3000'}/api/gallery/photo/${firstPhoto.fileId}`;
  }
  return null;
});

albumSchema.virtual('photoCount').get(function () {
  return (this.photos || []).length;
});

module.exports = mongoose.model('Album', albumSchema);
