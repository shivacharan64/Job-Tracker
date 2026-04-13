const Job = require('../models/Job');

exports.getAnalytics = async (req, res) => {
  try {
    const userId = req.user._id;
    const now = new Date();
    const thirtyDaysAgo = new Date(now - 30 * 24 * 60 * 60 * 1000);

    const [statusBreakdown, sourceBreakdown, monthlyTrend, jobTypeBreakdown,
      successRate, avgResponseTime, recentActivity] = await Promise.all([

      Job.aggregate([{ $match: { user: userId } }, { $group: { _id: '$status', count: { $sum: 1 } } }]),
      Job.aggregate([{ $match: { user: userId } }, { $group: { _id: '$source', count: { $sum: 1 } } }, { $sort: { count: -1 } }]),
      Job.aggregate([
        { $match: { user: userId, appliedDate: { $gte: new Date(now.getFullYear() - 1, 0, 1) } } },
        { $group: { _id: { month: { $month: '$appliedDate' }, year: { $year: '$appliedDate' } }, count: { $sum: 1 } } },
        { $sort: { '_id.year': 1, '_id.month': 1 } }
      ]),
      Job.aggregate([{ $match: { user: userId } }, { $group: { _id: '$jobType', count: { $sum: 1 } } }]),
      Job.aggregate([
        { $match: { user: userId } },
        {
          $group: {
            _id: null,
            total: { $sum: 1 },
            offers: { $sum: { $cond: [{ $in: ['$status', ['Offer', 'Accepted']] }, 1, 0] } },
            interviews: { $sum: { $cond: [{ $eq: ['$status', 'Interviewing'] }, 1, 0] } },
            rejected: { $sum: { $cond: [{ $eq: ['$status', 'Rejected'] }, 1, 0] } }
          }
        }
      ]),
      Job.aggregate([
        { $match: { user: userId, interviewDate: { $exists: true } } },
        {
          $project: {
            responseDays: { $divide: [{ $subtract: ['$interviewDate', '$appliedDate'] }, 1000 * 60 * 60 * 24] }
          }
        },
        { $group: { _id: null, avgDays: { $avg: '$responseDays' } } }
      ]),
      Job.find({ user: userId, createdAt: { $gte: thirtyDaysAgo } }).select('company position status createdAt').sort({ createdAt: -1 }).limit(10)
    ]);

    res.json({
      success: true,
      analytics: {
        statusBreakdown,
        sourceBreakdown,
        monthlyTrend,
        jobTypeBreakdown,
        summary: successRate[0] || { total: 0, offers: 0, interviews: 0, rejected: 0 },
        avgResponseTime: avgResponseTime[0]?.avgDays?.toFixed(1) || 0,
        recentActivity
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
