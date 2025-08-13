require('dotenv').config();

const fs = require('fs');
const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const cors = require('cors');
const admissionRoutes = require('./routes/admissions');
const eventRoutes = require('./routes/events');
const contactRoutes = require('./routes/contact');
const authRoutes = require('./routes/auth');
const adminRoutes = require('./routes/admin');
const publicRoutes = require('./routes/public');
const teachersPublicRoutes = require('./routes/teachers');

const app = express();

// Configure CORS with permissive settings for development
const corsOptions = {
  origin: ['http://localhost:3001', 'http://localhost:3000'],
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  optionsSuccessStatus: 200
};

// Apply CORS middleware with the specified options
app.use(cors(corsOptions));

// Handle preflight requests
app.options('*', cors(corsOptions));

// Add headers before the routes are defined
app.use(function (req, res, next) {
  // Website you wish to allow to connect
  res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3001');
  // Request methods you wish to allow
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
  // Request headers you wish to allow
  res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type,authorization');
  // Set to true if you need the website to include cookies in the requests sent
  // to the API (e.g. in case you use sessions)
  res.setHeader('Access-Control-Allow-Credentials', true);
  // Pass to next layer of middleware
  next();
});

// Parse JSON bodies
app.use(express.json({ 
  limit: '50mb',
  verify: (req, res, buf) => {
    req.rawBody = buf;
  }
}));

// Parse URL-encoded bodies
app.use(express.urlencoded({ 
  extended: true, 
  limit: '50mb',
  parameterLimit: 1000000
}));

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// Create necessary upload directories if they don't exist
const uploadsDir = path.join(__dirname, 'uploads');
const eventsDir = path.join(uploadsDir, 'events');
const syllabusDir = path.join(uploadsDir, 'syllabus');

const createDirectoryIfNotExists = (dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true, mode: 0o755 });
    console.log(`Created directory: ${dir}`);
  }
};

// Ensure all required directories exist
createDirectoryIfNotExists(uploadsDir);
createDirectoryIfNotExists(eventsDir);
createDirectoryIfNotExists(syllabusDir);

// Set directory permissions (for Unix-like systems)
if (process.platform !== 'win32') {
  try {
    fs.chmodSync(uploadsDir, 0o755);
    fs.chmodSync(eventsDir, 0o755);
    fs.chmodSync(syllabusDir, 0o755);
  } catch (err) {
    console.error('Error setting directory permissions:', err);
  }
}

// Serve uploaded files with proper caching headers
app.use('/uploads', express.static(uploadsDir, {
  setHeaders: (res, filePath) => {
    // Set caching headers for 1 year for static files
    res.setHeader('Cache-Control', 'public, max-age=31536000');
    
    // Set content type based on file extension
    const ext = path.extname(filePath).toLowerCase();
    if (ext === '.pdf') {
      res.setHeader('Content-Type', 'application/pdf');
    } else if (['.jpg', '.jpeg', '.png', '.gif'].includes(ext)) {
      res.setHeader('Content-Type', `image/${ext === '.jpg' ? 'jpeg' : ext.substring(1)}`);
    }
  }
}));

// Log all requests for debugging
app.use((req, res, next) => {
  console.log('\n--- New Request ---');
  console.log(`${new Date().toISOString()} - ${req.method} ${req.originalUrl}`);
  console.log('Headers:', req.headers);
  console.log('Body:', req.body);
  
  // Log response finish
  const originalEnd = res.end;
  res.end = function(chunk, encoding) {
    console.log(`\n--- Response ---`);
    console.log(`Status: ${res.statusCode}`);
    console.log('Response Headers:', res.getHeaders());
    if (chunk) {
      console.log('Response Body:', chunk.toString());
    }
    originalEnd.call(this, chunk, encoding);
  };
  
  next();
});

// MongoDB connection
const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI;
const { initGridFS } = require('./utils/gridfsEvents');

mongoose.connect(mongoUri, {
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
  family: 4,
  retryWrites: true,
  w: 'majority'
})
  .then(() => {
    console.log('MongoDB connected');
    // Initialize GridFS for events
    initGridFS();
    console.log('GridFS initialized');
  })
  .catch(err => console.error('MongoDB connection error:', err));

// Routes
app.use('/api/admissions', admissionRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/public', publicRoutes); // Public routes (no auth required)
app.use('/api/public/teachers', teachersPublicRoutes); // Public teachers routes

// Apply auth middleware to all admin routes
app.use('/api/admin', (req, res, next) => {
  // Import auth middleware here to avoid circular dependency
  const auth = require('./middleware/authMiddleware');
  return auth(req, res, next);
}, adminRoutes);

// Root route
app.get('/', (req, res) => {
  res.redirect('/admin/login');
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Production route - serve React app
if (process.env.NODE_ENV === 'production') {
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/build/index.html'));
  });
}

// Catchall route for non-production
if (process.env.NODE_ENV !== 'production') {
  app.use((req, res) => {
    res.status(404).json({ error: 'Not Found' });
  });
}

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
