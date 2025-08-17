const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/teachersController');

// Public endpoints
router.get('/', ctrl.getTeachers);

module.exports = router;
