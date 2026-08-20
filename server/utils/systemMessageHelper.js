const Conversation = require('../models/Conversation');
const Message = require('../models/Message');
const Notification = require('../models/Notification');

/**
 * Creates or retrieves a conversation between customer and property owner,
 * posts an automated System Message, and triggers a real-time Notification.
 */
const createSystemMessageAndNotification = async ({
  booking,
  type, // 'booking_created' | 'booking_accepted' | 'booking_rejected' | 'booking_cancelled'
  io, // Socket.IO server instance (optional)
}) => {
  try {
    const customerId = booking.customer._id || booking.customer;
    const propertyId = booking.property._id || booking.property;
    const ownerId = booking.property.owner
      ? booking.property.owner._id || booking.property.owner
      : null;

    if (!ownerId) return;

    // Find or create conversation between customer and property owner
    let conversation = await Conversation.findOne({
      participants: { $all: [customerId, ownerId] },
      property: propertyId,
    });

    if (!conversation) {
      conversation = await Conversation.create({
        participants: [customerId, ownerId],
        property: propertyId,
        booking: booking._id,
      });
    }

    let systemText = '';
    let notificationRecipient = null;
    let notifType = 'system';

    switch (type) {
      case 'booking_created':
        systemText = `System Notice: A new booking request was created for ${booking.nights} night(s) from ${new Date(booking.checkInDate).toLocaleDateString()} to ${new Date(booking.checkOutDate).toLocaleDateString()} ($${booking.totalPrice}).`;
        notificationRecipient = ownerId;
        notifType = 'booking_request';
        break;
      case 'booking_accepted':
        systemText = `System Notice: The property host ACCEPTED the booking request for ${new Date(booking.checkInDate).toLocaleDateString()} to ${new Date(booking.checkOutDate).toLocaleDateString()}.`;
        notificationRecipient = customerId;
        notifType = 'booking_accepted';
        break;
      case 'booking_rejected':
        systemText = `System Notice: The property host DECLINED the booking request.`;
        notificationRecipient = customerId;
        notifType = 'booking_rejected';
        break;
      case 'booking_cancelled':
        systemText = `System Notice: The booking was CANCELLED.`;
        notificationRecipient = ownerId;
        notifType = 'booking_cancelled';
        break;
      default:
        systemText = `System Notice: Booking status updated to ${type}.`;
        notificationRecipient = customerId;
    }

    // Create system message (sender is null)
    const sysMsg = await Message.create({
      conversation: conversation._id,
      sender: null,
      message: systemText,
      messageType: 'system',
    });

    conversation.lastMessage = sysMsg._id;
    await conversation.save();

    // Create Notification record
    const notification = await Notification.create({
      user: notificationRecipient,
      type: notifType,
      message: systemText,
      relatedBooking: booking._id,
      relatedConversation: conversation._id,
    });

    // Emit live socket event if Socket.IO is connected
    if (io) {
      io.to(`conversation:${conversation._id.toString()}`).emit('receiveMessage', sysMsg);
      io.to(`user:${notificationRecipient.toString()}`).emit('newNotification', notification);
    }
  } catch (err) {
    console.error('[System Message Error]:', err);
  }
};

module.exports = { createSystemMessageAndNotification };
