require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const resumeRoutes = require('./routes/resumeRoutes');

// Initialize express app
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static files - serve the frontend
app.use(express.static(path.join(__dirname, '../')));

// API Routes
app.use('/api/resume', resumeRoutes);

// Fallback route - serve the frontend
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../index.html'));
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 