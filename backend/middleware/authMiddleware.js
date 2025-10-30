// backend/middleware/authMiddleware.js
const jwt = require('jsonwebtoken');

// Use the SAME secret as your userController
const JWT_SECRET = 'my_super_secret_key_123';

module.exports = (req, res, next) => {
  const header = req.header('Authorization') || req.header('authorization');
  const token = header ? header.replace('Bearer ', '') : null;
  
  if (!token) {
    return res.status(401).json({ message: 'Access denied. No token provided.' });
  }

  try {
    // Verify the token using the new hardcoded secret
    const verified = jwt.verify(token, JWT_SECRET); 
    req.user = verified;
    next();
  } catch (err) {
    res.status(400).json({ message: 'Invalid token' });
  }
};