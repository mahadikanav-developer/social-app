const express = require("express");
const Story = require("../models/storyModel");
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

// Create a story
router.post("/", requireAuth, async (req, res) => {
  try {
    const { text, image, bgColor, textColor } = req.body;
    const userId = getActorId(req);

    const story = await Story.create({
      userId,
      text,
      image: image || "",
      bgColor: bgColor || "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      textColor: textColor || "#ffffff",
      views: [],
    });

    const populatedStory = await story.populate("userId", "name avatar farmName");
    res.json(populatedStory);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all active stories (from user's followers + their own)
router.get("/feed/:userId", async (req, res) => {
  try {
    const stories = await Story.find().populate("userId", "name avatar farmName").sort({ createdAt: -1 }).lean();

    // Filter to only stories less than 24 hours old
    const now = new Date();
    const activeStories = stories.filter(story => {
      const age = (now - new Date(story.createdAt)) / 1000 / 60 / 60; // hours
      return age < 24;
    });

    res.json(activeStories);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get stories from a specific user
router.get("/user/:userId", async (req, res) => {
  try {
    const stories = await Story.find({ userId: req.params.userId })
      .populate("userId", "name avatar farmName")
      .sort({ createdAt: -1 })
      .lean();

    // Filter to only stories less than 24 hours old
    const now = new Date();
    const activeStories = stories.filter(story => {
      const age = (now - new Date(story.createdAt)) / 1000 / 60 / 60; // hours
      return age < 24;
    });

    res.json(activeStories);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Add view to story
router.post("/:storyId/view", requireAuth, async (req, res) => {
  try {
    const viewerId = getActorId(req);
    const story = await Story.findById(req.params.storyId);
    if (!story) {
      return res.status(404).json({ message: "Story not found" });
    }

    if (!story.views.some(id => id.toString() === viewerId)) {
      story.views.push(viewerId);
      await story.save();
    }

    res.json(story);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete a story
router.delete("/:storyId", requireAuth, async (req, res) => {
  try {
    const story = await Story.findById(req.params.storyId);
    if (!story) {
      return res.status(404).json({ message: "Story not found" });
    }

    if (story.userId.toString() !== getActorId(req)) {
      return res.status(403).json({ message: "Can only delete your own story" });
    }

    await Story.findByIdAndDelete(req.params.storyId);
    res.json({ message: "Story deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
