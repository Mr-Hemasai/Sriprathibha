const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const adminController = require('../controllers/adminController');
const teachersController = require('../controllers/teachersController');

// Public routes (no authentication required)
router.get('/syllabus/class/:class/term/:term', adminController.getSyllabusByClassAndTerm);
router.get('/syllabus/file/:fileId', adminController.getFile);

// Protected routes (require authentication)
router.use(authMiddleware);

// Dashboard
router.get('/dashboard', adminController.dashboard);

// Syllabus management
router.get('/syllabus', adminController.getSyllabuses);
router.get('/syllabus/count', adminController.getSyllabusCount);
router.get('/syllabus/:id', adminController.getSyllabus);
router.post('/syllabus', adminController.uploadSyllabus);
router.put('/syllabus/:id', adminController.updateSyllabus);
router.delete('/syllabus/:id', adminController.deleteSyllabus);

// Teachers management
router.get('/teachers', teachersController.getTeachers);
router.get('/teachers/:id', teachersController.getTeacherById);
router.post(
  '/teachers',
  teachersController.uploadPhoto,
  teachersController.handleUploadErrors,
  teachersController.createTeacher
);
router.put(
  '/teachers/:id',
  teachersController.uploadPhoto,
  teachersController.handleUploadErrors,
  teachersController.updateTeacher
);
router.delete('/teachers/:id', teachersController.deleteTeacher);

module.exports = router;
