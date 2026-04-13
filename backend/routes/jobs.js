const express = require('express');
const router = express.Router();
const { getJobs, createJob, getJob, updateJob, deleteJob, toggleFavorite, getStats } = require('../controllers/jobController');
const { protect } = require('../middleware/auth');

router.use(protect);
router.get('/stats/summary', getStats);
router.route('/').get(getJobs).post(createJob);
router.route('/:id').get(getJob).put(updateJob).delete(deleteJob);
router.put('/:id/favorite', toggleFavorite);

module.exports = router;
