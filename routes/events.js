const express = require('express');
const router = express.Router();
const Event = require('../models/Event');

// Middleware to ensure user is authenticated
const isAuthenticated = (req, res, next) => {
  if (!req.session || !req.session.userId) {
    return res.status(401).send('Unauthorized: Please login first. <a href="/login.html">Login here</a>');
  }
  next();
};

// Middleware to ensure user is club_lead, faculty, or admin
const isAuthorizedCreator = (req, res, next) => {
  const allowedRoles = ['club_lead', 'faculty', 'admin'];
  if (!allowedRoles.includes(req.session.role)) {
    return res.status(403).send('Forbidden: Only club leads, faculty, or admins can submit events. <a href="/login.html">Login as authorized user</a>');
  }
  next();
};

// GET /events - Fetches all approved events (sorted by date)
router.get('/', async (req, res) => {
  try {
    const events = await Event.find({ Status: 'approved' })
      .populate('CreatedBy', 'Name Role Department')
      .sort({ EventDate: 1 });
    res.json(events);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /events/:id/register - Handles one-click student event registration
router.post('/:id/register', isAuthenticated, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).send('Event not found');
    }

    // Check if registration limit is reached
    if (event.RegistrationLimit && event.Attendees.length >= event.RegistrationLimit) {
      return res.status(400).send('Event Full');
    }

    // Check if user is already registered
    if (event.Attendees.includes(req.session.userId)) {
      return res.status(400).send('You are already registered for this event.');
    }

    // Add user to attendees list
    event.Attendees.push(req.session.userId);
    await event.save();

    res.send('Successfully registered for this event!');
  } catch (err) {
    res.status(500).send(`Error registering for event: ${err.message}`);
  }
});

// POST /events/create - Handles event creation submissions
router.post('/create', isAuthenticated, isAuthorizedCreator, async (req, res) => {
  try {
    const { EventName, HostClubOrDept, Description, EventDate, Venue, RegistrationLimit } = req.body;

    // Build event object (status defaults to 'pending' as defined in schema)
    const newEvent = new Event({
      EventName,
      HostClubOrDept,
      Description,
      EventDate: new Date(EventDate),
      Venue,
      RegistrationLimit: RegistrationLimit ? parseInt(RegistrationLimit, 10) : undefined,
      CreatedBy: req.session.userId,
      Status: 'pending'
    });

    await newEvent.save();
    res.status(201).send('Event request submitted! It is currently pending admin approval. <a href="/create-event.html">Go back</a>');
  } catch (err) {
    res.status(500).send(`Error submitting event request: ${err.message}. <a href="/create-event.html">Try again</a>`);
  }
});

module.exports = router;
