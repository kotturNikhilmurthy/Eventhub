const mongoose = require('mongoose');

const FamilyDetailsSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ["Marriage", "Birthday"],
    },
    brideName: String,
    groomName: String,
    celebrantName: String,
    celebrationYear: String,
  },
  { _id: false }
);

const EventSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    type: { type: String, required: true },
    description: { type: String },
    date: { type: Date, required: true },
    time: { type: String, required: true },
    venue: { type: String, required: true },
    image: { type: String },
    ticketPrice: { type: String, default: "0" },
    venueType: { type: String },
    sportType: { type: String },
    theatres: { type: [String], default: [] },
    showtimes: { type: [String], default: [] },
    familyId: { type: String },
    familyCategory: { type: String },
    familyDetails: FamilyDetailsSchema,
    status: { type: String, default: "Active" },
    capacity: { type: Number, default: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Event', EventSchema);
