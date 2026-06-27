const express = require('express');
const router = express.Router();
const Notice = require('../models/Notice');

// CREATE a notice
router.post('/', async (req, res) => {
  try {
    const newNotice = new Notice(req.body);
    const savedNotice = await newNotice.save();
    res.status(201).json(savedNotice);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// READ all notices (and populate creator info)
router.get('/', async (req, res) => {
  try {
    const notices = await Notice.find().populate('createdBy', 'name role department');
    res.json(notices);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE a notice by ID
router.delete('/:id', async (req, res) => {
  try {
    const deletedNotice = await Notice.findByIdAndDelete(req.params.id);
    if (!deletedNotice) return res.status(404).json({ message: 'Notice not found' });
    res.json({ message: 'Notice successfully archived/removed', deletedNotice });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;