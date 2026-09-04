const Booking = require('../models/Booking');
const Property = require('../models/Property');
const { createSystemMessageAndNotification } = require('../utils/systemMessageHelper');

// Helper to normalize date to midnight UTC
const normalizeDate = (d) => {
  const date = new Date(d);
  date.setUTCHours(0, 0, 0, 0);
  return date;
};

// @desc    Create a new booking request
// @route   POST /api/bookings
// @access  Private (Customer)
const createBooking = async (req, res, next) => {
  try {
    const { propertyId, checkInDate, checkOutDate, guests, specialRequest } = req.body;

    if (!propertyId || !checkInDate || !checkOutDate || !guests) {
      return res.status(400).json({
        success: false,
        message: 'Please provide propertyId, checkInDate, checkOutDate, and guests count.',
      });
    }

    const property = await Property.findById(propertyId);
    if (!property) {
      return res.status(404).json({ success: false, message: 'Property not found.' });
    }

    if (!property.isApproved) {
      return res.status(400).json({ success: false, message: 'This property is currently not approved for booking.' });
    }

    // Rule 5: Customer cannot book their own property
    if (property.owner.toString() === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'Business Rule Violation: You cannot book your own property listing.',
      });
    }

    const checkIn = normalizeDate(checkInDate);
    const checkOut = normalizeDate(checkOutDate);
    const today = normalizeDate(new Date());

    // Rule 1: checkInDate cannot be before today
    if (checkIn < today) {
      return res.status(400).json({
        success: false,
        message: 'Business Rule Violation: Check-in date cannot be in the past.',
      });
    }

    // Rule 2: checkOutDate must be strictly after checkInDate
    if (checkOut <= checkIn) {
      return res.status(400).json({
        success: false,
        message: 'Business Rule Violation: Check-out date must be after check-in date.',
      });
    }

    // Rule 3: guests cannot exceed property maxGuests
    const numGuests = Number(guests);
    if (numGuests > property.maxGuests || numGuests < 1) {
      return res.status(400).json({
        success: false,
        message: `Business Rule Violation: Guest count (${numGuests}) exceeds property maximum capacity of ${property.maxGuests}.`,
      });
    }

    // Rule 6 & 4: Overlapping CONFIRMED bookings check at DB level
    const existingConflict = await Booking.findOne({
      property: propertyId,
      status: 'confirmed',
      checkInDate: { $lt: checkOut },
      checkOutDate: { $gt: checkIn },
    });

    if (existingConflict) {
      return res.status(400).json({
        success: false,
        message: 'Business Rule Violation: Property is unavailable for the selected date range due to a confirmed booking.',
      });
    }

    // Check owner manual date blockouts
    if (property.blockedDates && property.blockedDates.length > 0) {
      const isBlocked = property.blockedDates.some((block) => {
        const bStart = normalizeDate(block.startDate);
        const bEnd = normalizeDate(block.endDate);
        return bStart < checkOut && bEnd > checkIn;
      });

      if (isBlocked) {
        return res.status(400).json({
          success: false,
          message: 'Business Rule Violation: Property is blocked by the owner for maintenance during selected dates.',
        });
      }
    }

    const diffTime = Math.abs(checkOut - checkIn);
    const nights = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const totalPrice = nights * property.pricePerNight;

    const booking = await Booking.create({
      customer: req.user._id,
      property: propertyId,
      checkInDate: checkIn,
      checkOutDate: checkOut,
      guests: numGuests,
      nights,
      pricePerNight: property.pricePerNight,
      totalPrice,
      status: 'pending',
      specialRequest: specialRequest || '',
    });

    const populatedBooking = await Booking.findById(booking._id)
      .populate('property', 'title location propertyType images pricePerNight owner')
      .populate('customer', 'name email avatar phone');

    // Trigger System Message & Real-Time Notification
    const io = req.app.get('io');
    await createSystemMessageAndNotification({
      booking: populatedBooking,
      type: 'booking_created',
      io,
    });

    res.status(201).json({
      success: true,
      message: 'Booking request created successfully.',
      data: populatedBooking,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get customer's own bookings
// @route   GET /api/bookings/my-bookings
// @access  Private (Customer)
const getMyBookings = async (req, res, next) => {
  try {
    const bookings = await Booking.find({ customer: req.user._id })
      .populate({
        path: 'property',
        select: 'title location propertyType images pricePerNight owner address',
        populate: { path: 'owner', select: 'name email avatar phone' },
      })
      .sort({ createdAt: -1 })
      .lean();

    res.json({
      success: true,
      data: bookings,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get owner's incoming booking requests
// @route   GET /api/bookings/owner-bookings
// @access  Private (Owner)
const getOwnerBookings = async (req, res, next) => {
  try {
    const ownerProperties = await Property.find({ owner: req.user._id }).select('_id').lean();
    const propertyIds = ownerProperties.map((p) => p._id);

    const bookings = await Booking.find({ property: { $in: propertyIds } })
      .populate('property', 'title location propertyType images pricePerNight address owner')
      .populate('customer', 'name email avatar phone bio')
      .sort({ createdAt: -1 })
      .lean();

    res.json({
      success: true,
      data: bookings,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single booking details
// @route   GET /api/bookings/:id
// @access  Private (Customer or Owner of the property)
const getBookingById = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate({
        path: 'property',
        select: 'title location propertyType images pricePerNight owner address',
        populate: { path: 'owner', select: 'name email avatar phone' },
      })
      .populate('customer', 'name email avatar phone')
      .lean();

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found.' });
    }

    const isCustomerOwner = booking.customer?._id?.toString() === req.user._id.toString();
    const isPropertyOwner = booking.property?.owner?._id?.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isCustomerOwner && !isPropertyOwner && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: You are not authorized to view this booking.',
      });
    }

    res.json({
      success: true,
      data: booking,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update booking status (Owner accept/reject or Customer cancel)
// @route   PATCH /api/bookings/:id/status
// @access  Private
const updateBookingStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const allowedStatuses = ['confirmed', 'rejected', 'cancelled'];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Must be one of: ${allowedStatuses.join(', ')}`,
      });
    }

    const booking = await Booking.findById(req.params.id).populate('property customer');
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found.' });
    }

    const isCustomer = booking.customer._id.toString() === req.user._id.toString();
    const isOwner = booking.property.owner.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if ((status === 'confirmed' || status === 'rejected') && !isOwner && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Business Rule Violation: Only the property owner can accept or reject bookings.',
      });
    }

    if (status === 'cancelled' && !isCustomer && !isOwner && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Business Rule Violation: You can only cancel your own bookings.',
      });
    }

    if (status === 'confirmed') {
      const existingConflict = await Booking.findOne({
        _id: { $ne: booking._id },
        property: booking.property._id,
        status: 'confirmed',
        checkInDate: { $lt: booking.checkOutDate },
        checkOutDate: { $gt: booking.checkInDate },
      });

      if (existingConflict) {
        return res.status(400).json({
          success: false,
          message: 'Business Rule Violation: Cannot confirm booking. Another confirmed booking overlaps with these dates.',
        });
      }
    }

    booking.status = status;
    await booking.save();

    const updatedBooking = await Booking.findById(booking._id)
      .populate('property', 'title location propertyType images owner')
      .populate('customer', 'name email avatar');

    // Trigger System Message & Real-Time Notification
    const io = req.app.get('io');
    const notifTypeMap = {
      confirmed: 'booking_accepted',
      rejected: 'booking_rejected',
      cancelled: 'booking_cancelled',
    };
    await createSystemMessageAndNotification({
      booking: updatedBooking,
      type: notifTypeMap[status] || 'booking_updated',
      io,
    });

    res.json({
      success: true,
      message: `Booking status updated to '${status}' successfully.`,
      data: updatedBooking,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a Stripe Checkout Session for a confirmed booking
// @route   POST /api/bookings/:id/create-checkout-session
// @access  Private (Customer / Admin)
const createCheckoutSession = async (req, res, next) => {
  try {
    const stripeSecret = process.env.STRIPE_SECRET_KEY;
    if (!stripeSecret) {
      return res.status(500).json({
        success: false,
        message: 'Stripe payments are not configured on the server. Please set STRIPE_SECRET_KEY in server/.env.',
      });
    }

    const stripe = require('stripe')(stripeSecret);
    const { id } = req.params;

    const booking = await Booking.findById(id).populate('property', 'title images location');
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found.' });
    }

    // Verify requesting user is the customer or admin
    if (booking.customer.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized: You can only create payment sessions for your own bookings.',
      });
    }

    // Verify booking is confirmed
    if (booking.status !== 'confirmed') {
      return res.status(400).json({
        success: false,
        message: `Payment cannot be initiated. Booking must be 'confirmed' by the host first (current status: '${booking.status}').`,
      });
    }

    // Verify booking is unpaid
    if (booking.paymentStatus === 'paid') {
      return res.status(400).json({
        success: false,
        message: 'This booking has already been paid for.',
      });
    }

    const clientOrigin = process.env.CLIENT_URL
      ? process.env.CLIENT_URL.split(',')[0].trim()
      : 'http://localhost:5173';

    const unitAmount = Math.round(booking.totalPrice * 100); // Price in cents
    const propertyTitle = booking.property?.title || 'Retreat Booking';

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: propertyTitle,
              description: `${booking.nights} night(s) stay (${new Date(booking.checkInDate).toLocaleDateString()} - ${new Date(booking.checkOutDate).toLocaleDateString()})`,
              images: booking.property?.images?.[0]?.url ? [booking.property.images[0].url] : [],
            },
            unit_amount: unitAmount,
          },
          quantity: 1,
        },
      ],
      customer_email: req.user.email,
      client_reference_id: booking._id.toString(),
      metadata: {
        bookingId: booking._id.toString(),
        customerId: req.user._id.toString(),
      },
      success_url: `${clientOrigin}/my-bookings?payment=success&bookingId=${booking._id}`,
      cancel_url: `${clientOrigin}/my-bookings?payment=cancelled&bookingId=${booking._id}`,
    });

    booking.stripeCheckoutSessionId = session.id;
    await booking.save();

    res.json({
      success: true,
      url: session.url,
      sessionId: session.id,
    });
  } catch (error) {
    console.error('[Create Checkout Session Error]:', error);
    next(error);
  }
};

module.exports = {
  createBooking,
  getMyBookings,
  getOwnerBookings,
  getBookingById,
  updateBookingStatus,
  createCheckoutSession,
};
