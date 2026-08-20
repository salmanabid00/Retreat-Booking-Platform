const express = require('express');
const router = express.Router();
const {
  getProperties,
  getPropertyById,
  createProperty,
  updateProperty,
  deleteProperty,
  getMyProperties,
  updateBlockedDates,
} = require('../controllers/propertyController');
const { protect, authorize } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

// Public Routes
router.get('/', getProperties);

// Owner-only Routes
router.get('/my-properties', protect, authorize('owner', 'admin'), getMyProperties);

router.get('/:id', getPropertyById);

// Owner Property Management Routes
router.post(
  '/',
  protect,
  authorize('owner', 'admin'),
  upload.array('images', 5),
  createProperty
);

router.put(
  '/:id',
  protect,
  authorize('owner', 'admin'),
  upload.array('images', 5),
  updateProperty
);

router.delete('/:id', protect, authorize('owner', 'admin'), deleteProperty);

router.post(
  '/:id/blocked-dates',
  protect,
  authorize('owner', 'admin'),
  updateBlockedDates
);

module.exports = router;
