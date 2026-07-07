const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'jacovet_secret_key_123';

// General authentication guard
const authenticate = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Authorization token required. Access denied.' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    console.error('JWT verification error:', error);
    return res.status(403).json({ message: 'Invalid or expired session token.' });
  }
};

// Role-based access control guard
const restrictTo = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required.' });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Access denied: Insufficient privileges.' });
    }

    next();
  };
};

module.exports = {
  authenticate,
  restrictTo,
  JWT_SECRET
};
