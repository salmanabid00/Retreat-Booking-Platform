const Conversation = require('../models/Conversation');
const Message = require('../models/Message');
const User = require('../models/User');

// @desc    Get user's conversations
// @route   GET /api/conversations
// @access  Private
const getConversations = async (req, res, next) => {
  try {
    const conversations = await Conversation.find({
      participants: req.user._id,
    })
      .populate('participants', 'name email avatar role')
      .populate('property', 'title location propertyType images pricePerNight')
      .populate('booking', 'checkInDate checkOutDate guests totalPrice status')
      .populate({
        path: 'lastMessage',
        populate: { path: 'sender', select: 'name avatar' },
      })
      .sort({ updatedAt: -1 });

    res.json({
      success: true,
      data: conversations,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get or Create Conversation with recipient / property / booking
// @route   POST /api/conversations
// @access  Private
const getOrCreateConversation = async (req, res, next) => {
  try {
    const { recipientId, propertyId, bookingId } = req.body;

    if (!recipientId && !propertyId && !bookingId) {
      return res.status(400).json({
        success: false,
        message: 'Please provide recipientId, propertyId, or bookingId.',
      });
    }

    let targetRecipientId = recipientId;
    let targetPropertyId = propertyId;
    let targetBookingId = bookingId;

    // 1. If bookingId is passed, lookup the Booking to resolve property and recipient
    if (targetBookingId) {
      const Booking = require('../models/Booking');
      const booking = await Booking.findById(targetBookingId).populate('property');
      if (booking) {
        if (!targetPropertyId && booking.property) {
          targetPropertyId = booking.property._id ? booking.property._id.toString() : booking.property.toString();
        }
        if (!targetRecipientId) {
          const customerId = booking.customer?._id ? booking.customer._id.toString() : booking.customer?.toString();
          const ownerId = booking.property?.owner?._id
            ? booking.property.owner._id.toString()
            : (booking.property?.owner ? booking.property.owner.toString() : null);

          if (req.user._id.toString() === customerId && ownerId) {
            targetRecipientId = ownerId;
          } else if (req.user._id.toString() === ownerId && customerId) {
            targetRecipientId = customerId;
          } else if (customerId && customerId !== req.user._id.toString()) {
            targetRecipientId = customerId;
          } else if (ownerId && ownerId !== req.user._id.toString()) {
            targetRecipientId = ownerId;
          }
        }
      }
    }

    // 2. If propertyId is passed, find property owner
    if (targetPropertyId && !targetRecipientId) {
      const Property = require('../models/Property');
      const property = await Property.findById(targetPropertyId);
      if (property && property.owner) {
        targetRecipientId = property.owner._id ? property.owner._id.toString() : property.owner.toString();
      }
    }

    if (!targetRecipientId) {
      return res.status(400).json({ success: false, message: 'Recipient not found for the specified property or booking.' });
    }

    if (targetRecipientId === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'You cannot start a conversation with yourself.',
      });
    }

    // 3. Check existing conversation
    let query = {
      participants: { $all: [req.user._id, targetRecipientId] },
    };
    if (targetPropertyId) query.property = targetPropertyId;

    let conversation = await Conversation.findOne(query)
      .populate('participants', 'name email avatar role')
      .populate('property', 'title location propertyType images pricePerNight')
      .populate('booking', 'checkInDate checkOutDate guests totalPrice status')
      .populate({
        path: 'lastMessage',
        populate: { path: 'sender', select: 'name avatar' },
      });

    // Fallback: check any conversation between these two participants
    if (!conversation) {
      conversation = await Conversation.findOne({
        participants: { $all: [req.user._id, targetRecipientId] },
      })
        .populate('participants', 'name email avatar role')
        .populate('property', 'title location propertyType images pricePerNight')
        .populate('booking', 'checkInDate checkOutDate guests totalPrice status')
        .populate({
          path: 'lastMessage',
          populate: { path: 'sender', select: 'name avatar' },
        });
    }

    if (!conversation) {
      conversation = await Conversation.create({
        participants: [req.user._id, targetRecipientId],
        property: targetPropertyId || null,
        booking: targetBookingId || null,
      });

      conversation = await Conversation.findById(conversation._id)
        .populate('participants', 'name email avatar role')
        .populate('property', 'title location propertyType images pricePerNight')
        .populate('booking', 'checkInDate checkOutDate guests totalPrice status');
    } else {
      // If conversation exists but property or booking was missing, update them
      let updated = false;
      if (!conversation.property && targetPropertyId) {
        conversation.property = targetPropertyId;
        updated = true;
      }
      if (!conversation.booking && targetBookingId) {
        conversation.booking = targetBookingId;
        updated = true;
      }
      if (updated) {
        await conversation.save();
        conversation = await Conversation.findById(conversation._id)
          .populate('participants', 'name email avatar role')
          .populate('property', 'title location propertyType images pricePerNight')
          .populate('booking', 'checkInDate checkOutDate guests totalPrice status')
          .populate({
            path: 'lastMessage',
            populate: { path: 'sender', select: 'name avatar' },
          });
      }
    }

    res.status(200).json({
      success: true,
      data: conversation,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get message history for a conversation
// @route   GET /api/messages/:conversationId
// @access  Private
const getMessages = async (req, res, next) => {
  try {
    const { conversationId } = req.params;

    // Authorization: User must be a participant in this conversation
    const conversation = await Conversation.findById(conversationId);

    if (!conversation) {
      return res.status(404).json({ success: false, message: 'Conversation not found.' });
    }

    const isParticipant = conversation.participants.some(
      (pId) => pId.toString() === req.user._id.toString()
    );

    if (!isParticipant && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: You are not authorized to view messages in this conversation.',
      });
    }

    const messages = await Message.find({ conversation: conversationId })
      .populate('sender', 'name email avatar')
      .sort({ createdAt: 1 });

    res.json({
      success: true,
      data: messages,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Mark conversation messages as read
// @route   PATCH /api/messages/:conversationId/read
// @access  Private
const markMessagesAsRead = async (req, res, next) => {
  try {
    const { conversationId } = req.params;

    await Message.updateMany(
      {
        conversation: conversationId,
        sender: { $ne: req.user._id },
        isRead: false,
      },
      { $set: { isRead: true } }
    );

    res.json({
      success: true,
      message: 'Messages marked as read.',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getConversations,
  getOrCreateConversation,
  getMessages,
  markMessagesAsRead,
};
