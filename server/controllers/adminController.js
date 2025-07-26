const multer = require('multer');
const path = require('path');
const fs = require('fs');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const Syllabus = require('../models/Syllabus');
const { uploadFile, getFileById, deleteFileById, initGridFS } = require('../utils/gridfs');

// Initialize multer memory storage
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

exports.uploadSyllabus = [
  upload.single('file'),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded', type: 'error' });
      }

      const { class: classNumber, term } = req.body;
      
      if (!classNumber || !term) {
        return res.status(400).json({ 
          message: 'Class and term are required', 
          type: 'error' 
        });
      }

      // Validate file type
      const fileExt = path.extname(req.file.originalname).toLowerCase();
      if (fileExt !== '.pdf') {
        return res.status(400).json({ 
          message: 'Only PDF files are allowed', 
          type: 'error' 
        });
      }

      // Validate file size (10MB max)
      const maxSize = 10 * 1024 * 1024; // 10MB
      if (req.file.size > maxSize) {
        return res.status(400).json({ 
          message: 'File size exceeds 10MB limit', 
          type: 'error' 
        });
      }

      // Upload file to GridFS
      const fileId = await uploadFile(req.file.buffer, {
        filename: req.file.originalname,
        contentType: req.file.mimetype,
        metadata: {
          originalName: req.file.originalname,
          size: req.file.size
        }
      });
      
      // Get user ID from token or use a default system user
      let uploadedBy = 'admin'; // Default user
      if (req.user && req.user.id) {
        uploadedBy = req.user.id;
      } else if (req.headers.authorization) {
        try {
          const token = req.headers.authorization.split(' ')[1];
          const decoded = jwt.verify(token, process.env.JWT_SECRET);
          if (decoded && decoded.userId) {
            uploadedBy = decoded.userId;
          }
        } catch (err) {
          console.warn('Could not extract user ID from token:', err.message);
        }
      }

      // Prepare syllabus data
      const classNum = parseInt(classNumber, 10);
      const termNum = parseInt(term, 10);
      
      const syllabusData = {
        class: classNum,
        term: termNum,
        originalName: req.file.originalname,
        fileId: fileId.toString(), // Store GridFS file ID
        size: req.file.size,
        uploadedBy,
        fileUrl: `/api/syllabus/file/${fileId}` // New endpoint to serve the file
      };

      // Save to database
      const syllabus = new Syllabus(syllabusData);
      await syllabus.save();

      res.status(201).json({
        message: 'Syllabus uploaded successfully',
        syllabus,
        type: 'success'
      });

    } catch (error) {
      console.error('Error in syllabus upload:', {
        error: error.message,
        stack: error.stack,
        code: error.code,
      });
      
      res.status(500).json({
        message: 'Failed to upload syllabus',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined,
        type: 'error'
      });
    }
  }
];

// Get file by ID
// Add this new method to handle file downloads
exports.getFile = async (req, res) => {
  try {
    const { fileId } = req.params;
    
    // Get file metadata
    const syllabus = await Syllabus.findOne({ fileId });
    if (!syllabus) {
      return res.status(404).json({ message: 'File not found', type: 'error' });
    }

    // Get file from GridFS
    const fileBuffer = await getFileById(fileId);
    
    // Set headers for file download
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `inline; filename="${syllabus.originalName}"`,
      'Content-Length': fileBuffer.length
    });
    
    // Send the file
    res.send(fileBuffer);
    
  } catch (error) {
    console.error('Error retrieving file:', error);
    res.status(500).json({ 
      message: 'Error retrieving file',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
      type: 'error' 
    });
  }
};

// Update the deleteSyllabus function to use GridFS
exports.deleteSyllabus = async (req, res) => {
  try {
    const syllabus = await Syllabus.findById(req.params.id);
    if (!syllabus) {
      return res.status(404).json({ message: 'Syllabus not found', type: 'error' });
    }

    // Delete file from GridFS
    await deleteFileById(syllabus.fileId);
    
    // Delete from database
    await Syllabus.findByIdAndDelete(req.params.id);
    
    res.json({ message: 'Syllabus deleted successfully', type: 'success' });
    
  } catch (error) {
    console.error('Error deleting syllabus:', error);
    res.status(500).json({ 
      message: 'Failed to delete syllabus',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
      type: 'error' 
    });
  }
};

// Update the getSyllabus function to include file URL
exports.getSyllabus = async (req, res) => {
  try {
    const syllabus = await Syllabus.findById(req.params.id);
    if (!syllabus) {
      return res.status(404).json({ message: 'Syllabus not found', type: 'error' });
    }
    
    // Add file URL to the response
    const syllabusWithUrl = {
      ...syllabus.toObject(),
      fileUrl: `/api/syllabus/file/${syllabus.fileId}`
    };
    
    res.json(syllabusWithUrl);
    
  } catch (error) {
    console.error('Error fetching syllabus:', error);
    res.status(500).json({ 
      message: 'Failed to fetch syllabus',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
      type: 'error' 
    });
  }
};

// Update the updateSyllabus function to use GridFS
exports.updateSyllabus = [
  upload.single('file'),
  async (req, res) => {
    try {
      const { class: classNumber, term } = req.body;
      const syllabusId = req.params.id;
      
      // Find the existing syllabus
      const existingSyllabus = await Syllabus.findById(syllabusId);
      if (!existingSyllabus) {
        return res.status(404).json({ message: 'Syllabus not found', type: 'error' });
      }

      // Update fields
      existingSyllabus.class = classNumber || existingSyllabus.class;
      existingSyllabus.term = term || existingSyllabus.term;
      
      // If a new file is uploaded
      if (req.file) {
        // Delete the old file from GridFS
        await deleteFileById(existingSyllabus.fileId);
        
        // Upload new file to GridFS
        const fileId = await uploadFile(req.file.buffer, {
          filename: req.file.originalname,
          contentType: req.file.mimetype,
          metadata: {
            originalName: req.file.originalname,
            size: req.file.size
          }
        });
        
        // Update with new file
        existingSyllabus.fileId = fileId.toString();
        existingSyllabus.originalName = req.file.originalname;
        existingSyllabus.size = req.file.size;
        existingSyllabus.fileUrl = `/api/syllabus/file/${fileId}`;
      }

      await existingSyllabus.save();
      
      res.status(200).json({
        message: 'Syllabus updated successfully',
        syllabus: existingSyllabus,
        type: 'success'
      });
      
    } catch (error) {
      console.error('Error updating syllabus:', error);
      res.status(500).json({ 
        message: 'Failed to update syllabus',
        error: error.message,
        type: 'error' 
      });
    }
  }
];

// Get syllabus by class and term
exports.getSyllabusByClassAndTerm = async (req, res) => {
  try {
    const { class: classNumber, term } = req.params;
    
    if (!classNumber || !term) {
      return res.status(400).json({ 
        success: false,
        message: 'Class and term are required',
        type: 'error' 
      });
    }

    console.log(`Fetching syllabus for class ${classNumber}, term ${term}`);
    
    const syllabus = await Syllabus.findOne({ 
      class: parseInt(classNumber, 10), 
      term: parseInt(term, 10) 
    });

    if (!syllabus) {
      console.log(`Syllabus not found for class ${classNumber}, term ${term}`);
      return res.status(404).json({ 
        success: false,
        message: 'Syllabus not found',
        type: 'error' 
      });
    }

    console.log(`Found syllabus with fileId: ${syllabus.fileId}`);
    
    try {
      // Get file from GridFS
      const fileBuffer = await getFileById(syllabus.fileId);
      
      if (!fileBuffer || fileBuffer.length === 0) {
        throw new Error('File buffer is empty');
      }
      
      // Sanitize filename
      const filename = syllabus.originalName.replace(/[^\w\d.-]/g, '_');
      
      // Set headers for file download
      res.set({
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Content-Length': fileBuffer.length,
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      });
      
      console.log(`Sending file: ${filename} (${fileBuffer.length} bytes)`);
      
      // Send the file
      res.send(fileBuffer);
      
    } catch (fileError) {
      console.error('Error retrieving file from GridFS:', fileError);
      return res.status(500).json({
        success: false,
        message: 'Error retrieving file content',
        error: process.env.NODE_ENV === 'development' ? fileError.message : undefined,
        type: 'error'
      });
    }
    
  } catch (error) {
    console.error('Error in getSyllabusByClassAndTerm:', error);
    
    if (!res.headersSent) {
      res.status(500).json({ 
        success: false,
        message: 'Error retrieving syllabus',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined,
        type: 'error',
        code: error.code
      });
    }
  }
};

exports.dashboard = (req, res) => {
  res.json({ message: 'Welcome to the Admin Dashboard API' });
};

// Get all syllabuses with optional class and term filters
exports.getSyllabuses = async (req, res) => {
  try {
    const { class: classNumber, term } = req.query;
    const query = {};
    
    if (classNumber) query.class = parseInt(classNumber, 10);
    if (term) query.term = parseInt(term, 10);
    
    const syllabuses = await Syllabus.find(query)
      .sort({ class: 1, term: 1, uploadedAt: -1 });
    
    res.json(syllabuses);
  } catch (error) {
    console.error('Error getting syllabuses:', error);
    res.status(500).json({ error: 'Failed to get syllabuses' });
  }
};

// Get syllabus count
exports.getSyllabusCount = async (req, res) => {
  try {
    console.log('Fetching syllabus count...');
    
    // Verify database connection
    const db = mongoose.connection;
    if (db.readyState !== 1) {
      console.error('MongoDB not connected. State:', db.readyState);
      return res.status(500).json({ 
        error: 'Database not connected',
        dbState: db.readyState,
        dbStates: {
          0: 'disconnected',
          1: 'connected',
          2: 'connecting',
          3: 'disconnecting'
        }
      });
    }
    
    // Check if Syllabus model exists and has the expected methods
    if (!Syllabus || typeof Syllabus.countDocuments !== 'function') {
      console.error('Syllabus model or countDocuments method not available');
      return res.status(500).json({ 
        error: 'Syllabus model not properly initialized',
        syllabusModel: !!Syllabus,
        hasCountDocuments: Syllabus && typeof Syllabus.countDocuments === 'function'
      });
    }
    
    // Execute the count query with error handling
    let count;
    try {
      count = await Syllabus.countDocuments({});
      console.log(`Found ${count} syllabus documents`);
    } catch (queryError) {
      console.error('Error in Syllabus.countDocuments:', {
        message: queryError.message,
        name: queryError.name,
        code: queryError.code,
        stack: queryError.stack
      });
      throw queryError; // Will be caught by the outer catch
    }
    
    res.json({ 
      success: true,
      count,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Error in getSyllabusCount:', {
      message: error.message,
      name: error.name,
      code: error.code,
      stack: error.stack
    });
    
    // Check if response was already sent
    if (res.headersSent) {
      console.error('Headers already sent, cannot send error response');
      return;
    }
    
    res.status(500).json({ 
      error: 'Failed to get syllabus count',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined,
      code: error.code
    });
  }
};
