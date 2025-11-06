const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const Booking = require('../models/Booking');
const Event = require('../models/Event');

// GET /api/bookings - list bookings
router.get('/', async (req, res) => {
  try {
    // Include related event data while keeping booking fields intact
    const bookings = await Booking.find()
      .populate({ path: 'eventId', select: 'name type date time venue image capacity' })
      .sort({ createdAt: -1 });
    res.json(bookings);
  } catch (err) {
    console.error('Failed to fetch bookings:', err);
    res.status(500).json({ error: err.message });
  }
});

// POST /api/bookings - create a booking
router.post('/', async (req, res) => {
  try {
    const {
      eventId,
      eventName,
      eventType,
      date,
      time,
      venue,
      theatre,
      tier,
      pricePerSeat,
      seats = [],
      quantity,
      totalPrice,
      paymentMethod,
      bookingDate,
      userName,
      userEmail,
    } = req.body;

    if (!eventId) {
      return res.status(400).json({ error: 'Event ID is required' });
    }

    const normalizedSeats = Array.isArray(seats) ? seats : [];
    const seatCount = Number.isFinite(quantity) ? Number(quantity) : normalizedSeats.length;

    const evt = await Event.findById(eventId);
    if (!evt) return res.status(404).json({ error: 'Event not found' });

    if (evt.capacity && seatCount > evt.capacity) {
      return res.status(400).json({ error: 'Not enough seats available' });
    }

    if (evt.capacity) {
      evt.capacity = Math.max(evt.capacity - seatCount, 0);
      await evt.save();
    }

    const booking = new Booking({
      eventId: new mongoose.Types.ObjectId(evt._id),
      eventName: eventName || evt.name,
      eventType: eventType || evt.type,
      date: date || (evt.date ? new Date(evt.date).toISOString() : new Date().toISOString()),
      time,
      venue: venue || evt.venue,
      theatre,
      tier,
      pricePerSeat: pricePerSeat ?? 0,
      seats: normalizedSeats,
      quantity: seatCount,
      totalPrice: totalPrice ?? 0,
      paymentMethod: paymentMethod || 'Paid',
      bookingDate: bookingDate || new Date().toISOString(),
      userName: userName || 'Guest',
      userEmail: userEmail || 'guest@example.com',
    });

    await booking.save();
    res.status(201).json(booking);
  } catch (err) {
    console.error('Failed to create booking:', err);
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;
