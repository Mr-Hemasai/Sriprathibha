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

// Handle preflight for image endpoint
router.options('/image/:fileId', (req, res) => {
  res.header('Access-Control-Allow-Origin', req.headers.origin || '*');
  res.header('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.status(200).end();
});

// Get event image by fileId with CORS headers
router.get('/image/:fileId', (req, res, next) => {
  // Set CORS headers
  res.header('Access-Control-Allow-Origin', req.headers.origin || '*');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Expose-Headers', 'Content-Type, Content-Length, Content-Disposition');
  
  // Handle preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  // Proceed to the controller
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
