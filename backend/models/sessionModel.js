const mongoose = require("mongoose");

const sessionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  token: { type: String, required: true, unique: true },
  
  // Device Info (V3.0)
  deviceId: { type: String, required: true }, // unique device identifier
  deviceName: { type: String, default: "" }, // e.g., "Chrome on Windows"
  deviceType: { type: String, enum: ["mobile", "tablet", "desktop"], default: "desktop" },
  deviceOS: { type: String, default: "" }, // iOS, Android, Windows, macOS, Linux
  deviceBrowser: { type: String, default: "" }, // Chrome, Safari, Firefox, etc.
  userAgent: { type: String, default: "" },
  
  // Network Info
  ipAddress: { type: String, required: true },
  lastActivity: { type: Date, default: Date.now },
  
  // Session Status
  isActive: { type: Boolean, default: true },
  isSecure: { type: Boolean, default: false }, // HTTPS
  isMobile: { type: Boolean, default: false },
  
  // Timestamps
  createdAt: { type: Date, default: Date.now, expires: 2592000 }, // 30 days TTL
  updatedAt: { type: Date, default: Date.now },
  expiresAt: { type: Date, required: true }
}, { timestamps: true });

// Index for performance
sessionSchema.index({ userId: 1 });
sessionSchema.index({ deviceId: 1 });
sessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 }); // TTL index

module.exports = mongoose.model("Session", sessionSchema);
