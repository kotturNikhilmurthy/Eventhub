const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();

const extraOrigins = (process.env.ALLOWED_ORIGINS || '')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

// Enhanced CORS configuration to support multiple dev origins
app.use(cors({
  origin: (origin, callback) => {
    const allowed = !origin
      || origin.startsWith('http://localhost')
      || origin.startsWith('http://127.0.0.1')
      || origin.startsWith('http://10.')
      || origin.startsWith('http://192.168.');

    if (!allowed && origin) {
      if (extraOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error(`CORS blocked from origin: ${origin}`));
      }
      return;
    }

    callback(null, true);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

const PORT = process.env.PORT || 4000;
const MONGO_URI = process.env.MONGODB_URI || process.env.MONGO_URI;

if (!MONGO_URI) {
  console.warn('MONGODB_URI not set. Set MONGODB_URI in .env or environment to connect to MongoDB.');
}

// Connect to MongoDB
mongoose
  .connect(MONGO_URI || 'mongodb://localhost:27017/ad-a-venue', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.warn('MongoDB connection warning:', err.message));

// Routes
const eventsRouter = require('./routes/events');
const bookingsRouter = require('./routes/bookings');
const authRouter = require('./routes/auth');

app.use('/api/events', eventsRouter);
app.use('/api/bookings', bookingsRouter);
app.use('/api/auth', authRouter);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
