const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config(); // Loads your .env file
const analyzeRoute = require('./routes/analyze');

const app = express();

// Middleware
app.use(cors({
    origin: ['http://localhost:3000', 'http://localhost:3001'], // Supports both Vite ports
    credentials: true
}));
app.use(express.json());



// MongoDB Connection Logic
// It will try to find MONGODB_URI in your .env first. 
// If it's missing, it falls back to the local address.
const mongoURI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/reqsphere';

mongoose.connect(mongoURI)
  .then(() => {
    const isCloud = mongoURI.includes('.net');
    console.log(`✅ ${isCloud ? 'Cloud (Atlas)' : 'Local'} MongoDB Connected Successfully`);
  })
  .catch(err => {
    console.error("❌ MongoDB Connection Error!");
    console.error("Details:", err.message);
  });

// Routes
app.use('/api', analyzeRoute);

// Basic Health Check (helpful for debugging)
app.get('/', (req, res) => {
  res.send('Backend Bridge is Live');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Backend Bridge running at http://localhost:${PORT}`);
});