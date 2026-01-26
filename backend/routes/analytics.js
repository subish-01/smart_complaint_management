const express = require('express');
const router = express.Router();
const Complaint = require('../models/Complaint');

// Get statistics
router.get('/stats', async (req, res) => {
  try {
    const total = await Complaint.countDocuments();
    const pending = await Complaint.countDocuments({ status: 'Pending' });
    const inProgress = await Complaint.countDocuments({ status: 'In Progress' });
    const resolved = await Complaint.countDocuments({ status: 'Resolved' });
    const closed = await Complaint.countDocuments({ status: 'Closed' });
    const resolvedTotal = resolved + closed;
    const resolutionRate = total > 0 ? ((resolvedTotal / total) * 100).toFixed(2) : 0;

    // Urgency breakdown
    const highUrgency = await Complaint.countDocuments({ urgency: 'High' });
    const mediumUrgency = await Complaint.countDocuments({ urgency: 'Medium' });
    const lowUrgency = await Complaint.countDocuments({ urgency: 'Low' });

    res.json({
      success: true,
      data: {
        total,
        pending,
        inProgress,
        resolved,
        closed,
        resolvedTotal,
        resolutionRate: parseFloat(resolutionRate),
        urgency: {
          high: highUrgency,
          medium: mediumUrgency,
          low: lowUrgency
        }
      }
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching statistics'
    });
  }
});

// Get complaints by category
router.get('/by-category', async (req, res) => {
  try {
    const categoryData = await Complaint.aggregate([
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 }
        }
      },
      {
        $sort: { count: -1 }
      }
    ]);

    res.json({
      success: true,
      data: categoryData.map(item => ({
        category: item._id,
        count: item.count
      }))
    });
  } catch (error) {
    console.error('Get category data error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching category data'
    });
  }
});

// Get complaints by status
router.get('/by-status', async (req, res) => {
  try {
    const statusData = await Complaint.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      },
      {
        $sort: { count: -1 }
      }
    ]);

    res.json({
      success: true,
      data: statusData.map(item => ({
        status: item._id,
        count: item.count
      }))
    });
  } catch (error) {
    console.error('Get status data error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching status data'
    });
  }
});

// Get timeline data (last N days)
router.get('/timeline', async (req, res) => {
  try {
    const days = parseInt(req.query.days) || 7;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const timelineData = await Complaint.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$createdAt' }
          },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ]);

    res.json({
      success: true,
      data: timelineData.map(item => ({
        date: item._id,
        count: item.count
      }))
    });
  } catch (error) {
    console.error('Get timeline error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching timeline data'
    });
  }
});

// Get top locations
router.get('/top-locations', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 5;
    
    const locationData = await Complaint.aggregate([
      {
        $group: {
          _id: '$location',
          count: { $sum: 1 }
        }
      },
      {
        $sort: { count: -1 }
      },
      {
        $limit: limit
      }
    ]);

    res.json({
      success: true,
      data: locationData.map(item => ({
        location: item._id,
        count: item.count
      }))
    });
  } catch (error) {
    console.error('Get top locations error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching location data'
    });
  }
});

// Get trend insights
router.get('/trends', async (req, res) => {
  try {
    const total = await Complaint.countDocuments();
    const resolved = await Complaint.countDocuments({ 
      status: { $in: ['Resolved', 'Closed'] } 
    });
    
    // Most common category
    const mostCommon = await Complaint.aggregate([
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 }
        }
      },
      {
        $sort: { count: -1 }
      },
      {
        $limit: 1
      }
    ]);

    // Average resolution time
    const resolvedComplaints = await Complaint.find({
      status: { $in: ['Resolved', 'Closed'] },
      resolvedDate: { $exists: true }
    });

    let avgResolutionTime = 0;
    if (resolvedComplaints.length > 0) {
      const totalDays = resolvedComplaints.reduce((acc, c) => {
        const days = (c.resolvedDate - c.createdAt) / (1000 * 60 * 60 * 24);
        return acc + days;
      }, 0);
      avgResolutionTime = Math.round(totalDays / resolvedComplaints.length);
    }

    res.json({
      success: true,
      data: {
        mostCommonCategory: mostCommon[0] ? {
          category: mostCommon[0]._id,
          count: mostCommon[0].count
        } : null,
        resolutionRate: total > 0 ? ((resolved / total) * 100).toFixed(2) : 0,
        averageResolutionTime: avgResolutionTime
      }
    });
  } catch (error) {
    console.error('Get trends error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching trend data'
    });
  }
});

module.exports = router;