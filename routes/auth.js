const express = require('express');
const router = express.Router();
const User = require('../models/User');

// POST /register - Handles user registration
router.post('/register', async (req, res) => {
  try {
    const { Name, CollegeEmail, Password, IDNumber, Department, Role } = req.body;

    // Check if the user already exists
    const existingUser = await User.findOne({ CollegeEmail });
    if (existingUser) {
      return res.status(400).send('Email is already registered. <a href="/register.html">Try again</a>');
    }

    // Create and save new user (the password is automatically hashed by UserSchema pre-save hook)
    const newUser = new User({
      Name,
      CollegeEmail,
      Password,
      IDNumber,
      Department,
      Role
    });

    await newUser.save();
    res.status(201).send('Registration successful! <a href="/login.html">Login here</a>');
  } catch (err) {
    res.status(500).send(`Error registering user: ${err.message}. <a href="/register.html">Try again</a>`);
  }
});

// POST /login - Handles user login and session initialization
router.post('/login', async (req, res) => {
  try {
    const { CollegeEmail, Password } = req.body;

    // Find the user by email
    const user = await User.findOne({ CollegeEmail });
    if (!user) {
      return res.status(401).send('Invalid email or password. <a href="/login.html">Try again</a>');
    }

    // Validate the password
    const isMatch = await user.comparePassword(Password);
    if (!isMatch) {
      return res.status(401).send('Invalid email or password. <a href="/login.html">Try again</a>');
    }

    // Save user info in the session
    req.session.userId = user._id;
    req.session.role = user.Role;
    req.session.name = user.Name;
    req.session.department = user.Department;

    // CRITICAL: Console log user details upon successful login
    console.log(`[AUTH SUCCESS] User logged in: ${user.Name} | Role: ${user.Role}`);

    res.send(`Successfully logged in! <br> Welcome, ${user.Name} (${user.Role}). <br> <a href="/logout">Logout</a>`);
  } catch (err) {
    res.status(500).send(`Login error: ${err.message}. <a href="/login.html">Try again</a>`);
  }
});

// GET /logout - Clears user session
router.get('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).send('Could not log out. Please try again.');
    }
    res.send('You have been logged out. <a href="/login.html">Login again</a>');
  });
});

module.exports = router;
