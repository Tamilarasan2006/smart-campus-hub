const express = require('express');
const router = express.Router();
const User = require('../models/User');

// CREATE a new user
router.post('/', async (req, res) => {
  try {
    const newUser = new User(req.body);
    const savedUser = await newUser.save();
    res.status(201).json(savedUser);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// READ all users
router.get('/', async (req, res) => {
  try {
    const users = await User.find().select('-password'); // Exclude password from list for basic safety
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;