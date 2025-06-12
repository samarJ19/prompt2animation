const express = require('express');
const prisma = require('../config/prisma');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Get user profile
router.get('/profile', authenticateToken, async (req, res) => {
  res.json({
    success: true,
    data: { user: req.user }
  });
});

// Update user profile
router.put('/profile', authenticateToken, async (req, res) => {
  try {
    const { firstName, lastName } = req.body;
    
    const updatedUser = await prisma.user.update({
      where: { id: req.user.id },
      data: {
        firstName,
        lastName
      },
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
    
    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: { user: updatedUser }
    });
    
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update profile'
    });
  }
});

// Get usage statistics
router.get('/usage', authenticateToken, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        plan: true,
        apiCalls: true,
        maxCalls: true,
        _count: {
          select: {
            animations: true
          }
        }
      }
    });
    
    res.json({
      success: true,
      data: {
        usage: {
          plan: user.plan,
          apiCalls: user.apiCalls,
          maxCalls: user.maxCalls,
          remainingCalls: user.maxCalls - user.apiCalls,
          totalAnimations: user._count.animations
        }
      }
    });
    
  } catch (error) {
    console.error('Get usage error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get usage statistics'
    });
  }
});

module.exports = router;
