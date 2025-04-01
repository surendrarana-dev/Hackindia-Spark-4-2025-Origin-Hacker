const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const resumeAnalyzer = require('../utils/resumeAnalyzer');

// Set up multer storage for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../uploads'));
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

// File filter for accepted file types
const fileFilter = (req, file, cb) => {
  const validTypes = ['.pdf', '.docx', '.doc', '.txt'];
  const ext = path.extname(file.originalname).toLowerCase();
  
  if (validTypes.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Please upload PDF, DOCX, DOC, or TXT file.'), false);
  }
};

// Set up multer upload
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB
});

// Upload and analyze resume route
router.post('/analyze', upload.single('resume'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const filePath = req.file.path;
    const fileExtension = path.extname(req.file.originalname).toLowerCase();
    
    // Analyze the resume
    const analysisResults = await resumeAnalyzer.analyzeResume(filePath, fileExtension);
    
    // Clean up - remove uploaded file after analysis
    fs.unlink(filePath, (err) => {
      if (err) console.error('Error removing file:', err);
    });
    
    res.json(analysisResults);
  } catch (error) {
    console.error('Resume analysis error:', error);
    res.status(500).json({ error: 'Error analyzing resume', details: error.message });
  }
});

module.exports = router; 