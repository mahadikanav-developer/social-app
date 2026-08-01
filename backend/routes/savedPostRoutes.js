const express = require("express");
const SavedPost = require("../models/savedPostModel");
const Post = require("../models/postModal");
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

const getActorId = (req) => req.authUser?._id;
const isSameUser = (req, userId) => getActorId(req)?.toString() === userId?.toString();

// Save a post
router.post("/", requireAuth, async (req, res) => {
  try {
    const { postId, collectionName } = req.body;
    const userId = getActorId(req);

    // Check if already saved
    const existing = await SavedPost.findOne({ userId, postId });
    if (existing) {
      return res.status(400).json({ message: "Post already saved" });
    }

    const savedPost = await SavedPost.create({
      userId,
      postId,
      collectionName: collectionName || "Saved",
    });

    const populated = await savedPost
      .populate("postId")
      .populate("postId.userId", "name avatar");

    res.json(populated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get user's saved posts
router.get("/:userId", requireAuth, async (req, res) => {
  try {
    if (!isSameUser(req, req.params.userId)) {
      return res.status(403).json({ message: "Cannot view another user's saved posts" });
    }

    const savedPosts = await SavedPost.find({
      userId: req.params.userId,
    })
      .populate("postId")
      .populate("postId.userId", "name avatar")
      .sort({ createdAt: -1 });

    res.json(savedPosts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Remove saved post
router.delete("/:savedPostId", requireAuth, async (req, res) => {
  try {
    const savedPost = await SavedPost.findById(req.params.savedPostId);
    if (!savedPost) {
      return res.status(404).json({ message: "Saved post not found" });
    }

    if (!isSameUser(req, savedPost.userId)) {
      return res.status(403).json({ message: "Cannot remove another user's saved post" });
    }

    await SavedPost.findByIdAndDelete(req.params.savedPostId);
    res.json({ message: "Unsaved" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Check if post is saved by user
router.get("/:userId/:postId", requireAuth, async (req, res) => {
  try {
    if (!isSameUser(req, req.params.userId)) {
      return res.status(403).json({ message: "Cannot check another user's saved post" });
    }

    const saved = await SavedPost.findOne({
      userId: req.params.userId,
      postId: req.params.postId,
    });

    res.json({ saved: !!saved });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
