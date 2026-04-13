const Job = require('../models/Job');
const Notification = require('../models/Notification');

// @GET /api/jobs - Get all jobs with filters, search, pagination
exports.getJobs = async (req, res) => {
  try {
    const { status, jobType, workMode, priority, source, search, sortBy, page = 1, limit = 10, isFavorite } = req.query;
    const query = { user: req.user.id };

    if (status) query.status = status;
    if (jobType) query.jobType = jobType;
    if (workMode) query.workMode = workMode;
    if (priority) query.priority = priority;
    if (source) query.source = source;
    if (isFavorite === 'true') query.isFavorite = true;
    if (search) {
      query.$or = [
        { company: { $regex: search, $options: 'i' } },
        { position: { $regex: search, $options: 'i' } },
        { location: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }

    const sortOptions = {
      newest: { createdAt: -1 }, oldest: { createdAt: 1 },
      company: { company: 1 }, deadline: { deadlineDate: 1 }
    };
    const sort = sortOptions[sortBy] || { createdAt: -1 };

    const total = await Job.countDocuments(query);
    const jobs = await Job.find(query).sort(sort)
      .skip((page - 1) * limit).limit(Number(limit));

    res.json({
      success: true, jobs, total,
      totalPages: Math.ceil(total / limit),
      currentPage: Number(page)
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @POST /api/jobs
exports.createJob = async (req, res) => {
  try {
    req.body.user = req.user.id;
    req.body.statusHistory = [{ status: req.body.status || 'Applied', note: 'Application created' }];
    const job = await Job.create(req.body);

    // Schedule interview reminder
    if (job.interviewDate && req.user.emailNotifications) {
      await Notification.create({
        user: req.user.id, job: job._id,
        title: `Interview Reminder: ${job.position} at ${job.company}`,
        message: `You have an interview scheduled on ${new Date(job.interviewDate).toLocaleDateString()}`,
        type: 'interview_reminder', scheduledFor: job.interviewDate
      });
    }
    res.status(201).json({ success: true, job });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @GET /api/jobs/:id
exports.getJob = async (req, res) => {
  try {
    const job = await Job.findOne({ _id: req.params.id, user: req.user.id });
    if (!job) return res.status(404).json({ success: false, message: 'Job not found' });
    res.json({ success: true, job });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @PUT /api/jobs/:id
exports.updateJob = async (req, res) => {
  try {
    let job = await Job.findOne({ _id: req.params.id, user: req.user.id });
    if (!job) return res.status(404).json({ success: false, message: 'Job not found' });

    // Track status change
    if (req.body.status && req.body.status !== job.status) {
      req.body.statusHistory = [...(job.statusHistory || []), {
        status: req.body.status, date: new Date(), note: req.body.statusNote || ''
      }];

      await Notification.create({
        user: req.user.id, job: job._id,
        title: `Status Updated: ${job.company}`,
        message: `Your application for ${job.position} at ${job.company} moved to "${req.body.status}"`,
        type: 'status_update'
      });
    }

    job = await Job.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    res.json({ success: true, job });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @DELETE /api/jobs/:id
exports.deleteJob = async (req, res) => {
  try {
    const job = await Job.findOne({ _id: req.params.id, user: req.user.id });
    if (!job) return res.status(404).json({ success: false, message: 'Job not found' });
    await job.deleteOne();
    res.json({ success: true, message: 'Job deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @PUT /api/jobs/:id/favorite
exports.toggleFavorite = async (req, res) => {
  try {
    const job = await Job.findOne({ _id: req.params.id, user: req.user.id });
    if (!job) return res.status(404).json({ success: false, message: 'Job not found' });
    job.isFavorite = !job.isFavorite;
    await job.save();
    res.json({ success: true, job });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @GET /api/jobs/stats/summary
exports.getStats = async (req, res) => {
  try {
    const stats = await Job.aggregate([
      { $match: { user: req.user._id } },
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);
    const bySource = await Job.aggregate([
      { $match: { user: req.user._id } },
      { $group: { _id: '$source', count: { $sum: 1 } } }
    ]);
    const byMonth = await Job.aggregate([
      { $match: { user: req.user._id } },
      { $group: { _id: { month: { $month: '$appliedDate' }, year: { $year: '$appliedDate' } }, count: { $sum: 1 } } },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);
    const total = await Job.countDocuments({ user: req.user.id });
    res.json({ success: true, stats, bySource, byMonth, total });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
