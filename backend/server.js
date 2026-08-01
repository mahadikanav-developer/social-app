const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const helmet = require("helmet");
require("dotenv").config();

const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const postRoutes = require("./routes/postRoutes");
const uploadRoutes = require("./routes/uploadRoutes");
const aiRoutes = require("./routes/aiRoutes");
const hashtagRoutes = require("./routes/hashtagRoutes");
const messageRoutes = require("./routes/messageRoutes");
const storyRoutes = require("./routes/storyRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
const savedPostRoutes = require("./routes/savedPostRoutes");
const searchRoutes = require("./routes/searchRoutes");
const repostRoutes = require("./routes/repostRoutes");
const blockRoutes = require("./routes/blockRoutes");
const reportRoutes = require("./routes/reportRoutes");
const paymentRoutes = require("./routes/paymentRoutes");
const streamRoutes = require("./routes/streamRoutes");
const communityRoutes = require("./routes/communityRoutes");
const groupRoutes = require("./routes/groupRoutes");
const eventRoutes = require("./routes/eventRoutes");
const pageRoutes = require("./routes/pageRoutes");
const reactionRoutes = require("./routes/reactionRoutes");
const reelRoutes = require("./routes/reelRoutes");
const igtvRoutes = require("./routes/igtvRoutes");

const app = express();

const requiredProductionSecrets = [
  "JWT_SECRET",
  "MONGODB_URI"
];

if (process.env.NODE_ENV === "production") {
  const missingSecrets = requiredProductionSecrets.filter((key) => !process.env[key]);
  if (missingSecrets.length) {
    throw new Error(`Missing required production environment variables: ${missingSecrets.join(", ")}`);
  }

  if (process.env.JWT_SECRET === "your-secret-key" || process.env.JWT_SECRET.length < 32) {
    throw new Error("JWT_SECRET must be a strong production secret with at least 32 characters");
  }
}

const allowedOrigins = (process.env.ALLOWED_ORIGINS || process.env.ALLOWED_ORIGIN || process.env.FRONTEND_URL || "http://localhost:3000")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

app.set("trust proxy", 1);
app.use(helmet());

// CORS. Native mobile clients usually send no Origin header.
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(new Error("Not allowed by CORS"));
  },
  credentials: true
}));

// Middleware
app.use(express.json({ limit: process.env.JSON_BODY_LIMIT || "1mb" }));

// Static images
app.use("/uploads", express.static("uploads"));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/uploads", uploadRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/hashtags", hashtagRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/stories", storyRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/saved", savedPostRoutes);
app.use("/api/search", searchRoutes);
app.use("/api/reposts", repostRoutes);
app.use("/api/blocks", blockRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/streams", streamRoutes);
app.use("/api/communities", communityRoutes);
app.use("/api/groups", groupRoutes);
app.use("/api/events", eventRoutes);
app.use("/api/pages", pageRoutes);
app.use("/api/reactions", reactionRoutes);
app.use("/api/reels", reelRoutes);
app.use("/api/igtv", igtvRoutes);

// MongoDB
const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI || "mongodb://127.0.0.1:27017/farmAI";
mongoose.connect(mongoUri)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.log(err));

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
