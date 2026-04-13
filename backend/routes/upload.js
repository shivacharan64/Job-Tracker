const express = require('express');
const router = express.Router();
const multer = require('multer');
const { protect } = require('../middleware/auth');
const Job = require('../models/Job');

// Use memory storage (files uploaded as buffer)
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    const allowed = ['application/pdf', 'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    allowed.includes(file.mimetype) ? cb(null, true) : cb(new Error('Only PDF and Word docs allowed'));
  }
});

router.post('/resume/:jobId', protect, upload.single('resume'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: 'No file uploaded' });

    // In production, upload to Cloudinary here
    // For now, store file metadata
    const job = await Job.findOneAndUpdate(
      { _id: req.params.jobId, user: req.user.id },
      { resume: { filename: req.file.originalname, url: '#', publicId: Date.now().toString() } },
      { new: true }
    );
    if (!job) return res.status(404).json({ success: false, message: 'Job not found' });
    res.json({ success: true, message: 'Resume uploaded', job });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
