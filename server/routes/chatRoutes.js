const express = require('express');
const router = express.Router();
const {
  getConversations,
  getOrCreateConversation,
  getMessages,
  markMessagesAsRead,
} = require('../controllers/chatController');
const { protect } = require('../middleware/authMiddleware');

router.get('/conversations', protect, getConversations);
router.post('/conversations', protect, getOrCreateConversation);
router.get('/messages/:conversationId', protect, getMessages);
router.patch('/messages/:conversationId/read', protect, markMessagesAsRead);

module.exports = router;
