const express = require('express');
const router = express.Router();
const publicController = require('../controllers/publicController');

// Public route to get syllabus by class and term
router.get('/syllabus/class/:class/term/:term', publicController.getSyllabusByClassAndTerm);

module.exports = router;
