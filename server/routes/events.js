const express = require('express');
const router = express.Router();
const Event = require('../models/Event');

// GET /api/events - list events
router.get('/', async (req, res) => {
  try {
    const events = await Event.find().sort({ date: 1 });
    res.json(events);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/events - create event
router.post('/', async (req, res) => {
  try {
    const {
      name,
      type,
      description,
      date,
      time,
      venue,
      image,
      ticketPrice,
      venueType,
      sportType,
      theatres = [],
      showtimes = [],
      familyId,
      familyCategory,
      familyDetails,
      status = 'Active',
      capacity,
    } = req.body;

    const parsedDate = date ? new Date(date) : null;
    if (!parsedDate || Number.isNaN(parsedDate.getTime())) {
      return res.status(400).json({ error: 'Invalid date provided' });
    }

    const evt = new Event({
      name,
      type,
      description,
      date: parsedDate,
      time,
      venue,
      image,
      ticketPrice,
      venueType,
      sportType,
      theatres,
      showtimes,
      familyId,
      familyCategory,
      familyDetails,
      status,
      capacity,
    });

    await evt.save();
    res.status(201).json(evt);
  } catch (err) {
    console.error('Failed to create event:', err);
    res.status(400).json({ error: err.message });
  }
});

// GET /api/events/:id
router.get('/:id', async (req, res) => {
  try {
    const evt = await Event.findById(req.params.id);
    if (!evt) return res.status(404).json({ error: 'Event not found' });
    res.json(evt);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;
