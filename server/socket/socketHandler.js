const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Conversation = require('../models/Conversation');
const Message = require('../models/Message');

// Map of userId -> Set(socketIds) to track online status across multiple tabs
const onlineUsers = new Map();
let ioInstance = null;

const initSocket = (httpServer) => {
  const clientUrl = process.env.CLIENT_URL;
  const allowedOrigins = [
    'http://localhost:5173',
    'http://localhost:3000',
    'http://127.0.0.1:5173',
    ...(clientUrl ? clientUrl.split(',').map((url) => url.trim()) : []),
  ];

  const io = new Server(httpServer, {
    cors: {
      origin: (origin, callback) => {
        if (
          !origin ||
          allowedOrigins.includes(origin) ||
          allowedOrigins.includes('*') ||
          origin.endsWith('.vercel.app') ||
          origin.includes('localhost') ||
          origin.includes('127.0.0.1')
        ) {
          callback(null, true);
        } else {
          callback(null, true);
        }
      },
      credentials: true,
    },
  });

  ioInstance = io;

  // Socket.IO Handshake Authentication Middleware
  io.use(async (socket, next) => {
    try {
      const token =
        socket.handshake.auth?.token ||
        socket.handshake.headers?.authorization?.split(' ')[1] ||
        socket.handshake.query?.token;

      if (!token) {
        return next(new Error('Authentication error: No token provided'));
      }

      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET || 'retreat_booking_jwt_secret_key_super_secure_2026'
      );

      const user = await User.findById(decoded.id).select('-password');
      if (!user || user.isBlocked) {
        return next(new Error('Authentication error: Invalid user'));
      }

      socket.user = user;
      next();
    } catch (err) {
      console.error('[Socket Auth Error]:', err.message);
      return next(new Error('Authentication error: Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    const userId = socket.user._id.toString();

    // Register user socket
    if (!onlineUsers.has(userId)) {
      onlineUsers.set(userId, new Set());
    }
    onlineUsers.get(userId).add(socket.id);

    // Broadcast online status
    io.emit('userOnlineStatus', {
      userId,
      isOnline: true,
      onlineUserIds: Array.from(onlineUsers.keys()),
    });

    // Join personal user room for direct push notifications
    socket.join(`user:${userId}`);

    // Join Conversation Room
    socket.on('joinConversation', async (data) => {
      try {
        const conversationId = typeof data === 'object' && data !== null ? data.conversationId : data;
        if (!conversationId) return;

        const conv = await Conversation.findById(conversationId);
        if (!conv) return;

        const isParticipant = conv.participants.some(
          (p) => p.toString() === userId
        );

        if (isParticipant) {
          socket.join(`conversation:${conversationId}`);
        }
      } catch (err) {
        console.error('Error joining conversation room:', err);
      }
    });

    // Leave Conversation Room
    socket.on('leaveConversation', (data) => {
      const conversationId = typeof data === 'object' && data !== null ? data.conversationId : data;
      if (conversationId) {
        socket.leave(`conversation:${conversationId}`);
      }
    });

    // Send Message Real-Time Event
    socket.on('sendMessage', async (data) => {
      try {
        const conversationId = data?.conversationId;
        const messageText = data?.messageText || data?.message;
        if (!messageText || !messageText.trim() || !conversationId) return;

        const conversation = await Conversation.findById(conversationId);
        if (!conversation) return;

        const isParticipant = conversation.participants.some(
          (p) => p.toString() === userId
        );
        if (!isParticipant) return;

        // Create Message DB Record
        const newMessage = await Message.create({
          conversation: conversationId,
          sender: userId,
          message: messageText.trim(),
          messageType: 'text',
          isRead: false,
        });

        // Update Conversation Last Message
        conversation.lastMessage = newMessage._id;
        await conversation.save();

        const populatedMessage = await Message.findById(newMessage._id).populate(
          'sender',
          'name avatar email'
        );

        // Emit message to all in conversation room (support both newMessage and receiveMessage)
        io.to(`conversation:${conversationId}`).emit('newMessage', populatedMessage);
        io.to(`conversation:${conversationId}`).emit('receiveMessage', populatedMessage);

        // Emit push notification to offline/other participant
        const recipientId = conversation.participants
          .find((p) => p.toString() !== userId)
          ?.toString();

        if (recipientId) {
          io.to(`user:${recipientId}`).emit('newNotification', {
            type: 'message',
            message: `New message from ${socket.user.name}: "${messageText.substring(0, 30)}..."`,
            relatedConversation: conversationId,
            createdAt: new Date(),
          });
        }
      } catch (err) {
        console.error('Error handling socket sendMessage:', err);
      }
    });

    // Typing Indicators
    socket.on('typing', (data) => {
      const conversationId = typeof data === 'object' && data !== null ? data.conversationId : data;
      socket.to(`conversation:${conversationId}`).emit('userTyping', {
        userId,
        userName: socket.user.name,
        name: socket.user.name,
        conversationId,
      });
    });

    socket.on('stopTyping', (data) => {
      const conversationId = typeof data === 'object' && data !== null ? data.conversationId : data;
      socket.to(`conversation:${conversationId}`).emit('userStopTyping', {
        userId,
        conversationId,
      });
    });

    // Read Receipts
    socket.on('markAsRead', async (data) => {
      try {
        const conversationId = typeof data === 'object' && data !== null ? data.conversationId : data;
        if (!conversationId) return;

        await Message.updateMany(
          { conversation: conversationId, sender: { $ne: userId }, isRead: false },
          { $set: { isRead: true } }
        );

        io.to(`conversation:${conversationId}`).emit('messagesRead', {
          conversationId,
          readBy: userId,
        });
      } catch (err) {
        console.error('Error in markAsRead:', err);
      }
    });

    // Disconnect Handler
    socket.on('disconnect', () => {
      const userSockets = onlineUsers.get(userId);
      if (userSockets) {
        userSockets.delete(socket.id);
        if (userSockets.size === 0) {
          onlineUsers.delete(userId);
          io.emit('userOnlineStatus', {
            userId,
            isOnline: false,
            onlineUserIds: Array.from(onlineUsers.keys()),
          });
        }
      }
    });
  });

  return io;
};

const getIO = () => {
  if (!ioInstance) {
    throw new Error('Socket.io has not been initialized');
  }
  return ioInstance;
};

module.exports = { initSocket, getIO, onlineUsers };
