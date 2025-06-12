const express = require('express');
const axios = require('axios');
const prisma = require('../config/prisma');
const { authenticateToken, checkUsageLimit } = require('../middleware/auth');
const { validate, schemas } = require('../middleware/validation');
const { MANIM_API_URL } = require('../config/env');

const router = express.Router();

// Generate animation
router.post('/generate', 
  authenticateToken, 
  checkUsageLimit, 
  validate(schemas.generateAnimation), 
  async (req, res) => {
    try {
      const { title, description, prompt, duration, resolution, frameRate, backgroundColor } = req.body;
      const userId = req.user.id;
      
      // Create animation record
      const animation = await prisma.animation.create({
        data: {
          title,
          description,
          prompt,
          duration,
          resolution,
          frameRate,
          backgroundColor,
          userId,
          status: 'PENDING'
        }
      });
      
      // Call FastAPI to generate Manim code
      try {
        const manimResponse = await axios.post(`${MANIM_API_URL}/generate-manim`, {
          prompt,
          duration,
          resolution,
          frame_rate: frameRate,
          background_color: backgroundColor
        });
        
        // Update animation with generated code
        const updatedAnimation = await prisma.animation.update({
          where: { id: animation.id },
          data: {
            manimCode: manimResponse.data.manim_code,
            status: 'PROCESSING'
          }
        });
        
        // Call FastAPI to render animation
        const renderResponse = await axios.post(`${MANIM_API_URL}/render-animation`, {
          manim_code: manimResponse.data.manim_code,
          animation_id: animation.id,
          settings: {
            duration,
            resolution,
            frame_rate: frameRate,
            background_color: backgroundColor
          }
        });
        
        // Update animation with video path
        const finalAnimation = await prisma.animation.update({
          where: { id: animation.id },
          data: {
            videoPath: renderResponse.data.video_path,
            status: 'COMPLETED'
          },
          include: {
            user: {
              select: {
                username: true
              }
            }
          }
        });
        
        // Update user API call count
        await prisma.user.update({
          where: { id: userId },
          data: {
            apiCalls: { increment: 1 }
          }
        });
        
        res.json({
          success: true,
          message: 'Animation generated successfully',
          data: { animation: finalAnimation }
        });
        
      } catch (apiError) {
        console.error('FastAPI error:', apiError.response?.data || apiError.message);
        
        // Update animation status to failed
        await prisma.animation.update({
          where: { id: animation.id },
          data: {
            status: 'FAILED',
            errorLog: apiError.response?.data?.detail || apiError.message
          }
        });
        
        res.status(500).json({
          success: false,
          message: 'Failed to generate animation',
          error: apiError.response?.data?.detail || 'FastAPI service error'
        });
      }
      
    } catch (error) {
      console.error('Generate animation error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create animation'
      });
    }
  }
);

// Get user's animations
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    const skip = (page - 1) * limit;
    
    const where = {
      userId: req.user.id,
      ...(status && { status })
    };
    
    const [animations, total] = await Promise.all([
      prisma.animation.findMany({
        where,
        skip: parseInt(skip),
        take: parseInt(limit),
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          title: true,
          description: true,
          status: true,
          duration: true,
          resolution: true,
          videoPath: true,
          thumbnail: true,
          createdAt: true,
          updatedAt: true
        }
      }),
      prisma.animation.count({ where })
    ]);
    
    res.json({
      success: true,
      data: {
        animations,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
    
  } catch (error) {
    console.error('Get animations error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get animations'
    });
  }
});

// Get specific animation
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    
    const animation = await prisma.animation.findFirst({
      where: {
        id,
        userId: req.user.id
      }
    });
    
    if (!animation) {
      return res.status(404).json({
        success: false,
        message: 'Animation not found'
      });
    }
    
    res.json({
      success: true,
      data: { animation }
    });
    
  } catch (error) {
    console.error('Get animation error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get animation'
    });
  }
});

// Delete animation
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    
    const animation = await prisma.animation.findFirst({
      where: {
        id,
        userId: req.user.id
      }
    });
    
    if (!animation) {
      return res.status(404).json({
        success: false,
        message: 'Animation not found'
      });
    }
    
    await prisma.animation.delete({
      where: { id }
    });
    
    res.json({
      success: true,
      message: 'Animation deleted successfully'
    });
    
  } catch (error) {
    console.error('Delete animation error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete animation'
    });
  }
});

module.exports = router;