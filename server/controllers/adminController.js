const User = require('../models/User');
const Property = require('../models/Property');
const Booking = require('../models/Booking');

// @desc    Get system-wide platform statistics
// @route   GET /api/admin/stats
// @access  Private (Admin)
const getAdminStats = async (req, res, next) => {
  try {
    const [
      totalUsers,
      customersCount,
      ownersCount,
      totalProperties,
      approvedProperties,
      totalBookings,
      confirmedBookings,
      pendingBookings,
      revenueResult,
      recentBookings,
      recentUsers,
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ role: 'customer' }),
      User.countDocuments({ role: 'owner' }),
      Property.countDocuments(),
      Property.countDocuments({ isApproved: true }),
      Booking.countDocuments(),
      Booking.countDocuments({ status: 'confirmed' }),
      Booking.countDocuments({ status: 'pending' }),
      Booking.aggregate([
        { $match: { status: 'confirmed' } },
        { $group: { _id: null, totalRevenue: { $sum: '$totalPrice' } } },
      ]),
      Booking.find()
        .populate('customer', 'name email avatar')
        .populate('property', 'title pricePerNight location images')
        .sort({ createdAt: -1 })
        .limit(6)
        .lean(),
      User.find()
        .select('-password')
        .sort({ createdAt: -1 })
        .limit(5)
        .lean(),
    ]);

    const totalRevenue = revenueResult[0] ? revenueResult[0].totalRevenue : 0;

    res.json({
      success: true,
      data: {
        totalUsers,
        customersCount,
        ownersCount,
        totalProperties,
        approvedProperties,
        totalBookings,
        confirmedBookings,
        pendingBookings,
        totalRevenue,
        recentBookings,
        recentUsers,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all users list
// @route   GET /api/admin/users
// @access  Private (Admin)
const getUsers = async (req, res, next) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 }).lean();

    res.json({
      success: true,
      data: users,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all platform properties list (Admin)
// @route   GET /api/admin/properties
// @access  Private (Admin)
const getAllPropertiesAdmin = async (req, res, next) => {
  try {
    const properties = await Property.find()
      .populate('owner', 'name email avatar')
      .sort({ createdAt: -1 })
      .lean();

    res.json({
      success: true,
      count: properties.length,
      data: properties,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all platform bookings list (Admin)
// @route   GET /api/admin/bookings
// @access  Private (Admin)
const getAllBookingsAdmin = async (req, res, next) => {
  try {
    const bookings = await Booking.find()
      .populate('customer', 'name email avatar')
      .populate({
        path: 'property',
        select: 'title pricePerNight location images propertyType owner',
        populate: {
          path: 'owner',
          select: 'name email avatar',
        },
      })
      .sort({ createdAt: -1 })
      .lean();

    res.json({
      success: true,
      count: bookings.length,
      data: bookings,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get reports & analytics breakdown
// @route   GET /api/admin/reports
// @access  Private (Admin)
const getAdminReports = async (req, res, next) => {
  try {
    const [propertyTypeBreakdown, bookingStatusBreakdown] = await Promise.all([
      Property.aggregate([
        { $group: { _id: '$propertyType', count: { $sum: 1 }, avgPrice: { $avg: '$pricePerNight' } } },
        { $sort: { count: -1 } },
      ]),
      Booking.aggregate([
        { $group: { _id: '$status', count: { $sum: 1 }, totalRevenue: { $sum: '$totalPrice' } } },
      ]),
    ]);

    res.json({
      success: true,
      data: {
        propertyTypeBreakdown,
        bookingStatusBreakdown,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Block or Unblock a user
// @route   PATCH /api/admin/users/:id/block
// @access  Private (Admin)
const toggleUserBlock = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    if (user.role === 'admin') {
      return res.status(400).json({ success: false, message: 'Cannot block an admin account.' });
    }

    user.isBlocked = !user.isBlocked;
    await user.save();

    res.json({
      success: true,
      message: `User '${user.name}' has been ${user.isBlocked ? 'blocked' : 'unblocked'}.`,
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Approve or Revoke property listing approval
// @route   PATCH /api/admin/properties/:id/approval
// @access  Private (Admin)
const togglePropertyApproval = async (req, res, next) => {
  try {
    const property = await Property.findById(req.params.id);
    if (!property) {
      return res.status(404).json({ success: false, message: 'Property not found.' });
    }

    property.isApproved = !property.isApproved;
    await property.save();

    res.json({
      success: true,
      message: `Property approval status changed to ${property.isApproved ? 'Approved' : 'Disabled'}.`,
      data: property,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAdminStats,
  getUsers,
  getAllPropertiesAdmin,
  getAllBookingsAdmin,
  getAdminReports,
  toggleUserBlock,
  togglePropertyApproval,
};
