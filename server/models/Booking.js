const mongoose = require('mongoose');

const BookingSchema = new mongoose.Schema(
  {
    eventId: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
    eventName: { type: String, required: true },
    eventType: { type: String, required: true },
    date: { type: String, required: true },
    time: { type: String, required: true },
    venue: { type: String, required: true },
    theatre: { type: String },
    tier: { type: String },
    pricePerSeat: { type: Number, default: 0 },
    seats: { type: [String], default: [] },
    quantity: { type: Number, required: true },
    totalPrice: { type: Number, default: 0 },
    paymentMethod: { type: String, default: 'Paid' },
    bookingDate: { type: String, required: true },
    userName: { type: String },
    userEmail: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Booking', BookingSchema);
