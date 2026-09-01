const express = require('express');
const router = express.Router();
const {
  getAdminStats,
  getUsers,
  getAllPropertiesAdmin,
  getAllBookingsAdmin,
  getAdminReports,
  toggleUserBlock,
  togglePropertyApproval,
} = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect);
router.use(authorize('admin'));

router.get('/stats', getAdminStats);
router.get('/users', getUsers);
router.get('/properties', getAllPropertiesAdmin);
router.get('/bookings', getAllBookingsAdmin);
router.get('/reports', getAdminReports);
router.patch('/users/:id/block', toggleUserBlock);
router.patch('/properties/:id/approval', togglePropertyApproval);

module.exports = router;
