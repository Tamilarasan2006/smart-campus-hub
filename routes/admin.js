const express = require('express');
const router = express.Router();
const Event = require('../models/Event');
const User = require('../models/User');

// Middleware to ensure user is authenticated
const isAuthenticated = (req, res, next) => {
  if (!req.session || !req.session.userId) {
    return res.status(401).send('Unauthorized: Please login first. <a href="/login.html">Login here</a>');
  }
  next();
};

// Middleware to ensure user is an admin
const isAdmin = (req, res, next) => {
  if (req.session.role !== 'admin') {
    return res.status(403).send('Forbidden: Only administrators can access this resource.');
  }
  next();
};

// GET /admin/pending-events - Fetches all events with status 'pending'
router.get('/pending-events', isAuthenticated, isAdmin, async (req, res) => {
  try {
    const pendingEvents = await Event.find({ Status: 'pending' })
      .populate('CreatedBy', 'Name Role Department')
      .sort({ EventDate: 1 });
    res.json(pendingEvents);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /admin/events/:id/status - Updates event status ('approved' or 'rejected')
router.put('/events/:id/status', isAuthenticated, isAdmin, async (req, res) => {
  try {
    const { status } = req.body;
    
    // Validate inputs
    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).send("Invalid status. Must be 'approved' or 'rejected'.");
    }

    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).send('Event not found');
    }

    // Update status
    event.Status = status;
    await event.save();

    res.send(`Event status updated to ${status} successfully!`);
  } catch (err) {
    res.status(500).send(`Error updating event status: ${err.message}`);
  }
});

module.exports = router;
