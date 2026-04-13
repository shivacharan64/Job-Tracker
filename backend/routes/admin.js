const express = require('express');
const router = express.Router();
const {
  getAllUsers,
  getAdminStats,
  toggleUserStatus,
  changeUserRole,
  deleteUser,
  getAllApplications,
  getUserDetail,
  getAnalytics,
  exportUsers,
  exportApplications,
  bulkUserAction,
} = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect, authorize('admin'));

// Existing
router.get('/stats', getAdminStats);
router.get('/users', getAllUsers);
router.put('/users/:id/toggle', toggleUserStatus);
router.put('/users/:id/role', changeUserRole);
router.delete('/users/:id', deleteUser);

// New
router.get('/analytics', getAnalytics);
router.get('/applications', getAllApplications);
router.get('/users/:id/detail', getUserDetail);
router.get('/export/users', exportUsers);
router.get('/export/applications', exportApplications);
router.post('/users/bulk', bulkUserAction);

module.exports = router;