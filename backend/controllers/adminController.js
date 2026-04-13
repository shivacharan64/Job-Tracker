const User = require('../models/User');
const Job = require('../models/Job');

// ─── EXISTING ────────────────────────────────────────────────────────────────

exports.getAllUsers = async (req, res) => {
  try {
    const { page = 1, limit = 20, search, role } = req.query;
    const query = {};
    if (role) query.role = role;
    if (search) query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } }
    ];
    const total = await User.countDocuments(query);
    const users = await User.find(query).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(Number(limit));
    res.json({ success: true, users, total, totalPages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getAdminStats = async (req, res) => {
  try {
    const [totalUsers, totalJobs, activeUsers, recentUsers, jobsByStatus] = await Promise.all([
      User.countDocuments(),
      Job.countDocuments(),
      User.countDocuments({ lastLogin: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } }),
      User.find().sort({ createdAt: -1 }).limit(5).select('name email createdAt role'),
      Job.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }])
    ]);
    res.json({ success: true, stats: { totalUsers, totalJobs, activeUsers, recentUsers, jobsByStatus } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.toggleUserStatus = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    if (user.role === 'admin') return res.status(400).json({ success: false, message: 'Cannot deactivate admin' });
    user.isActive = !user.isActive;
    await user.save({ validateBeforeSave: false });
    res.json({ success: true, user });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.changeUserRole = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, { role: req.body.role }, { new: true });
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    res.json({ success: true, user });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    if (user.role === 'admin') return res.status(400).json({ success: false, message: 'Cannot delete admin' });
    await Job.deleteMany({ user: req.params.id });
    await user.deleteOne();
    res.json({ success: true, message: 'User and all their data deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── NEW ─────────────────────────────────────────────────────────────────────

exports.getAllApplications = async (req, res) => {
  try {
    const { status, search, startDate, endDate, page = 1, limit = 20 } = req.query;
    const jobQuery = {};
    if (status) jobQuery.status = status;
    if (search) jobQuery.$or = [
      { company: { $regex: search, $options: 'i' } },
      { position: { $regex: search, $options: 'i' } },
    ];
    if (startDate || endDate) {
      jobQuery.createdAt = {};
      if (startDate) jobQuery.createdAt.$gte = new Date(startDate);
      if (endDate) jobQuery.createdAt.$lte = new Date(endDate);
    }
    const skip = (page - 1) * limit;
    const [applications, total] = await Promise.all([
      Job.find(jobQuery).populate('user', 'name email').sort({ createdAt: -1 }).skip(skip).limit(Number(limit)),
      Job.countDocuments(jobQuery),
    ]);
    res.json({ success: true, applications, total, pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getUserDetail = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    const applications = await Job.find({ user: req.params.id }).sort({ createdAt: -1 });
    const stats = {
      total: applications.length,
      byStatus: applications.reduce((acc, job) => {
        acc[job.status] = (acc[job.status] || 0) + 1;
        return acc;
      }, {}),
    };
    res.json({ success: true, user, applications, stats });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getAnalytics = async (req, res) => {
  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const [userGrowth, applicationTrend, statusBreakdown, topCompanies, totalUsers, totalJobs, activeUsers] =
      await Promise.all([
        User.aggregate([
          { $match: { createdAt: { $gte: thirtyDaysAgo } } },
          { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, count: { $sum: 1 } } },
          { $sort: { _id: 1 } },
        ]),
        Job.aggregate([
          { $match: { createdAt: { $gte: thirtyDaysAgo } } },
          { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, count: { $sum: 1 } } },
          { $sort: { _id: 1 } },
        ]),
        Job.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
        Job.aggregate([
          { $group: { _id: '$company', count: { $sum: 1 } } },
          { $sort: { count: -1 } },
          { $limit: 10 },
        ]),
        User.countDocuments(),
        Job.countDocuments(),
        User.countDocuments({ isActive: true }),
      ]);

    res.json({
      success: true,
      summary: { totalUsers, totalJobs, activeUsers },
      userGrowth,
      applicationTrend,
      statusBreakdown,
      topCompanies,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.exportUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password');
    const csvRows = [
      ['Name', 'Email', 'Role', 'Status', 'Joined'].join(','),
      ...users.map(u => [
        u.name, u.email, u.role,
        u.isActive ? 'Active' : 'Inactive',
        new Date(u.createdAt).toLocaleDateString()
      ].join(','))
    ];
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="users.csv"');
    res.send(csvRows.join('\n'));
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.exportApplications = async (req, res) => {
  try {
    const jobs = await Job.find().populate('user', 'name email');
    const csvRows = [
      ['User', 'Email', 'Company', 'Position', 'Status', 'Applied Date'].join(','),
      ...jobs.map(j => [
        j.user?.name || 'N/A',
        j.user?.email || 'N/A',
        j.company, j.position, j.status,
        new Date(j.createdAt).toLocaleDateString()
      ].join(','))
    ];
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="applications.csv"');
    res.send(csvRows.join('\n'));
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.bulkUserAction = async (req, res) => {
  try {
    const { userIds, action } = req.body;
    if (!userIds || !Array.isArray(userIds) || userIds.length === 0)
      return res.status(400).json({ success: false, message: 'No users selected' });
    if (action === 'delete') {
      await User.deleteMany({ _id: { $in: userIds }, role: { $ne: 'admin' } });
      await Job.deleteMany({ user: { $in: userIds } });
      return res.json({ success: true, message: `${userIds.length} users deleted` });
    }
    const isActive = action === 'activate';
    await User.updateMany({ _id: { $in: userIds }, role: { $ne: 'admin' } }, { isActive });
    res.json({ success: true, message: `${userIds.length} users ${action}d` });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};