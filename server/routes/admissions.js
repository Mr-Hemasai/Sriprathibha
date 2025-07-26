const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const admissionsController = require('../controllers/admissionsController');
const validateRequest = require('../middleware/validationMiddleware');

const admissionValidationRules = [
  body('studentName').notEmpty().withMessage('Student name is required'),
  body('dob').isISO8601().toDate().withMessage('Valid date of birth is required'),
  body('class').notEmpty().withMessage('Class is required'),
  body('parentName').notEmpty().withMessage('Parent name is required'),
  body('address').notEmpty().withMessage('Address is required'),
];

router.post('/', admissionValidationRules, validateRequest, admissionsController.createAdmission);

const authMiddleware = require('../middleware/authMiddleware');

router.get('/', authMiddleware, admissionsController.getAdmissions);

module.exports = router;
