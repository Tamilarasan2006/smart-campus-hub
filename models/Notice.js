const mongoose = require('mongoose');

// Notice Schema representing announcements and notices posted on the campus board
const NoticeSchema = new mongoose.Schema({
  // Title of the notice
  Title: {
    type: String,
    required: [true, 'Notice title is required'],
    trim: true
  },
  // Main text body/content of the notice
  Content: {
    type: String,
    required: [true, 'Notice content is required']
  },
  // The category of the announcement
  Category: {
    type: String,
    required: [true, 'Category is required'],
    enum: ['Exams', 'Placement', 'Holiday', 'Fees', 'General']
  },
  // Reference to the User who created/posted the notice
  CreatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Creator reference is required']
  },
  // Specific department this notice is targetted at, default is 'All'
  Department: {
    type: String,
    default: 'All',
    trim: true
  },
  // Date and time the notice was published
  DatePosted: {
    type: Date,
    default: Date.now
  },
  // Optional date when the notice expires and should be archived
  ExpiryDate: {
    type: Date
  }
}, {
  // Automatically manage createdAt and updatedAt timestamps
  timestamps: true
});

module.exports = mongoose.model('Notice', NoticeSchema);
