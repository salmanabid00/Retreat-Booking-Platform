const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema(
  {
    conversation: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Conversation',
      required: true,
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null, // null for system auto-generated messages
    },
    message: {
      type: String,
      required: [true, 'Message content is required'],
      trim: true,
    },
    messageType: {
      type: String,
      enum: ['text', 'system'],
      default: 'text',
    },
    isRead: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

messageSchema.index({ conversation: 1, createdAt: 1 });
messageSchema.index({ sender: 1, isRead: 1 });

module.exports = mongoose.model('Message', messageSchema);
