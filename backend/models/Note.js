const mongoose = require('mongoose');

const NoteSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  job: { type: mongoose.Schema.Types.ObjectId, ref: 'Job' },
  title: { type: String, required: true, trim: true },
  content: { type: String, required: true },
  type: {
    type: String,
    enum: ['General', 'Interview Prep', 'Follow-up', 'Research', 'Feedback'],
    default: 'General'
  },
  isPinned: { type: Boolean, default: false },
  color: { type: String, default: '#ffffff' },
}, { timestamps: true });

module.exports = mongoose.model('Note', NoteSchema);
