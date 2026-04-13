const mongoose = require('mongoose');

const JobSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  company: { type: String, required: [true, 'Company name is required'], trim: true },
  position: { type: String, required: [true, 'Position is required'], trim: true },
  location: { type: String, default: '' },
  jobType: {
    type: String,
    enum: ['Full-time', 'Part-time', 'Contract', 'Internship', 'Freelance', 'Remote'],
    default: 'Full-time'
  },
  workMode: { type: String, enum: ['On-site', 'Remote', 'Hybrid'], default: 'On-site' },
  status: {
    type: String,
    enum: ['Bookmarked', 'Applied', 'Interviewing', 'Offer', 'Rejected', 'Withdrawn', 'Accepted'],
    default: 'Applied'
  },
  salary: {
    min: { type: Number },
    max: { type: Number },
    currency: { type: String, default: 'USD' }
  },
  jobUrl: { type: String, default: '' },
  jobDescription: { type: String, default: '' },
  appliedDate: { type: Date, default: Date.now },
  interviewDate: { type: Date },
  deadlineDate: { type: Date },
  contactName: { type: String, default: '' },
  contactEmail: { type: String, default: '' },
  contactPhone: { type: String, default: '' },
  source: {
    type: String,
    enum: ['LinkedIn', 'Indeed', 'Glassdoor', 'Company Website', 'Referral', 'Job Fair', 'Other'],
    default: 'Other'
  },
  priority: { type: String, enum: ['Low', 'Medium', 'High'], default: 'Medium' },
  resume: { url: String, publicId: String, filename: String },
  coverLetter: { url: String, publicId: String, filename: String },
  tags: [{ type: String }],
  statusHistory: [{
    status: String,
    date: { type: Date, default: Date.now },
    note: String
  }],
  isFavorite: { type: Boolean, default: false },
  rating: { type: Number, min: 1, max: 5 },
}, { timestamps: true });

// Index for search performance
JobSchema.index({ user: 1, status: 1, appliedDate: -1 });
JobSchema.index({ company: 'text', position: 'text', tags: 'text' });

module.exports = mongoose.model('Job', JobSchema);
