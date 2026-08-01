const express = require("express");
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

// CREATE POST (with hashtag extraction)
const Hashtag = require("../models/hashtagModel");
const Notification = require("../models/notificationModel");
router.post("/", requireAuth, async (req, res) => {
  try {
    const { text, image, crop, type, price, unit, location, contact } = req.body;
    const userId = getActorId(req);

    const post = await Post.create({
      userId,
      text,
      image,
      crop,
      type: type || "update",
      price,
      unit,
      location,
      contact
    });

    // Hashtag extraction and update
    if (text) {
      const tags = (text.match(/#(\w{2,30})/g) || []).map(t => t.slice(1).toLowerCase());
      for (const tag of tags) {
        await Hashtag.findOneAndUpdate(
          { tag },
          { $inc: { postCount: 1 }, $set: { lastUsed: new Date() } },
          { upsert: true, new: true }
        );
      }
    }

    res.json({ post });

  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Post create failed" });
  }
});

// GET ALL POSTS (with optional category filter)
router.get("/", async (req, res) => {
  try {
    const { category } = req.query;
    let filter = {};
    if (category) {
      // Map category to post type or text search
      if (["Markets", "market"].includes(category)) filter.type = "market";
      else if (["Farming Tips", "tip"].includes(category)) filter.type = "tip";
      else if (["Community", "update"].includes(category)) filter.type = "update";
      else if (["Weather"].includes(category)) filter.text = /weather/i;
      else if (["Equipment"].includes(category)) filter.text = /equipment|tool|tractor|machine/i;
    }
    const posts = await Post.find(filter)
      .populate("userId", "name avatar")
      .sort({ createdAt: -1 });
    res.json(posts);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Fetch error" });
  }
});
// MARKETPLACE POSTS
router.get("/market", async (req, res) => {
  try {
    const { crop, location } = req.query;
    const filter = { type: "market" };

    if (crop) filter.crop = crop;
    if (location) filter.location = location;

    const posts = await Post.find(filter)
      .populate("userId", "name avatar")
      .sort({ createdAt: -1 });

    res.json(posts);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Market fetch failed" });
  }
});

// GET SINGLE POST
router.get("/:id", async (req, res) => {
  try {
    const post = await Post.findById(req.params.id).populate("userId", "name avatar");
    if (!post) return res.status(404).json({ message: "Post not found" });
    res.json(post);
  } catch (err) {
    res.status(500).json({ message: "Fetch post failed" });
  }
});

// LIKE POST
router.put("/:id/like", requireAuth, async (req, res) => {
  try {
    const userId = getActorId(req);

    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Post not found" });

    if (!post.likes.some(id => id.toString() === userId)) {
      post.likes.push(userId);
      
      // Create notification for post owner (if not liking own post)
      if (post.userId.toString() !== userId) {
        await Notification.create({
          recipientId: post.userId,
          senderId: userId,
          type: "like",
          postId: post._id,
        });
      }
    } else {
      post.likes = post.likes.filter(id => id.toString() !== userId);
    }

    await post.save();

    res.json(post);

  } catch (err) {
    res.status(500).json({ message: "Like failed" });
  }
});

// ADD COMMENT
router.post("/:id/comment", requireAuth, async (req, res) => {
  try {
    const { text } = req.body;
    const userId = getActorId(req);
    const post = await Post.findById(req.params.id);

    if (!post) return res.status(404).json({ message: "Post not found" });

    post.comments.push({
      userId,
      text,
      createdAt: new Date()
    });

    await post.save();
    await post.populate("comments.userId", "name avatar");

    // Create notification for post owner (if not commenting on own post)
    if (post.userId.toString() !== userId) {
      await Notification.create({
        recipientId: post.userId,
        senderId: userId,
        type: "comment",
        postId: post._id,
      });
    }

    res.json(post);
  } catch (err) {
    res.status(500).json({ message: "Comment failed" });
  }
});

// GET COMMENTS
router.get("/:id/comments", async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)
      .populate("comments.userId", "name avatar");

    if (!post) return res.status(404).json({ message: "Post not found" });

    res.json(post.comments);
  } catch (err) {
    res.status(500).json({ message: "Fetch comments failed" });
  }
});

// DELETE COMMENT
router.delete("/:postId/comment/:commentId", async (req, res) => {
  try {
    const post = await Post.findByIdAndUpdate(
      req.params.postId,
      { $pull: { comments: { _id: req.params.commentId } } },
      { new: true }
    ).populate("comments.userId", "name avatar");

    res.json(post);
  } catch (err) {
    res.status(500).json({ message: "Delete failed" });
  }
});

// DELETE POST
router.delete("/:postId", requireAuth, async (req, res) => {
  try {
    const { postId } = req.params;
    const userId = getActorId(req);

    const post = await Post.findById(postId);
    if (!post) return res.status(404).json({ message: "Post not found" });
    
    // Check if user is post owner
    if (post.userId.toString() !== userId) {
      return res.status(403).json({ message: "Can only delete your own posts" });
    }

    await Post.findByIdAndDelete(postId);
    res.json({ message: "Post deleted" });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Delete failed" });
  }
});

module.exports = router;
