const express = require('express');
const router = express.Router();
const Notice = require('../models/Notice');
const User = require('../models/User'); // Import User for population

// Middleware to ensure user is authenticated
const isAuthenticated = (req, res, next) => {
  if (!req.session || !req.session.userId) {
    return res.status(401).send('Unauthorized: Please login first. <a href="/login.html">Login here</a>');
  }
  next();
};

// Middleware to ensure user is faculty or admin
const isFacultyOrAdmin = (req, res, next) => {
  const allowedRoles = ['faculty', 'admin'];
  if (!allowedRoles.includes(req.session.role)) {
    return res.status(403).send('Forbidden: Only faculty or admins can publish notices. <a href="/login.html">Login as authorized user</a>');
  }
  next();
};

// GET /notices - Fetches all active, unexpired notices sorted by newest first
router.get('/', async (req, res) => {
  try {
    const { category } = req.query;
    const currentDate = new Date();

    // Query to match unexpired notices (either no ExpiryDate, or ExpiryDate in the future)
    const filter = {
      $or: [
        { ExpiryDate: { $exists: false } },
        { ExpiryDate: null },
        { ExpiryDate: { $gte: currentDate } }
      ]
    };

    // Filter by category if supplied
    if (category) {
      filter.Category = category;
    }

    const notices = await Notice.find(filter)
      .populate('CreatedBy', 'Name Role Department')
      .sort({ DatePosted: -1 });

    res.json(notices);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /notices/create - Handles publishing notices by faculty or admin
router.post('/create', isAuthenticated, isFacultyOrAdmin, async (req, res) => {
  try {
    const { Title, Content, Category, ExpiryDate, Department } = req.body;

    // Create a new notice instance
    const newNotice = new Notice({
      Title,
      Content,
      Category,
      CreatedBy: req.session.userId,
      Department: Department || req.session.department || 'All',
      ExpiryDate: ExpiryDate ? new Date(ExpiryDate) : undefined
    });

    await newNotice.save();
    res.status(201).send('Notice created successfully! <a href="/create-notice.html">Create another notice</a>');
  } catch (err) {
    res.status(500).send(`Error creating notice: ${err.message}. <a href="/create-notice.html">Try again</a>`);
  }
});

module.exports = router;
