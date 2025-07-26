const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;
  
  // Check authorization header
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ 
      error: 'Authorization header missing or malformed',
      code: 'AUTH_HEADER_MISSING'
    });
  }

  const token = authHeader.split(' ')[1];
  
  // Validate token format
  if (!token || typeof token !== 'string') {
    return res.status(401).json({ 
      error: 'Invalid token format',
      code: 'INVALID_TOKEN_FORMAT'
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Additional token validation
    if (!decoded.id || !decoded.exp) {
      return res.status(401).json({ 
        error: 'Invalid token payload',
        code: 'INVALID_TOKEN_PAYLOAD'
      });
    }

    // Check token expiration
    if (decoded.exp < Date.now() / 1000) {
      return res.status(401).json({ 
        error: 'Token has expired',
        code: 'TOKEN_EXPIRED'
      });
    }

    req.user = decoded;
    next();
  } catch (err) {
    console.error('Token verification error:', err);
    return res.status(401).json({ 
      error: 'Invalid or expired token',
      code: 'INVALID_TOKEN'
    });
  }
};

module.exports = authMiddleware;
