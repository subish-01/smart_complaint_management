const express = require('express');
const router = express.Router();
const Complaint = require('../models/Complaint');
const { authenticate, isAdmin } = require('../middleware/auth');

// All admin routes require authentication
router.use(authenticate);
router.use(isAdmin);

// Get all complaints (admin view with priority)
router.get('/complaints', async (req, res) => {
  try {
    const { status, urgency, sort = '-priorityScore' } = req.query;

    const query = {};
    if (status && status !== 'all') query.status = status;
    if (urgency && urgency !== 'all') query.urgency = urgency;

    const complaints = await Complaint.find(query)
      .sort(sort)
      .select('-__v');

    res.json({
      success: true,
      data: complaints
    });
  } catch (error) {
    console.error('Get admin complaints error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching complaints'
    });
  }
});

// Update complaint status
router.patch('/complaints/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    const { id } = req.params;

    if (!['Pending', 'In Progress', 'Resolved', 'Closed'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status'
      });
    }

    const complaint = await Complaint.findOne({ id });
    
    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: 'Complaint not found'
      });
    }

    const oldStatus = complaint.status;
    complaint.status = status;

    // Set resolved date if status changed to Resolved
    if (status === 'Resolved' && oldStatus !== 'Resolved') {
      complaint.resolvedDate = new Date();
    }

    // Add update record
    complaint.updates.push({
      status,
      message: `Status changed from ${oldStatus} to ${status}`,
      date: new Date(),
      updatedBy: req.user.username
    });

    await complaint.save();

    res.json({
      success: true,
      message: 'Status updated successfully',
      data: complaint
    });
  } catch (error) {
    console.error('Update status error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating status'
    });
  }
});

// Auto-prioritize all complaints
router.post('/complaints/prioritize', async (req, res) => {
  try {
    const complaints = await Complaint.find({});
    
    for (const complaint of complaints) {
      // Recalculate priority based on urgency, category, and age
      complaint.calculatePriorityScore();
      await complaint.save();
    }

    res.json({
      success: true,
      message: 'All complaints prioritized successfully',
      count: complaints.length
    });
  } catch (error) {
    console.error('Prioritize error:', error);
    res.status(500).json({
      success: false,
      message: 'Error prioritizing complaints'
    });
  }
});

// Assign complaint to staff
router.patch('/complaints/:id/assign', async (req, res) => {
  try {
    const { assignedTo } = req.body;
    const { id } = req.params;

    const complaint = await Complaint.findOne({ id });
    
    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: 'Complaint not found'
      });
    }

    complaint.assignedTo = assignedTo;
    complaint.updates.push({
      status: complaint.status,
      message: assignedTo ? `Assigned to ${assignedTo}` : 'Assignment removed',
      date: new Date(),
      updatedBy: req.user.username
    });

    await complaint.save();

    res.json({
      success: true,
      message: 'Complaint assigned successfully',
      data: complaint
    });
  } catch (error) {
    console.error('Assign complaint error:', error);
    res.status(500).json({
      success: false,
      message: 'Error assigning complaint'
    });
  }
});

// Delete complaint
router.delete('/complaints/:id', async (req, res) => {
  try {
    const complaint = await Complaint.findOneAndDelete({ id: req.params.id });
    
    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: 'Complaint not found'
      });
    }

    res.json({
      success: true,
      message: 'Complaint deleted successfully'
    });
  } catch (error) {
    console.error('Delete complaint error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting complaint'
    });
  }
});

module.exports = router;