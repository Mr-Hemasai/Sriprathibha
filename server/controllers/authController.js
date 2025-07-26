const jwt = require('jsonwebtoken');
const { createError } = require('../utils/errorUtils');

const ADMIN_USERNAME = process.env.ADMIN_USERNAME;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

if (!ADMIN_USERNAME || !ADMIN_PASSWORD || !process.env.JWT_SECRET) {
  console.error('Missing required environment variables for admin login');
  process.exit(1);
}

exports.login = async (req, res, next) => {
  try {
    console.log('Login request received:', {
      body: req.body,
      headers: req.headers,
      method: req.method,
      url: req.originalUrl
    });

    const { username, password } = req.body;

    if (!username || !password) {
      return next(createError(400, 'Username and password are required'));
    }

    if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
      console.log('Login successful for user:', username);
      const token = jwt.sign({ 
        id: username,
        username,
        exp: Math.floor(Date.now() / 1000) + (60 * 60) // 1 hour
      }, process.env.JWT_SECRET, { 
        algorithm: 'HS256'
      });
      res.json({ token });
    } else {
      console.log('Invalid credentials for user:', username);
      return next(createError(401, 'Invalid credentials'));
    }
  } catch (error) {
    console.error('Login error:', error);
    return next(createError(500, 'Login failed', error));
  }
};

exports.verify = async (req, res, next) => {
  try {
    const { username } = req.user;
    if (!username) {
      return next(createError(401, 'Invalid token'));
    }
    res.json({ message: 'Token is valid', username });
  } catch (error) {
    return next(createError(500, 'Token verification failed', error));
  }
};
