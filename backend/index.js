const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const analyzeRoute = require('./routes/analyze');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Connect to MongoDB (Assuming local installation for now)
mongoose.connect('mongodb://localhost:27017/reqsphere')
  .then(() => console.log("✅ MongoDB Connected Successfully"))
  .catch(err => console.error("❌ MongoDB Connection Error:", err));

// Routes
app.use('/api', analyzeRoute);

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`🚀 Backend Bridge running at http://localhost:${PORT}`);
});