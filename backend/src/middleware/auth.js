const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../config/env');
const prisma = require('../config/prisma');

const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access token required'
      });
    }
    
    const decoded = jwt.verify(token, JWT_SECRET);
    
    // Get user from database
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        username: true,
        firstName: true,
        lastName: true,
        plan: true,
        apiCalls: true,
        maxCalls: true
      }
    });
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User not found'
      });
    }
    
    req.user = user;
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token'
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token expired'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Authentication error'
    });
  }
};

// Check API usage limits
const checkUsageLimit = async (req, res, next) => {
  try {
    const { user } = req;
    
    if (user.apiCalls >= user.maxCalls) {
      return res.status(429).json({
        success: false,
        message: 'API usage limit exceeded',
        usage: {
          current: user.apiCalls,
          limit: user.maxCalls,
          plan: user.plan
        }
      });
    }
    
    next();
  } catch (error) {
    console.error('Usage limit check error:', error);
    res.status(500).json({
      success: false,
      message: 'Usage check error'
    });
  }
};

module.exports = {
  authenticateToken,
  checkUsageLimit
};
