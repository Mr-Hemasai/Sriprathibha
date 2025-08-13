const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/teachersController');

// Public endpoints
router.get('/', ctrl.getTeachers);
router.get('/photo/:fileId', ctrl.getPhoto);

module.exports = router;
