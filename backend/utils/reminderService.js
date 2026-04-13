const Job = require('../models/Job');
const Notification = require('../models/Notification');
const sendEmail = require('./sendEmail');
const User = require('../models/User');

exports.sendInterviewReminders = async () => {
  try {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dayAfter = new Date(tomorrow);
    dayAfter.setDate(dayAfter.getDate() + 1);

    const jobs = await Job.find({
      interviewDate: { $gte: tomorrow, $lt: dayAfter },
      status: 'Interviewing'
    }).populate('user', 'name email emailNotifications reminderDaysBefore');

    for (const job of jobs) {
      if (!job.user?.emailNotifications) continue;
      const existing = await Notification.findOne({
        job: job._id, type: 'interview_reminder',
        createdAt: { $gte: new Date(Date.now() - 23 * 60 * 60 * 1000) }
      });
      if (existing) continue;

      await Notification.create({
        user: job.user._id, job: job._id,
        title: `🎯 Interview Tomorrow: ${job.position} at ${job.company}`,
        message: `Your interview is scheduled for ${new Date(job.interviewDate).toLocaleString()}. Good luck!`,
        type: 'interview_reminder'
      });

      if (job.user.email) {
        await sendEmail({
          to: job.user.email,
          subject: `Interview Reminder: ${job.position} at ${job.company}`,
          html: `<h2>Interview Reminder 🎯</h2>
            <p>Hi ${job.user.name},</p>
            <p>You have an interview tomorrow for <strong>${job.position}</strong> at <strong>${job.company}</strong>.</p>
            <p><strong>Date:</strong> ${new Date(job.interviewDate).toLocaleString()}</p>
            <p>Best of luck!</p>`
        }).catch(() => {});
      }
    }
    console.log(`Processed ${jobs.length} interview reminders`);
  } catch (err) {
    console.error('Reminder service error:', err.message);
  }
};
