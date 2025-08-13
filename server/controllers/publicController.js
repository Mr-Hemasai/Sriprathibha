const mongoose = require('mongoose');
const { getFileById } = require('../utils/gridfsEvents');

// We'll use the getFileById utility which handles GridFS operations
// No need to initialize GridFS here as it's already handled in the utility

// Get syllabus by class and term
exports.getSyllabusByClassAndTerm = async (req, res) => {
  try {
    console.log('[Public] Starting getSyllabusByClassAndTerm');
    
    // Validate input parameters
    if (!req.params.class || !req.params.term) {
      console.log('[Public] Missing required parameters');
      return res.status(400).json({
        success: false,
        message: 'Class and term parameters are required'
      });
    }
    
    const classNumber = parseInt(req.params.class, 10);
    const term = parseInt(req.params.term, 10);
    
    if (isNaN(classNumber) || isNaN(term)) {
      console.log('[Public] Invalid parameters:', { class: req.params.class, term: req.params.term });
      return res.status(400).json({
        success: false,
        message: 'Invalid class or term parameter'
      });
    }
    
    console.log(`[Public] Fetching syllabus for class ${classNumber}, term ${term}`);
    
    // Get the Syllabus model
    const Syllabus = mongoose.model('Syllabus');
    console.log('[Public] Looking up syllabus in database...');
    
    const query = { class: classNumber, term: term };
    console.log('[Public] Query:', JSON.stringify(query));
    
    const syllabus = await Syllabus.findOne(query).lean();
    console.log('[Public] Query result:', syllabus ? 'Found' : 'Not found');

    if (!syllabus) {
      console.log(`[Public] Syllabus not found for class ${classNumber}, term ${term}`);
      return res.status(404).json({ 
        success: false,
        message: 'Syllabus not found for the specified class and term'
      });
    }

    console.log(`[Public] Found syllabus with fileId: ${syllabus.fileId}`);
    
    if (!syllabus.fileId) {
      throw new Error('Syllabus record found but fileId is missing');
    }
    
    console.log('[Public] Getting file from GridFS with ID:', syllabus.fileId);
    
    try {
      // Get file buffer using the utility function
      const fileBuffer = await getFileById(syllabus.fileId);
      
      if (!fileBuffer || fileBuffer.length === 0) {
        throw new Error('File is empty or not found in GridFS');
      }
      
      // Set headers for file download
      res.set({
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${syllabus.originalName || 'syllabus.pdf'}"`,
        'Content-Length': fileBuffer.length,
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      });
      
      // Send the file buffer
      res.send(fileBuffer);
    } catch (error) {
      console.error('[Public] Error in file processing:', error);
      if (!res.headersSent) {
        res.status(500).json({
          success: false,
          message: 'Error processing file download',
          error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
      }
    }
  } catch (error) {
    console.error('[Public] Unexpected error in getSyllabusByClassAndTerm:', error);
    if (!res.headersSent) {
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
};
