const jwt = require('jsonwebtoken');
const User = require('../models/userModel'); // Import the User model

const authenticateUser = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({ message: 'Access denied. No token provided' });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.API_SECRET);
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        return res.status(401).json({ message: 'Token expired. Please log in again' });
      }
      return res.status(401).json({ message: 'Invalid token' });
    }

    const user = await User.findById(decoded.userId);

    if (!user) {
      return res.status(401).json({ message: 'Invalid token. User not found' });
    }

    req.userId = user._id; // Using a consistent property name for user ID
    req.user = user; // Attaching the user object for further use in routes
    next();
  } catch (error) {
    console.error('Error in authentication middleware:', error);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
};

module.exports = authenticateUser;
