const express = require('express');
const router = express.Router();
const Complaint = require('../models/Complaint');
const { uploadFiles } = require('../middleware/upload');

// Helper function to detect urgency
const detectUrgency = (description) => {
  const desc = description.toLowerCase();
  const highUrgencyKeywords = ['emergency', 'urgent', 'immediate', 'critical', 'dangerous', 'accident', 'fire', 'flooding', 'collapse'];
  const mediumUrgencyKeywords = ['soon', 'important', 'problem', 'issue', 'need', 'required'];
  
  if (highUrgencyKeywords.some(keyword => desc.includes(keyword))) return 'High';
  if (mediumUrgencyKeywords.some(keyword => desc.includes(keyword))) return 'Medium';
  return 'Low';
};

// Helper function to categorize complaint
const categorizeComplaint = (description, selectedCategory) => {
  const desc = description.toLowerCase();
  
  const categoryKeywords = {
    'Garbage': ['garbage', 'trash', 'waste', 'dump', 'rubbish', 'litter', 'garbage collection', 'bin'],
    'Street Light': ['light', 'lamp', 'streetlight', 'dark', 'bulb', 'illumination', 'street lamp'],
    'Water Leakage': ['water', 'leak', 'flood', 'drain', 'pipe', 'sewer', 'overflow', 'leakage'],
    'Road Damage': ['road', 'pothole', 'crack', 'damage', 'asphalt', 'pavement', 'path', 'street'],
    'Drainage': ['drain', 'drainage', 'block', 'clog', 'sewer', 'overflow'],
    'Parks': ['park', 'playground', 'garden', 'grass', 'bench', 'tree'],
    'Noise': ['noise', 'loud', 'sound', 'disturbance', 'annoying'],
    'Traffic': ['traffic', 'parking', 'vehicle', 'car', 'signal', 'congestion'],
  };

  let maxScore = 0;
  let detectedCategory = selectedCategory;

  for (const [category, keywords] of Object.entries(categoryKeywords)) {
    const score = keywords.reduce((acc, keyword) => {
      return acc + (desc.includes(keyword) ? 1 : 0);
    }, 0);

    if (score > maxScore) {
      maxScore = score;
      detectedCategory = category;
    }
  }

  return detectedCategory || selectedCategory;
};

// Create new complaint
router.post('/', uploadFiles, async (req, res) => {
  try {
    const {
      name,
      email,
      phone,
      category,
      location,
      description,
      coordinates,
      notifyEmail,
      notifySMS
    } = req.body;

    // Validation
    if (!name || !email || !phone || !category || !location || !description) {
      return res.status(400).json({
        success: false,
        message: 'All required fields must be provided'
      });
    }

    // Process uploaded files
    const images = [];
    if (req.files && req.files.length > 0) {
      req.files.forEach(file => {
        images.push({
          filename: file.filename,
          path: `/uploads/${file.filename}`,
          mimetype: file.mimetype,
          size: file.size
        });
      });
    }

    // Parse coordinates if provided
    let parsedCoordinates = null;
    if (coordinates) {
      try {
        const coords = JSON.parse(coordinates);
        parsedCoordinates = {
          latitude: parseFloat(coords.latitude),
          longitude: parseFloat(coords.longitude)
        };
      } catch (e) {
        // Ignore coordinate parsing errors
      }
    }

    // AI Analysis
    const aiCategory = categorizeComplaint(description, category);
    const urgency = detectUrgency(description);

    // Create complaint
    const complaint = new Complaint({
      name,
      email,
      phone,
      category: aiCategory,
      location,
      coordinates: parsedCoordinates,
      description,
      urgency,
      notifyEmail: notifyEmail === 'true' || notifyEmail === true,
      notifySMS: notifySMS === 'true' || notifySMS === true,
      images
    });

    await complaint.save();

    res.status(201).json({
      success: true,
      message: 'Complaint submitted successfully',
      data: complaint
    });
  } catch (error) {
    console.error('Create complaint error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating complaint',
      error: error.message
    });
  }
});

// Get all complaints (public)
router.get('/', async (req, res) => {
  try {
    const { status, category, urgency, search, page = 1, limit = 50, sort = '-createdAt' } = req.query;

    // Build query
    const query = {};
    if (status && status !== 'all') query.status = status;
    if (category && category !== 'all') query.category = category;
    if (urgency && urgency !== 'all') query.urgency = urgency;
    if (search) {
      query.$or = [
        { location: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { category: { $regex: search, $options: 'i' } }
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const complaints = await Complaint.find(query)
      .sort(sort)
      .limit(parseInt(limit))
      .skip(skip)
      .select('-__v');

    const total = await Complaint.countDocuments(query);

    res.json({
      success: true,
      data: complaints,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Get complaints error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching complaints'
    });
  }
});

// Get single complaint
router.get('/:id', async (req, res) => {
  try {
    const complaint = await Complaint.findOne({ id: req.params.id }).select('-__v');
    
    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: 'Complaint not found'
      });
    }

    res.json({
      success: true,
      data: complaint
    });
  } catch (error) {
    console.error('Get complaint error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching complaint'
    });
  }
});

// Get complaints by user email
router.get('/user/:email', async (req, res) => {
  try {
    const complaints = await Complaint.find({ email: req.params.email })
      .sort('-createdAt')
      .select('-__v');

    res.json({
      success: true,
      data: complaints
    });
  } catch (error) {
    console.error('Get user complaints error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching user complaints'
    });
  }
});

// Submit feedback
router.post('/:id/feedback', async (req, res) => {
  try {
    const { rating, comment } = req.body;

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: 'Rating must be between 1 and 5'
      });
    }

    const complaint = await Complaint.findOne({ id: req.params.id });
    
    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: 'Complaint not found'
      });
    }

    if (complaint.status !== 'Resolved') {
      return res.status(400).json({
        success: false,
        message: 'Feedback can only be submitted for resolved complaints'
      });
    }

    complaint.feedback = {
      rating: parseInt(rating),
      comment: comment || '',
      date: new Date()
    };

    await complaint.save();

    res.json({
      success: true,
      message: 'Feedback submitted successfully',
      data: complaint
    });
  } catch (error) {
    console.error('Submit feedback error:', error);
    res.status(500).json({
      success: false,
      message: 'Error submitting feedback'
    });
  }
});

module.exports = router;