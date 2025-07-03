import express from 'express';
import authMiddleware from '../middleware/auth.js';
import Message from '../models/ChatMessage.js';

const router = express.Router();

// ✅ GET all chat messages
router.get('/', authMiddleware, async (req, res) => {
  try {
    const messages = await Message.find()
      .populate('sender', 'username isAdmin')  // ⭐️ RIGHT HERE!
      .sort({ createdAt: 1 });

    res.json(messages);
  } catch (err) {
    console.error('Fetch chat error:', err);
    res.status(500).json({ error: 'Server error while fetching messages.' });
  }
});

// ✅ POST new chat message
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { content } = req.body;

    if (!content || !content.trim()) {
      return res.status(400).json({ error: 'Text is required.' });
    }

    const newMessage = new Message({
      sender: req.user.userId,
      content: content.trim()
    });

    await newMessage.save();
    await newMessage.populate('sender', 'username isAdmin');

    res.status(201).json(newMessage);
  } catch (err) {
    console.error('Send message error:', err);
    res.status(500).json({ error: 'Server error while sending message.' });
  }
});

export default router;
