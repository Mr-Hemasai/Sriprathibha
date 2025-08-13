const express = require('express');
const router = express.Router();
const eventsController = require('../controllers/eventsController');
const authMiddleware = require('../middleware/authMiddleware');

// Create event with file upload
router.post('/', 
  authMiddleware, 
  (req, res, next) => {
    eventsController.uploadEventPicture(req, res, (err) => {
      if (err) {
        return eventsController.handleUploadErrors(err, req, res, next);
      }
      next();
    });
  },
  eventsController.createEvent
);

// Get all events
router.get('/', eventsController.getEvents);

// Get single event by ID
router.get('/:id', eventsController.getEventById);

// Image endpoint (CORS handled globally)
router.options('/image/:fileId', (req, res) => res.sendStatus(200));
router.get('/image/:fileId', (req, res, next) => {
  res.setHeader('Access-Control-Expose-Headers', 'Content-Type, Content-Length, Content-Disposition');
  eventsController.getEventImage(req, res, next);
});

// Update event with optional file upload
router.put('/:id', 
  authMiddleware,
  (req, res, next) => {
    eventsController.uploadEventPicture(req, res, (err) => {
      if (err) {
        return eventsController.handleUploadErrors(err, req, res, next);
      }
      next();
    });
  },
  eventsController.updateEvent
);

// Debug route to get event data including image info
router.get('/debug/events', authMiddleware, eventsController.debugEvents);

// Delete event route
router.delete('/:id', authMiddleware, eventsController.deleteEvent);

module.exports = router;
