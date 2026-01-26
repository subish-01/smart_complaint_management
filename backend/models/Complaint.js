const mongoose = require('mongoose');

const complaintSchema = new mongoose.Schema({
  id: {
    type: String,
    unique: true,
    required: false
  },
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    minlength: [2, 'Name must be at least 2 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    trim: true,
    lowercase: true,
    match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email']
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    trim: true
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: [
      'Garbage',
      'Street Light',
      'Water Leakage',
      'Road Damage',
      'Drainage',
      'Parks',
      'Noise',
      'Traffic',
      'Others'
    ]
  },
  location: {
    type: String,
    required: [true, 'Location is required'],
    trim: true
  },
  coordinates: {
    latitude: { type: Number },
    longitude: { type: Number }
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    trim: true,
    minlength: [10, 'Description must be at least 10 characters']
  },
  status: {
    type: String,
    enum: ['Pending', 'In Progress', 'Resolved', 'Closed'],
    default: 'Pending'
  },
  urgency: {
    type: String,
    enum: ['High', 'Medium', 'Low'],
    default: 'Low'
  },
  priorityScore: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  images: [{
    filename: String,
    path: String,
    mimetype: String,
    size: Number
  }],
  notifyEmail: {
    type: Boolean,
    default: true
  },
  notifySMS: {
    type: Boolean,
    default: false
  },
  feedback: {
    rating: { type: Number, min: 1, max: 5 },
    comment: { type: String },
    date: { type: Date }
  },
  resolvedDate: {
    type: Date
  },
  assignedTo: {
    type: String,
    default: null
  },
  updates: [{
    status: String,
    message: String,
    date: { type: Date, default: Date.now },
    updatedBy: String
  }]
}, {
  timestamps: true
});

// Indexes for better query performance
complaintSchema.index({ status: 1 });
complaintSchema.index({ category: 1 });
complaintSchema.index({ urgency: 1 });
complaintSchema.index({ priorityScore: -1 });
complaintSchema.index({ createdAt: -1 });
complaintSchema.index({ location: 'text', description: 'text' });

// Virtual for formatted date
complaintSchema.virtual('formattedDate').get(function() {
  return this.createdAt.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
});

// Method to calculate priority score
complaintSchema.methods.calculatePriorityScore = function() {
  let score = 0;
  
  // Urgency weight
  switch(this.urgency) {
    case 'High': score += 50; break;
    case 'Medium': score += 30; break;
    case 'Low': score += 10; break;
  }
  
  // Category weight (critical categories)
  const criticalCategories = ['Water Leakage', 'Road Damage', 'Garbage'];
  if (criticalCategories.includes(this.category)) {
    score += 20;
  }
  
  // Age factor (older complaints get higher priority)
  const daysOld = (Date.now() - this.createdAt) / (1000 * 60 * 60 * 24);
  score += Math.min(Math.floor(daysOld) * 2, 20);
  
  this.priorityScore = Math.min(score, 100);
  return this.priorityScore;
};

// Pre-save hook to generate ID if not exists
complaintSchema.pre('save', async function(next) {
  if (!this.id) {
    // Generate unique ID
    const count = await mongoose.model('Complaint').countDocuments();
    this.id = `SCMS${String(count + 1).padStart(6, '0')}`;
  }
  
  // Calculate priority score
  this.calculatePriorityScore();
  
  // Add initial update if new complaint
  if (this.isNew) {
    this.updates.push({
      status: 'Pending',
      message: 'Complaint submitted successfully',
      date: new Date(),
      updatedBy: 'System'
    });
  }
  
  next();
});

module.exports = mongoose.model('Complaint', complaintSchema);