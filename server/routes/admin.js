const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const adminController = require('../controllers/adminController');

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

module.exports = router;
