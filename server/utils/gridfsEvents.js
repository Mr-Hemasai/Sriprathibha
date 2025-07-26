const mongoose = require('mongoose');
const { GridFSBucket } = require('mongodb');
const { Readable } = require('stream');

let gfs;
let gridFSBucket;

// Initialize GridFS for events
const initGridFS = () => {
  if (!mongoose.connection.db) {
    throw new Error('MongoDB connection not established');
  }
  
  if (!gridFSBucket) {
    gridFSBucket = new mongoose.mongo.GridFSBucket(mongoose.connection.db, {
      bucketName: 'syllabusFiles'
    });
    gfs = mongoose.connection.db.collection('syllabusFiles.files');
  }
  
  return { gfs, gridFSBucket };
};

// Upload file to GridFS
const uploadFile = (fileBuffer, options) => {
  if (!gridFSBucket) {
    initGridFS();
  }
  
  return new Promise((resolve, reject) => {
    const uploadStream = gridFSBucket.openUploadStream(options.filename, {
      metadata: options.metadata || {},
      contentType: options.contentType || 'image/jpeg'
    });

    const readableStream = new Readable();
    readableStream.push(fileBuffer);
    readableStream.push(null);

    readableStream.pipe(uploadStream)
      .on('error', (error) => {
        console.error('Error uploading event image to GridFS:', error);
        reject(error);
      })
      .on('finish', () => {
        resolve(uploadStream.id);
      });
  });
};

// Get file from GridFS by ID
const getFileById = (fileId) => {
  if (!gridFSBucket) {
    initGridFS();
  }
  
  return new Promise((resolve, reject) => {
    try {
      const downloadStream = gridFSBucket.openDownloadStream(new mongoose.Types.ObjectId(fileId));
      const chunks = [];
      
      downloadStream.on('data', (chunk) => {
        chunks.push(chunk);
      });
      
      downloadStream.on('error', (error) => {
        console.error('Error downloading file from GridFS:', error);
        reject(error);
      });
      
      downloadStream.on('end', () => {
        if (chunks.length === 0) {
          return reject(new Error('File not found'));
        }
        const fileBuffer = Buffer.concat(chunks);
        resolve(fileBuffer);
      });
    } catch (error) {
      console.error('Error in getFileById:', error);
      reject(error);
    }
  });
};

// Delete file from GridFS by ID
const deleteFileById = async (fileId) => {
  if (!gridFSBucket) {
    initGridFS();
  }
  
  try {
    const _id = new mongoose.Types.ObjectId(fileId);
    await gridFSBucket.delete(_id);
    return true;
  } catch (error) {
    console.error('Error deleting file from GridFS:', error);
    throw error;
  }
};

module.exports = {
  initGridFS,
  uploadFile,
  getFileById,
  deleteFileById,
  gfs: () => gfs,
  gridFSBucket: () => gridFSBucket
};
