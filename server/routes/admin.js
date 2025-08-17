const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const adminController = require('../controllers/adminController');
const teachersController = require('../controllers/teachersController');
const galleryController = require('../controllers/galleryController');

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
  teachersController.createTeacher
);
router.put(
  '/teachers/:id',
  teachersController.updateTeacher
);
router.delete('/teachers/:id', teachersController.deleteTeacher);

// Gallery management (albums and photos)
// Albums
router.get('/gallery/albums', galleryController.listAlbums);
router.get('/gallery/albums/:id', galleryController.getAlbum);
router.post(
  '/gallery/albums',
  galleryController.uploadPhoto, // optional cover photo
  galleryController.handleUploadErrors,
  galleryController.createAlbum
);
router.put(
  '/gallery/albums/:id',
  galleryController.uploadPhoto, // optional new cover photo
  galleryController.handleUploadErrors,
  galleryController.updateAlbum
);
router.delete('/gallery/albums/:id', galleryController.deleteAlbum);

// Photos within an album
router.post(
  '/gallery/albums/:id/photos',
  galleryController.uploadPhoto,
  galleryController.handleUploadErrors,
  galleryController.addPhoto
);
router.delete('/gallery/albums/:id/photos/:photoId', galleryController.deletePhoto);

module.exports = router;
