const User = require('../models/User');
const Property = require('../models/Property');
const Booking = require('../models/Booking');

// @desc    Get system-wide platform statistics
// @route   GET /api/admin/stats
// @access  Private (Admin)
const getAdminStats = async (req, res, next) => {
  try {
    const totalUsers = await User.countDocuments();
    const customersCount = await User.countDocuments({ role: 'customer' });
    const ownersCount = await User.countDocuments({ role: 'owner' });

    const totalProperties = await Property.countDocuments();
    const totalBookings = await Booking.countDocuments();
    const confirmedBookings = await Booking.countDocuments({ status: 'confirmed' });

    const revenueResult = await Booking.aggregate([
      { $match: { status: 'confirmed' } },
      { $group: { _id: null, totalRevenue: { $sum: '$totalPrice' } } },
    ]);

    const totalRevenue = revenueResult[0] ? revenueResult[0].totalRevenue : 0;

    res.json({
      success: true,
      data: {
        totalUsers,
        customersCount,
        ownersCount,
        totalProperties,
        totalBookings,
        confirmedBookings,
        totalRevenue,
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
    const users = await User.find().select('-password').sort({ createdAt: -1 });

    res.json({
      success: true,
      data: users,
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
  toggleUserBlock,
  togglePropertyApproval,
};
