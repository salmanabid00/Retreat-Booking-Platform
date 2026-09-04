const mongoose = require('mongoose');

const propertySchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Property title is required'],
      trim: true,
      maxlength: [100, 'Title cannot exceed 100 characters'],
    },
    description: {
      type: String,
      required: [true, 'Property description is required'],
      trim: true,
    },
    propertyType: {
      type: String,
      required: [true, 'Property type is required'],
      enum: [
        'Villa',
        'Cabin',
        'Cottage',
        'Beachfront',
        'Mountain Lodge',
        'Glamping',
        'Resort',
        'Treehouse',
        'Apartment',
        'Other',
      ],
    },
    location: {
      city: { type: String, required: true, trim: true },
      state: { type: String, required: true, trim: true },
      country: { type: String, required: true, trim: true },
    },
    address: {
      type: String,
      required: [true, 'Full address is required'],
      trim: true,
    },
    latitude: {
      type: Number,
      default: 0,
    },
    longitude: {
      type: Number,
      default: 0,
    },
    pricePerNight: {
      type: Number,
      required: [true, 'Price per night is required'],
      min: [0, 'Price must be a positive number'],
    },
    maxGuests: {
      type: Number,
      required: [true, 'Maximum guests is required'],
      min: [1, 'Must allow at least 1 guest'],
    },
    bedrooms: {
      type: Number,
      required: [true, 'Bedrooms count is required'],
      min: [1, 'Must have at least 1 bedroom'],
    },
    bathrooms: {
      type: Number,
      required: [true, 'Bathrooms count is required'],
      min: [1, 'Must have at least 1 bathroom'],
    },
    amenities: [
      {
        type: String,
        trim: true,
      },
    ],
    images: [
      {
        url: { type: String, required: true },
        public_id: { type: String, default: '' },
      },
    ],
    rules: [
      {
        type: String,
        trim: true,
      },
    ],
    checkInTime: {
      type: String,
      default: '14:00',
    },
    checkOutTime: {
      type: String,
      default: '11:00',
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    isApproved: {
      type: Boolean,
      default: true, // Default to true for smooth MVP testing; Admin can toggle approval
    },
    blockedDates: [
      {
        startDate: { type: Date, required: true },
        endDate: { type: Date, required: true },
        reason: { type: String, default: 'Maintenance / Owner Blocked' },
      },
    ],
    rating: {
      type: Number,
      default: 5.0,
      min: 1,
      max: 5,
    },
    numReviews: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for fast search & filter queries
propertySchema.index({ isApproved: 1, createdAt: -1 });
propertySchema.index({ isApproved: 1, propertyType: 1, pricePerNight: 1 });
propertySchema.index({ 'location.city': 1, propertyType: 1 });
propertySchema.index({ pricePerNight: 1, maxGuests: 1 });
propertySchema.index({ owner: 1, createdAt: -1 });
propertySchema.index({ isApproved: 1, owner: 1 });

module.exports = mongoose.model('Property', propertySchema);
