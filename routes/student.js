const express = require('express');
const router = express.Router();
const Notice = require('../models/Notice');
const Event = require('../models/Event');

// Middleware to ensure user is authenticated
const isAuthenticated = (req, res, next) => {
  if (!req.session || !req.session.userId) {
    return res.status(401).send('Unauthorized: Please login first. <a href="/login.html">Login here</a>');
  }
  next();
};

// GET /student/my-hub - Personalized Notices and Events for the logged-in student
router.get('/my-hub', isAuthenticated, async (req, res) => {
  try {
    const userId = req.session.userId;
    const userDept = req.session.department || 'All';
    const currentDate = new Date();

    // 1. Fetch unexpired notices targeted specifically to the student's department or 'All'
    const notices = await Notice.find({
      $or: [
        { ExpiryDate: { $exists: false } },
        { ExpiryDate: null },
        { ExpiryDate: { $gte: currentDate } }
      ],
      $or: [
        { Department: { $regex: new RegExp(`^${userDept}$`, 'i') } },
        { Department: { $regex: /^All$/i } }
      ]
    })
    .populate('CreatedBy', 'Name Role Department')
    .sort({ DatePosted: -1 });

    // 2. Fetch all events where the logged-in user exists in the Attendees array
    const registeredEvents = await Event.find({
      Attendees: userId
    })
    .populate('CreatedBy', 'Name Role Department')
    .sort({ EventDate: 1 });

    // Return both pieces of data in a structured JSON response
    res.json({
      studentName: req.session.name,
      studentRole: req.session.role,
      studentDept: userDept,
      notices,
      registeredEvents
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
