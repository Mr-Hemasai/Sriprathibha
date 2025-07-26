const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const contactController = require('../controllers/contactController');
const validateRequest = require('../middleware/validationMiddleware');
const authMiddleware = require('../middleware/authMiddleware');

const contactValidationRules = [
  body('name').notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('mobile').notEmpty().withMessage('Mobile number is required').isMobilePhone().withMessage('Valid mobile number is required'),
  body('message').notEmpty().withMessage('Message is required'),
];

router.post('/', contactValidationRules, validateRequest, contactController.createContact);

router.get('/', authMiddleware, contactController.getContacts);

// Update contact status
router.patch('/:id', authMiddleware, contactController.updateContactStatus);

// Delete a contact message
router.delete('/:id', authMiddleware, contactController.deleteContact);

module.exports = router;
