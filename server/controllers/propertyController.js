const Property = require('../models/Property');
const Booking = require('../models/Booking');
const { uploadToCloudinary } = require('../config/cloudinary');

// @desc    Get all properties with search, filter & pagination
// @route   GET /api/properties
// @access  Public
const getProperties = async (req, res, next) => {
  try {
    const {
      search,
      location,
      city,
      propertyType,
      minPrice,
      maxPrice,
      guests,
      amenities,
      checkInDate,
      checkOutDate,
      page = 1,
      limit = 9,
    } = req.query;

    const query = { isApproved: true };

    // Search term in title, description or address
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { 'location.city': { $regex: search, $options: 'i' } },
        { 'location.state': { $regex: search, $options: 'i' } },
        { 'location.country': { $regex: search, $options: 'i' } },
      ];
    }

    // City / Location filter
    const targetCity = city || location;
    if (targetCity) {
      query['location.city'] = { $regex: targetCity, $options: 'i' };
    }

    // Property type filter
    if (propertyType && propertyType !== 'All') {
      query.propertyType = propertyType;
    }

    // Price range filter
    if (minPrice || maxPrice) {
      query.pricePerNight = {};
      if (minPrice) query.pricePerNight.$gte = Number(minPrice);
      if (maxPrice) query.pricePerNight.$lte = Number(maxPrice);
    }

    // Capacity filter
    if (guests) {
      query.maxGuests = { $gte: Number(guests) };
    }

    // Amenities filter (comma-separated or array)
    if (amenities) {
      const amenitiesList = Array.isArray(amenities)
        ? amenities
        : amenities.split(',').map((a) => a.trim());
      if (amenitiesList.length > 0) {
        query.amenities = { $all: amenitiesList };
      }
    }

    // Date Availability Filtering
    if (checkInDate && checkOutDate) {
      const start = new Date(checkInDate);
      const end = new Date(checkOutDate);

      // Find properties with overlapping confirmed bookings
      let unavailablePropertyIds = [];
      if (Booking) {
        const conflictingBookings = await Booking.find({
          status: 'confirmed',
          checkInDate: { $lt: end },
          checkOutDate: { $gt: start },
        }).select('property');

        unavailablePropertyIds = conflictingBookings.map((b) => b.property.toString());
      }

      if (unavailablePropertyIds.length > 0) {
        query._id = { $nin: unavailablePropertyIds };
      }

      // Also filter out properties that have owner blockedDates overlapping
      query.blockedDates = {
        $not: {
          $elemMatch: {
            startDate: { $lt: end },
            endDate: { $gt: start },
          },
        },
      };
    }

    // Pagination calculations
    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.max(1, parseInt(limit, 10));
    const skip = (pageNum - 1) * limitNum;

    const totalCount = await Property.countDocuments(query);
    const properties = await Property.find(query)
      .populate('owner', 'name email avatar rating')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    res.json({
      success: true,
      data: properties,
      pagination: {
        totalCount,
        page: pageNum,
        totalPages: Math.ceil(totalCount / limitNum),
        limit: limitNum,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single property details by ID
// @route   GET /api/properties/:id
// @access  Public
const getPropertyById = async (req, res, next) => {
  try {
    const property = await Property.findById(req.params.id).populate(
      'owner',
      'name email avatar phone bio createdAt'
    );

    if (!property) {
      return res.status(404).json({
        success: false,
        message: 'Property not found.',
      });
    }

    res.json({
      success: true,
      data: property,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a new property
// @route   POST /api/properties
// @access  Private (Owner / Admin)
const createProperty = async (req, res, next) => {
  try {
    const {
      title,
      description,
      propertyType,
      city,
      state,
      country,
      address,
      latitude,
      longitude,
      pricePerNight,
      maxGuests,
      bedrooms,
      bathrooms,
      amenities,
      rules,
      checkInTime,
      checkOutTime,
      images: jsonImages,
    } = req.body;

    if (!title || !description || !propertyType || !city || !address || !pricePerNight || !maxGuests) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required property details (title, description, type, city, address, price, maxGuests).',
      });
    }

    const uploadedImages = [];

    // Handle files uploaded via multipart form data (Multer)
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const result = await uploadToCloudinary(file.buffer, 'retreat_properties');
        uploadedImages.push(result);
      }
    }

    // Handle JSON passed image URLs if provided directly
    if (jsonImages && Array.isArray(jsonImages)) {
      jsonImages.forEach((imgUrl) => {
        if (typeof imgUrl === 'string' && imgUrl.trim()) {
          uploadedImages.push({ url: imgUrl, public_id: '' });
        } else if (imgUrl.url) {
          uploadedImages.push(imgUrl);
        }
      });
    }

    // Provide high-quality fallback images if no image was provided
    if (uploadedImages.length === 0) {
      uploadedImages.push({
        url: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&q=80&w=1200',
        public_id: 'default_retreat',
      });
    }

    // Parse array inputs
    const parsedAmenities = Array.isArray(amenities)
      ? amenities
      : typeof amenities === 'string'
      ? amenities.split(',').map((a) => a.trim()).filter(Boolean)
      : [];

    const parsedRules = Array.isArray(rules)
      ? rules
      : typeof rules === 'string'
      ? rules.split(',').map((r) => r.trim()).filter(Boolean)
      : [];

    const property = await Property.create({
      title,
      description,
      propertyType,
      location: {
        city: city.trim(),
        state: (state || 'CA').trim(),
        country: (country || 'USA').trim(),
      },
      address,
      latitude: latitude ? Number(latitude) : 0,
      longitude: longitude ? Number(longitude) : 0,
      pricePerNight: Number(pricePerNight),
      maxGuests: Number(maxGuests),
      bedrooms: Number(bedrooms || 1),
      bathrooms: Number(bathrooms || 1),
      amenities: parsedAmenities,
      rules: parsedRules,
      images: uploadedImages,
      checkInTime: checkInTime || '14:00',
      checkOutTime: checkOutTime || '11:00',
      owner: req.user._id,
      isApproved: true, // Auto approved for development testing
    });

    const populated = await Property.findById(property._id).populate('owner', 'name email avatar');

    res.status(201).json({
      success: true,
      message: 'Property created successfully.',
      data: populated,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update an existing property
// @route   PUT /api/properties/:id
// @access  Private (Owner of the property / Admin)
const updateProperty = async (req, res, next) => {
  try {
    let property = await Property.findById(req.params.id);

    if (!property) {
      return res.status(404).json({
        success: false,
        message: 'Property not found.',
      });
    }

    // Authorization: Owner can only edit their own property (Admin can edit any)
    if (property.owner.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: You can only edit properties you own.',
      });
    }

    const {
      title,
      description,
      propertyType,
      city,
      state,
      country,
      address,
      pricePerNight,
      maxGuests,
      bedrooms,
      bathrooms,
      amenities,
      rules,
      checkInTime,
      checkOutTime,
      images: newImageUrls,
    } = req.body;

    if (title) property.title = title;
    if (description) property.description = description;
    if (propertyType) property.propertyType = propertyType;
    if (city || state || country) {
      property.location = {
        city: city ? city.trim() : property.location.city,
        state: state ? state.trim() : property.location.state,
        country: country ? country.trim() : property.location.country,
      };
    }
    if (address) property.address = address;
    if (pricePerNight) property.pricePerNight = Number(pricePerNight);
    if (maxGuests) property.maxGuests = Number(maxGuests);
    if (bedrooms) property.bedrooms = Number(bedrooms);
    if (bathrooms) property.bathrooms = Number(bathrooms);
    if (checkInTime) property.checkInTime = checkInTime;
    if (checkOutTime) property.checkOutTime = checkOutTime;

    if (amenities !== undefined) {
      property.amenities = Array.isArray(amenities)
        ? amenities
        : typeof amenities === 'string'
        ? amenities.split(',').map((a) => a.trim()).filter(Boolean)
        : property.amenities;
    }

    if (rules !== undefined) {
      property.rules = Array.isArray(rules)
        ? rules
        : typeof rules === 'string'
        ? rules.split(',').map((r) => r.trim()).filter(Boolean)
        : property.rules;
    }

    // Handle new images uploaded via Multer
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const result = await uploadToCloudinary(file.buffer, 'retreat_properties');
        property.images.push(result);
      }
    }

    // Handle JSON passed new image URLs if provided
    if (newImageUrls && Array.isArray(newImageUrls)) {
      newImageUrls.forEach((img) => {
        if (typeof img === 'string') {
          property.images.push({ url: img, public_id: '' });
        } else if (img.url) {
          property.images.push(img);
        }
      });
    }

    const updatedProperty = await property.save();

    res.json({
      success: true,
      message: 'Property updated successfully.',
      data: updatedProperty,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a property
// @route   DELETE /api/properties/:id
// @access  Private (Owner of the property / Admin)
const deleteProperty = async (req, res, next) => {
  try {
    const property = await Property.findById(req.params.id);

    if (!property) {
      return res.status(404).json({
        success: false,
        message: 'Property not found.',
      });
    }

    // Authorization: Owner can only delete their own property
    if (property.owner.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: You can only delete properties you own.',
      });
    }

    await property.deleteOne();

    res.json({
      success: true,
      message: 'Property deleted successfully.',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get owner's own properties
// @route   GET /api/properties/my-properties
// @access  Private (Owner)
const getMyProperties = async (req, res, next) => {
  try {
    const properties = await Property.find({ owner: req.user._id }).sort({ createdAt: -1 });

    res.json({
      success: true,
      data: properties,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Add / Remove owner manual blocked dates for maintenance
// @route   POST /api/properties/:id/blocked-dates
// @access  Private (Owner)
const updateBlockedDates = async (req, res, next) => {
  try {
    const property = await Property.findById(req.params.id);

    if (!property) {
      return res.status(404).json({ success: false, message: 'Property not found.' });
    }

    if (property.owner.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Forbidden: Owner only.' });
    }

    const { startDate, endDate, reason } = req.body;

    if (!startDate || !endDate) {
      return res.status(400).json({ success: false, message: 'Start date and end date are required.' });
    }

    property.blockedDates.push({
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      reason: reason || 'Maintenance / Owner Blocked',
    });

    await property.save();

    res.json({
      success: true,
      message: 'Blocked dates updated successfully.',
      data: property.blockedDates,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getProperties,
  getPropertyById,
  createProperty,
  updateProperty,
  deleteProperty,
  getMyProperties,
  updateBlockedDates,
};
