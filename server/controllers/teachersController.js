const multer = require('multer');
const Teacher = require('../models/Teacher');
const { uploadFile, getFileById, getFileStreamById, deleteFileById } = require('../utils/gridfsEvents');

// Multer memory storage for teacher photo
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
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

// Create teacher
exports.createTeacher = async (req, res) => {
  try {
    const { name, degrees, experience, subjects } = req.body;
    if (!name) return res.status(400).json({ success: false, message: 'Name is required' });

    let photoFileId = null, photoOriginalName = null, photoMimeType = null;
    if (req.file) {
      const fileId = await uploadFile(req.file.buffer, {
        filename: req.file.originalname,
        contentType: req.file.mimetype,
        metadata: { originalName: req.file.originalname, size: req.file.size },
      });
      photoFileId = fileId;
      photoOriginalName = req.file.originalname;
      photoMimeType = req.file.mimetype;
    }

    const teacher = new Teacher({
      name,
      degrees: parseMaybeArray(degrees),
      experience: parseInt(experience || 0, 10),
      subjects: parseMaybeArray(subjects),
      photoFileId,
      photoOriginalName,
      photoMimeType,
      createdBy: req.user?.id || 'system',
    });

    await teacher.save();
    res.status(201).json({ success: true, data: teacher });
  } catch (err) {
    console.error('createTeacher error:', err);
    res.status(500).json({ success: false, message: 'Failed to create teacher' });
  }
};

// Get all teachers
exports.getTeachers = async (req, res) => {
  try {
    const teachers = await Teacher.find().sort({ createdAt: -1 }).lean();
    res.json({ success: true, data: teachers });
  } catch (err) {
    console.error('getTeachers error:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch teachers' });
  }
};

// Get teacher by id
exports.getTeacherById = async (req, res) => {
  try {
    const t = await Teacher.findById(req.params.id);
    if (!t) return res.status(404).json({ success: false, message: 'Teacher not found' });
    res.json({ success: true, data: t });
  } catch (err) {
    console.error('getTeacherById error:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch teacher' });
  }
};

// Update teacher
exports.updateTeacher = async (req, res) => {
  try {
    const t = await Teacher.findById(req.params.id);
    if (!t) return res.status(404).json({ success: false, message: 'Teacher not found' });

    if (req.file) {
      // delete old photo if exists
      if (t.photoFileId) {
        try { await deleteFileById(t.photoFileId); } catch (e) { console.warn('delete old photo failed', e.message); }
      }
      const fileId = await uploadFile(req.file.buffer, {
        filename: req.file.originalname,
        contentType: req.file.mimetype,
        metadata: { originalName: req.file.originalname, size: req.file.size },
      });
      t.photoFileId = fileId;
      t.photoOriginalName = req.file.originalname;
      t.photoMimeType = req.file.mimetype;
    }

    const { name, degrees, experience, subjects } = req.body;
    if (name !== undefined) t.name = name;
    if (degrees !== undefined) t.degrees = parseMaybeArray(degrees);
    if (experience !== undefined) t.experience = parseInt(experience || 0, 10);
    if (subjects !== undefined) t.subjects = parseMaybeArray(subjects);

    await t.save();
    res.json({ success: true, data: t });
  } catch (err) {
    console.error('updateTeacher error:', err);
    res.status(500).json({ success: false, message: 'Failed to update teacher' });
  }
};

// Delete teacher
exports.deleteTeacher = async (req, res) => {
  try {
    const t = await Teacher.findById(req.params.id);
    if (!t) return res.status(404).json({ success: false, message: 'Teacher not found' });
    if (t.photoFileId) {
      try { await deleteFileById(t.photoFileId); } catch (e) { console.warn('delete photo failed', e.message); }
    }
    await t.deleteOne();
    res.json({ success: true, message: 'Teacher deleted' });
  } catch (err) {
    console.error('deleteTeacher error:', err);
    res.status(500).json({ success: false, message: 'Failed to delete teacher' });
  }
};

// Stream teacher photo from GridFS with proper content type
exports.getPhoto = async (req, res) => {
  try {
    const fileId = req.params.fileId;
    const { stream, file } = await getFileStreamById(fileId);
    const contentType = file?.contentType || 'image/jpeg';
    res.setHeader('Content-Type', contentType);
    res.setHeader('Cache-Control', 'public, max-age=604800, immutable');
    stream.on('error', (err) => {
      console.error('getPhoto stream error:', err);
      if (!res.headersSent) {
        return res.status(404).end();
      }
    });
    stream.pipe(res);
  } catch (err) {
    if (err?.message === 'File not found') {
      return res.status(404).json({ success: false, message: 'Photo not found' });
    }
    console.error('getPhoto error:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch photo' });
  }
};

function parseMaybeArray(v) {
  if (!v) return [];
  if (Array.isArray(v)) return v;
  try {
    const parsed = JSON.parse(v);
    return Array.isArray(parsed) ? parsed : [String(v)];
  } catch {
    return String(v)
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
  }
}
