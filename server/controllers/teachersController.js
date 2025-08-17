const Teacher = require('../models/Teacher');
// Note: photo uploads removed. Using simple JSON fields now.

// Create teacher
exports.createTeacher = async (req, res) => {
  try {
    const { name, degrees, experience, subjects, contactNumber, tag } = req.body;
    if (!name) return res.status(400).json({ success: false, message: 'Name is required' });

    const teacher = new Teacher({
      name,
      degrees: parseMaybeArray(degrees),
      experience: parseInt(experience || 0, 10),
      subjects: parseMaybeArray(subjects),
      contactNumber: (contactNumber || '').trim(),
      tag: (tag || '').trim().toLowerCase(),
      createdBy: req.user?.id || 'system',
    });

    await teacher.save();
    res.status(201).json({ success: true, data: teacher });
  } catch (err) {
    console.error('createTeacher error:', err);
    res.status(500).json({ success: false, message: 'Failed to create teacher' });
  }
};

// Get all teachers (sorted by tag rank, then name)
exports.getTeachers = async (req, res) => {
  try {
    const tagOrder = [
      'principal',
      'vice_principal',
      'hod',
      'coordinator',
      'senior_teacher',
      'teacher',
      'assistant_teacher',
      '',
    ];
    const rank = (t) => {
      const idx = tagOrder.indexOf((t.tag || '').toString().toLowerCase());
      return idx >= 0 ? idx : 999;
    };
    const teachers = await Teacher.find().lean();
    teachers.sort((a, b) => {
      const ra = rank(a);
      const rb = rank(b);
      if (ra !== rb) return ra - rb;
      return (a.name || '').localeCompare(b.name || '');
    });
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
    const { name, degrees, experience, subjects, contactNumber, tag } = req.body;
    if (name !== undefined) t.name = name;
    if (degrees !== undefined) t.degrees = parseMaybeArray(degrees);
    if (experience !== undefined) t.experience = parseInt(experience || 0, 10);
    if (subjects !== undefined) t.subjects = parseMaybeArray(subjects);
    if (contactNumber !== undefined) t.contactNumber = (contactNumber || '').trim();
    if (tag !== undefined) t.tag = (tag || '').trim().toLowerCase();

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
    await t.deleteOne();
    res.json({ success: true, message: 'Teacher deleted' });
  } catch (err) {
    console.error('deleteTeacher error:', err);
    res.status(500).json({ success: false, message: 'Failed to delete teacher' });
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
