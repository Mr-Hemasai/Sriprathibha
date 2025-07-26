const mongoose = require('mongoose');
const { GridFSBucket } = require('mongodb');
const { Readable } = require('stream');

let gfs;
let gridFSBucket;

// Initialize GridFS
const initGridFS = () => {
  const conn = mongoose.connection;
  gridFSBucket = new mongoose.mongo.GridFSBucket(conn.db, {
    bucketName: 'syllabusFiles'
  });
  gfs = conn.db.collection('syllabusFiles.files');
  return { gfs, gridFSBucket };
};

// Upload file to GridFS
const uploadFile = (fileBuffer, options) => {
  return new Promise((resolve, reject) => {
    const bucket = gridFSBucket || initGridFS().gridFSBucket;
    
    const uploadStream = bucket.openUploadStream(options.filename, {
      metadata: options.metadata || {},
      contentType: options.contentType || 'application/pdf'
    });

    const readableStream = new Readable();
    readableStream.push(fileBuffer);
    readableStream.push(null);

    readableStream.pipe(uploadStream)
      .on('error', (error) => {
        console.error('Error uploading file to GridFS:', error);
        reject(error);
      })
      .on('finish', () => {
        resolve(uploadStream.id);
      });
  });
};

// Get file from GridFS by ID
const getFileById = (fileId) => {
  return new Promise((resolve, reject) => {
    const bucket = gridFSBucket || initGridFS().gridFSBucket;
    
    const downloadStream = bucket.openDownloadStream(new mongoose.Types.ObjectId(fileId));
    const chunks = [];

    downloadStream.on('data', (chunk) => {
      chunks.push(chunk);
    });

    downloadStream.on('error', (error) => {
      console.error('Error retrieving file from GridFS:', error);
      reject(error);
    });

    downloadStream.on('end', () => {
      resolve(Buffer.concat(chunks));
    });
  });
};

// Delete file from GridFS by ID
const deleteFileById = (fileId) => {
  return new Promise((resolve, reject) => {
    const bucket = gridFSBucket || initGridFS().gridFSBucket;
    
    bucket.delete(new mongoose.Types.ObjectId(fileId), (error) => {
      if (error) {
        console.error('Error deleting file from GridFS:', error);
        reject(error);
      } else {
        resolve(true);
      }
    });
  });
};

module.exports = {
  initGridFS,
  uploadFile,
  getFileById,
  deleteFileById,
  getBucket: () => gridFSBucket || initGridFS().gridFSBucket,
  getGFS: () => gfs || initGridFS().gfs
};
