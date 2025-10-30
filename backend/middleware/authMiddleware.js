// backend/middleware/authMiddleware.js

const jwt = require('jsonwebtoken');

// Use the same secret key as in userController.js
const JWT_SECRET = 'my_super_secret_key_123';

module.exports = (req, res, next) => {
  const header = req.header('Authorization') || req.header('authorization');
  const token = header ? header.replace('Bearer ', '') : null;

  if (!token) {
    return res.status(401).json({ message: 'Access denied. No token provided.' });
  }

  try {
    // Verify the token using our defined secret
    const verified = jwt.verify(token, JWT_SECRET); 
    req.user = verified;
    next();
  } catch (err) {
    // This will catch expired tokens or tokens signed with the wrong secret
    res.status(400).json({ message: 'Invalid token' });
  }
};