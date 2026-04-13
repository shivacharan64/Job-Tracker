const mongoose = require('mongoose');

const NotificationSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  job: { type: mongoose.Schema.Types.ObjectId, ref: 'Job' },
  title: { type: String, required: true },
  message: { type: String, required: true },
  type: {
    type: String,
    enum: ['interview_reminder', 'deadline_reminder', 'status_update', 'system', 'follow_up'],
    default: 'system'
  },
  isRead: { type: Boolean, default: false },
  scheduledFor: { type: Date },
}, { timestamps: true });

module.exports = mongoose.model('Notification', NotificationSchema);
