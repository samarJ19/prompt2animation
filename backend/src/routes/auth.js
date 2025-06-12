const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const prisma = require('../config/prisma');
const { JWT_SECRET, JWT_EXPIRE } = require('../config/env');
const { validate, schemas } = require('../middleware/validation');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Register new user
router.post('/register', validate(schemas.register), async (req, res) => {
  try {
    const { email, username, password, firstName, lastName } = req.body;
    
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);
    
    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        username,
        password: hashedPassword,
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
        createdAt: true
      }
    });
    
    // Generate token
    const token = jwt.sign(
      { userId: user.id },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRE }
    );
    
    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: { user, token }
    });
    
  } catch (error) {
    console.error('Register error:', error);
    
    if (error.code === 'P2002') {
      return res.status(400).json({
        success: false,
        message: 'Email or username already exists'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Registration failed'
    });
  }
});

// Login user
router.post('/login', validate(schemas.login), async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Find user
    const user = await prisma.user.findUnique({
      where: { email }
    });
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }
    
    // Check password
    const isValidPassword = await bcrypt.compare(password, user.password);
    
    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }
    
    // Generate token
    const token = jwt.sign(
      { userId: user.id },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRE }
    );
    
    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;
    
    res.json({
      success: true,
      message: 'Login successful',
      data: {
        user: userWithoutPassword,
        token
      }
    });
    
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Login failed'
    });
  }
});

// Get current user
router.get('/me', authenticateToken, async (req, res) => {
  res.json({
    success: true,
    data: { user: req.user }
  });
});

module.exports = router;
