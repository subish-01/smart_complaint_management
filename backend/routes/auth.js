const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { authenticate } = require('../middleware/auth');

// Generate JWT token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'your_super_secret_jwt_key', {
    expiresIn: '7d'
  });
};

// Admin login
router.post('/admin/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: 'Username and password are required'
      });
    }

    // Check for default admin (from env) or database user
    let user;
    if (username === process.env.ADMIN_USERNAME || username === 'admin') {
      // Check if admin user exists in database, if not create it
      user = await User.findOne({ username: 'admin' });
      
      if (!user) {
        // Create default admin user
        user = new User({
          username: process.env.ADMIN_USERNAME || 'admin',
          email: 'admin@scms.com',
          password: process.env.ADMIN_PASSWORD || 'admin123',
          role: 'admin'
        });
        await user.save();
      }
      
      // Verify password
      const isMatch = await user.comparePassword(password);
      if (!isMatch) {
        // Also check against env password for initial setup
        if (password !== (process.env.ADMIN_PASSWORD || 'admin123')) {
          return res.status(401).json({
            success: false,
            message: 'Invalid credentials'
          });
        }
      }
    } else {
      user = await User.findOne({ username: username.toLowerCase() });
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Invalid credentials'
        });
      }

      const isMatch = await user.comparePassword(password);
      if (!isMatch) {
        return res.status(401).json({
          success: false,
          message: 'Invalid credentials'
        });
      }
    }

    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Account is inactive'
      });
    }

    const token = generateToken(user._id);

    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during login'
    });
  }
});

// Verify token
router.get('/verify', authenticate, (req, res) => {
  res.json({
    success: true,
    user: {
      id: req.user._id,
      username: req.user.username,
      email: req.user.email,
      role: req.user.role
    }
  });
});

module.exports = router;