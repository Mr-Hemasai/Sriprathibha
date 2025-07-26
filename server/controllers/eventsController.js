const multer = require('multer');
const path = require('path');
const fs = require('fs');
const mongoose = require('mongoose');
const Event = require('../models/Event');
const { uploadFile, getFileById, deleteFileById } = require('../utils/gridfsEvents');

// Configure multer to use memory storage instead of disk storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  }
});

// Middleware for handling file uploads
exports.uploadEventPicture = upload.single('picture');

// Handle errors from multer
exports.handleUploadErrors = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    return res.status(400).json({
      success: false,
      message: err.message || 'Error uploading file',
      error: process.env.NODE_ENV === 'development' ? err : undefined
    });
  } else if (err) {
    return res.status(400).json({
      success: false,
      message: err.message || 'Error processing file',
      error: process.env.NODE_ENV === 'development' ? err : undefined
    });
  }
  next();
};

// Create a new event
exports.createEvent = async (req, res) => {
  try {
    const { title, date, description, location, categories } = req.body;
    
    // Basic validation
    if (!title || !date || !description) {
      return res.status(400).json({
        success: false,
        message: 'Title, date, and description are required'
      });
    }

    let fileId = null;
    let originalName = null;
    let mimeType = null;
    let size = 0;

    // Handle file upload if present
    if (req.file) {
      try {
        fileId = await uploadFile(req.file.buffer, {
          filename: req.file.originalname,
          contentType: req.file.mimetype,
          metadata: {
            originalName: req.file.originalname,
            size: req.file.size
          }
        });
        originalName = req.file.originalname;
        mimeType = req.file.mimetype;
        size = req.file.size;
      } catch (uploadError) {
        console.error('Error uploading event image:', uploadError);
        return res.status(500).json({
          success: false,
          message: 'Error uploading event image',
          error: process.env.NODE_ENV === 'development' ? uploadError.message : undefined
        });
      }
    }

    // Parse categories if provided as string
    let categoriesArray = [];
    if (categories) {
      try {
        categoriesArray = typeof categories === 'string' ? JSON.parse(categories) : categories;
      } catch (e) {
        console.warn('Invalid categories format, using empty array');
      }
    }

    // Create new event
    const event = new Event({
      title,
      date,
      description,
      location,
      fileId,
      originalName,
      mimeType,
      size,
      categories: categoriesArray,
      uploadedBy: req.user?.id || 'system'
    });

    await event.save();

    res.status(201).json({
      success: true,
      message: 'Event created successfully',
      data: event
    });

  } catch (error) {
    console.error('Error creating event:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating event',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Get event by ID
exports.getEventById = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }
    res.json({
      success: true,
      data: event
    });
  } catch (error) {
    console.error('Error getting event:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving event',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Get all events with optional filtering
exports.getEvents = async (req, res) => {
  try {
    const { category, limit = 10, page = 1 } = req.query;
    const query = {};
    
    if (category) {
      query.categories = category;
    }
    
    const options = {
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
      sort: { date: -1 },
      lean: true
    };

    const events = await Event.paginate(query, options);
    
    res.json({
      success: true,
      data: events.docs,
      pagination: {
        total: events.totalDocs,
        limit: events.limit,
        page: events.page,
        pages: events.totalPages
      }
    });
  } catch (error) {
    console.error('Error getting events:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving events',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Update an event
exports.updateEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, date, description, location, categories } = req.body;
    
    const event = await Event.findById(id);
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }
    
    // Handle file upload if present
    if (req.file) {
      try {
        // Delete old file if exists
        if (event.fileId) {
          await deleteFileById(event.fileId).catch(console.error);
        }
        
        // Upload new file
        const fileId = await uploadFile(req.file.buffer, {
          filename: req.file.originalname,
          contentType: req.file.mimetype,
          metadata: {
            originalName: req.file.originalname,
            size: req.file.size
          }
        });
        
        // Update file details
        event.fileId = fileId;
        event.originalName = req.file.originalname;
        event.mimeType = req.file.mimetype;
        event.size = req.file.size;
      } catch (uploadError) {
        console.error('Error updating event image:', uploadError);
        return res.status(500).json({
          success: false,
          message: 'Error updating event image',
          error: process.env.NODE_ENV === 'development' ? uploadError.message : undefined
        });
      }
    }
    
    // Update other fields
    event.title = title || event.title;
    event.date = date || event.date;
    event.description = description || event.description;
    event.location = location !== undefined ? location : event.location;
    
    // Update categories if provided
    if (categories) {
      try {
        event.categories = typeof categories === 'string' ? JSON.parse(categories) : categories;
      } catch (e) {
        console.warn('Invalid categories format, keeping existing categories');
      }
    }
    
    await event.save();
    
    res.json({
      success: true,
      message: 'Event updated successfully',
      data: event
    });
    
  } catch (error) {
    console.error('Error updating event:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating event',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Delete an event
exports.deleteEvent = async (req, res) => {
  try {
    const event = await Event.findByIdAndDelete(req.params.id);
    
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }
    
    // Delete associated file if exists
    if (event.fileId) {
      await deleteFileById(event.fileId).catch(console.error);
    }
    
    res.json({
      success: true,
      message: 'Event deleted successfully'
    });
    
  } catch (error) {
    console.error('Error deleting event:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting event',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Get all events with pagination
exports.getEvents = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    
    const options = {
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
      sort: { date: -1 },
      lean: true,
      leanWithId: false
    };

    const events = await Event.paginate({}, options);
    
    // Manually include virtuals in the response
    const eventsWithVirtuals = {
      ...events,
      docs: events.docs.map(event => {
        const eventObj = event.toObject ? event.toObject() : event;
        if (event.fileId) {
          eventObj.imageUrl = `${process.env.BASE_URL || 'http://localhost:3000'}/api/events/image/${event.fileId}`;
        }
        return eventObj;
      })
    };

    res.json({
      success: true,
      data: eventsWithVirtuals.docs,
      pagination: {
        total: eventsWithVirtuals.totalDocs,
        limit: eventsWithVirtuals.limit,
        page: eventsWithVirtuals.page,
        pages: eventsWithVirtuals.totalPages
      }
    });
  } catch (error) {
    console.error('Error fetching events:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching events',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Get event image
exports.getEventImage = async (req, res) => {
  try {
    const { fileId } = req.params;
    
    if (!fileId || !mongoose.Types.ObjectId.isValid(fileId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid file ID'
      });
    }
    
    // Find the event to get the mimeType and originalName
    const event = await Event.findOne({ fileId });
    
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found for this image'
      });
    }
    
    // Get the file from GridFS
    const fileBuffer = await getFileById(fileId);
    
    if (!fileBuffer || fileBuffer.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Image not found in storage'
      });
    }
    
    // Set appropriate headers for image response
    res.set({
      'Content-Type': event.mimeType || 'image/jpeg',
      'Content-Length': fileBuffer.length,
      'Content-Disposition': `inline; filename="${event.originalName || 'event-image'}"`,
      'Cache-Control': 'public, max-age=31536000', // Cache for 1 year
      'Access-Control-Expose-Headers': 'Content-Type, Content-Length, Content-Disposition'
    });
    
    // Send the file buffer directly
    res.send(fileBuffer);
    
  } catch (error) {
    console.error('Error retrieving event image:', error);
    
    // If headers were already sent, we can't send JSON
    if (res.headersSent) {
      return res.end();
    }
    
    // Set error response headers
    res.header('Access-Control-Allow-Origin', req.headers.origin || '*');
    res.header('Access-Control-Allow-Credentials', 'true');
    
    // Handle specific error types
    if (error.message === 'File not found') {
      return res.status(404).json({
        success: false,
        message: 'Image not found'
      });
    }
    
    // Generic error response
    res.status(500).json({
      success: false,
      message: 'Error retrieving event image',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Debug endpoint to list all events
exports.debugEvents = async (req, res) => {
  try {
    const events = await Event.find({}).sort({ date: -1 }).lean();
    const eventsWithUrls = events.map(event => ({
      ...event,
      imageUrl: event.fileId 
        ? `${process.env.BASE_URL || 'http://localhost:3000'}/api/events/image/${event.fileId}`
        : null
    }));
    
    res.json({
      success: true,
      count: eventsWithUrls.length,
      data: eventsWithUrls
    });
  } catch (error) {
    console.error('Debug error:', error);
    res.status(500).json({
      success: false,
      message: 'Debug error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};