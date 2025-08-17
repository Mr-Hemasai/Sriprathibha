const multer = require('multer');
const mongoose = require('mongoose');
const Album = require('../models/Album');
const { uploadFile, getFileStreamById, deleteFileById } = require('../utils/gridfsEvents');

// Multer for image uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB per image
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) return cb(null, true);
    cb(new Error('Only image files are allowed'));
  },
});

exports.uploadPhoto = upload.single('photo');

exports.handleUploadErrors = (err, req, res, next) => {
  if (err instanceof multer.MulterError || err) {
    return res.status(400).json({ success: false, message: err.message || 'Upload error' });
  }
  next();
};

// Public: list albums
exports.listAlbums = async (req, res) => {
  try {
    const albums = await Album.find().sort({ createdAt: -1 }).lean();
    res.json({ success: true, data: albums });
  } catch (err) {
    console.error('listAlbums error:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch albums' });
  }
};

// Public: get album by id
exports.getAlbum = async (req, res) => {
  try {
    const album = await Album.findById(req.params.id).lean();
    if (!album) return res.status(404).json({ success: false, message: 'Album not found' });
    res.json({ success: true, data: album });
  } catch (err) {
    console.error('getAlbum error:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch album' });
  }
};

// Public: stream a photo by GridFS id
exports.getPhoto = async (req, res) => {
  try {
    const fileId = req.params.fileId;
    const { stream, file } = await getFileStreamById(fileId);
    const contentType = file?.contentType || 'image/jpeg';
    res.setHeader('Content-Type', contentType);
    res.setHeader('Cache-Control', 'public, max-age=604800, immutable');
    stream.on('error', (err) => {
      console.error('getPhoto stream error:', err);
      if (!res.headersSent) return res.status(404).end();
    });
    stream.pipe(res);
  } catch (err) {
    if (err?.message === 'File not found') return res.status(404).json({ success: false, message: 'Photo not found' });
    console.error('getPhoto error:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch photo' });
  }
};

// Admin: create album
exports.createAlbum = async (req, res) => {
  try {
    const { title, description } = req.body;
    if (!title) return res.status(400).json({ success: false, message: 'Title is required' });

    let coverPhotoFileId = null;
    if (req.file) {
      const fileId = await uploadFile(req.file.buffer, {
        filename: req.file.originalname,
        contentType: req.file.mimetype,
        metadata: { originalName: req.file.originalname, size: req.file.size },
      });
      coverPhotoFileId = String(fileId);
    }

    const album = new Album({
      title,
      description,
      coverPhotoFileId,
      createdBy: req.user?.id || 'system',
      photos: [],
    });

    await album.save();
    res.status(201).json({ success: true, data: album });
  } catch (err) {
    console.error('createAlbum error:', err);
    res.status(500).json({ success: false, message: 'Failed to create album' });
  }
};

// Admin: update album
exports.updateAlbum = async (req, res) => {
  try {
    const album = await Album.findById(req.params.id);
    if (!album) return res.status(404).json({ success: false, message: 'Album not found' });

    const { title, description } = req.body;
    if (title !== undefined) album.title = title;
    if (description !== undefined) album.description = description;

    if (req.file) {
      // replace cover photo
      if (album.coverPhotoFileId) {
        try { await deleteFileById(album.coverPhotoFileId); } catch (e) { console.warn('delete old cover failed', e.message); }
      }
      const fileId = await uploadFile(req.file.buffer, {
        filename: req.file.originalname,
        contentType: req.file.mimetype,
        metadata: { originalName: req.file.originalname, size: req.file.size },
      });
      album.coverPhotoFileId = String(fileId);
    }

    await album.save();
    res.json({ success: true, data: album });
  } catch (err) {
    console.error('updateAlbum error:', err);
    res.status(500).json({ success: false, message: 'Failed to update album' });
  }
};

// Admin: delete album (and all photos)
exports.deleteAlbum = async (req, res) => {
  try {
    const album = await Album.findById(req.params.id);
    if (!album) return res.status(404).json({ success: false, message: 'Album not found' });

    // delete cover
    if (album.coverPhotoFileId) {
      try { await deleteFileById(album.coverPhotoFileId); } catch (e) { console.warn('delete cover failed', e.message); }
    }
    // delete photos
    for (const p of album.photos || []) {
      if (p.fileId) {
        try { await deleteFileById(p.fileId); } catch (e) { console.warn('delete photo failed', e.message); }
      }
    }

    await album.deleteOne();
    res.json({ success: true, message: 'Album deleted' });
  } catch (err) {
    console.error('deleteAlbum error:', err);
    res.status(500).json({ success: false, message: 'Failed to delete album' });
  }
};

// Admin: add photo to album
exports.addPhoto = async (req, res) => {
  try {
    const album = await Album.findById(req.params.id);
    if (!album) return res.status(404).json({ success: false, message: 'Album not found' });
    if (!req.file) return res.status(400).json({ success: false, message: 'Photo is required' });

    const fileId = await uploadFile(req.file.buffer, {
      filename: req.file.originalname,
      contentType: req.file.mimetype,
      metadata: { originalName: req.file.originalname, size: req.file.size },
    });

    const photo = {
      fileId: String(fileId),
      originalName: req.file.originalname,
      mimeType: req.file.mimetype,
      caption: req.body.caption || '',
      size: req.file.size,
      uploadedBy: req.user?.id || 'system',
      uploadedAt: new Date(),
    };

    album.photos.unshift(photo);
    await album.save();
    res.status(201).json({ success: true, data: album });
  } catch (err) {
    console.error('addPhoto error:', err);
    res.status(500).json({ success: false, message: 'Failed to add photo' });
  }
};

// Admin: delete a photo from album
exports.deletePhoto = async (req, res) => {
  try {
    const { id, photoId } = req.params;
    const album = await Album.findById(id);
    if (!album) return res.status(404).json({ success: false, message: 'Album not found' });

    const photo = album.photos.id(photoId);
    if (!photo) return res.status(404).json({ success: false, message: 'Photo not found' });

    if (photo.fileId) {
      try { await deleteFileById(photo.fileId); } catch (e) { console.warn('delete photo file failed', e.message); }
    }

    photo.deleteOne();
    await album.save();
    res.json({ success: true, data: album });
  } catch (err) {
    console.error('deletePhoto error:', err);
    res.status(500).json({ success: false, message: 'Failed to delete photo' });
  }
};
