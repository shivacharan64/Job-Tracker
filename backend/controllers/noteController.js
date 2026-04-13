const Note = require('../models/Note');

exports.getNotes = async (req, res) => {
  try {
    const { jobId } = req.query;
    const query = { user: req.user.id };
    if (jobId) query.job = jobId;
    const notes = await Note.find(query).sort({ isPinned: -1, createdAt: -1 }).populate('job', 'company position');
    res.json({ success: true, notes });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.createNote = async (req, res) => {
  try {
    const note = await Note.create({ ...req.body, user: req.user.id });
    res.status(201).json({ success: true, note });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.updateNote = async (req, res) => {
  try {
    const note = await Note.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id }, req.body, { new: true }
    );
    if (!note) return res.status(404).json({ success: false, message: 'Note not found' });
    res.json({ success: true, note });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.deleteNote = async (req, res) => {
  try {
    const note = await Note.findOne({ _id: req.params.id, user: req.user.id });
    if (!note) return res.status(404).json({ success: false, message: 'Note not found' });
    await note.deleteOne();
    res.json({ success: true, message: 'Note deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
