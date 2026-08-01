const express = require("express");
const Conversation = require("../models/conversationModel");
const Message = require("../models/messageModel");
const User = require("../models/userModel");
const jwt = require("jsonwebtoken");
const router = express.Router();

const requireAuth = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      return res.status(401).json({ message: "No token provided" });
    }

    req.authUser = jwt.verify(token, process.env.JWT_SECRET || "your-secret-key");
    next();
  } catch (err) {
    res.status(401).json({ message: "Invalid or expired token" });
  }
};

const getActorId = (req) => req.authUser?.id || req.authUser?._id;

// Get all conversations for current user
router.get("/", requireAuth, async (req, res) => {
  try {
    const userId = getActorId(req);
    const conversations = await Conversation.find({
      participants: userId,
    })
      .populate("participants", "name _id avatar")
      .sort({ updatedAt: -1 });

    res.json(conversations);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get or create a conversation with another user
router.post("/:userId", requireAuth, async (req, res) => {
  try {
    const currentUserId = getActorId(req);
    const otherUserId = req.params.userId;

    // Check if conversation already exists
    let conversation = await Conversation.findOne({
      participants: { $all: [currentUserId, otherUserId] },
    }).populate("participants", "name _id avatar");

    if (!conversation) {
      // Create new conversation
      conversation = await Conversation.create({
        participants: [currentUserId, otherUserId],
      });
      conversation = await conversation.populate(
        "participants",
        "name _id avatar"
      );
    }

    res.json(conversation);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all messages in a conversation
router.get("/:conversationId/messages", requireAuth, async (req, res) => {
  try {
    const actorId = getActorId(req);
    const conversation = await Conversation.findById(req.params.conversationId);
    if (!conversation) {
      return res.status(404).json({ error: "Conversation not found" });
    }
    if (!conversation.participants.some((id) => id.toString() === actorId)) {
      return res.status(403).json({ error: "Cannot view another user's conversation" });
    }

    const messages = await Message.find({
      conversationId: req.params.conversationId,
    })
      .populate("senderId", "name avatar")
      .sort({ createdAt: 1 });

    res.json(messages);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Send a message
router.post("/:conversationId/message", requireAuth, async (req, res) => {
  try {
    const { text } = req.body;
    const senderId = getActorId(req);
    const conversation = await Conversation.findById(req.params.conversationId);
    if (!conversation) {
      return res.status(404).json({ error: "Conversation not found" });
    }
    if (!conversation.participants.some((id) => id.toString() === senderId)) {
      return res.status(403).json({ error: "Cannot send messages in another user's conversation" });
    }

    const message = await Message.create({
      conversationId: req.params.conversationId,
      senderId,
      text,
    });

    // Update conversation's last message
    await Conversation.findByIdAndUpdate(req.params.conversationId, {
      lastMessage: {
        senderId,
        text,
        timestamp: new Date(),
      },
    });

    const populatedMessage = await message.populate("senderId", "name avatar");
    res.json(populatedMessage);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete a message
router.delete("/:conversationId/message/:messageId", requireAuth, async (req, res) => {
  try {
    const actorId = getActorId(req);
    const message = await Message.findById(req.params.messageId);
    if (!message) {
      return res.status(404).json({ error: "Message not found" });
    }
    if (message.senderId.toString() !== actorId) {
      return res.status(403).json({ error: "Can only delete your own messages" });
    }

    await Message.findByIdAndDelete(req.params.messageId);
    res.json({ message: "Message deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
