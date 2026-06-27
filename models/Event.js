const mongoose = require('mongoose');

// Event Schema representing campus events, workshops, club activities, and seminars
const EventSchema = new mongoose.Schema({
  // Name/Title of the event
  EventName: {
    type: String,
    required: [true, 'Event name is required'],
    trim: true
  },
  // The club, department, or body hosting the event (e.g. 'CSE Association', 'Science Club')
  HostClubOrDept: {
    type: String,
    required: [true, 'Host club or department is required'],
    trim: true
  },
  // Detailed description of the event details, requirements, etc.
  Description: {
    type: String,
    required: [true, 'Event description is required']
  },
  // Scheduled date and time of the event
  EventDate: {
    type: Date,
    required: [true, 'Event date is required']
  },
  // Location/venue where the event is scheduled to take place
  Venue: {
    type: String,
    required: [true, 'Venue is required'],
    trim: true
  },
  // Maximum number of registrations allowed for the event (optional)
  RegistrationLimit: {
    type: Number
  },
  // List of users who have registered to attend this event
  Attendees: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  ],
  // Reference to the User who created/registered the event
  CreatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Creator reference is required']
  },
  // Approval status for the event, defaulting to 'pending'
  Status: {
    type: String,
    required: [true, 'Status is required'],
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  }
}, {
  // Automatically manage createdAt and updatedAt timestamps
  timestamps: true
});

module.exports = mongoose.model('Event', EventSchema);
