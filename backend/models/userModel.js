const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  // Basic Info
  name: { type: String, required: true },
  username: { type: String, required: true, unique: true, trim: true, lowercase: true },
  email: { type: String, trim: true, lowercase: true, default: undefined },
  phone: { type: String, trim: true, default: undefined },
  password: { type: String, required: true },
  country: { type: String, default: "" },
  phoneCountryCode: { type: String, default: "" },

  // Verification
  phoneVerified: { type: Boolean, default: false },
  emailVerified: { type: Boolean, default: false },
  verifiedAt: { type: Date, default: null },

  // Profile
  avatar: { type: String, default: "" },
  bio: { type: String, default: "" },
  farmName: { type: String, default: "" },
  region: { type: String, default: "" },
  farmSize: { type: String, default: "" },
  crops: { type: String, default: "" }, // comma-separated e.g. "Wheat, Rice"
  farmType: {
    type: String,
    enum: [
      "crop",
      "livestock",
      "dairy",
      "mixed",
      "organic",
      "aquaculture",
      "seeds",
      "fertilizers",
      "equipment",
      "pesticides",
      "wholesale",
      "retail",
      "restaurant",
      "export",
      "vendor",
      "buyer",
      "other"
    ],
    default: "crop"
  },
  location: { type: String, default: "" },

  // V3.0 Role & Permissions
  role: { 
    type: String, 
    enum: ["farmer", "vendor", "buyer", "admin", "moderator", "analyst"], 
    default: "farmer" 
  },
  roles: [{ type: String, enum: ["farmer", "vendor", "buyer", "admin", "moderator", "analyst"] }], // multiple roles support
  permissions: [{ type: String, default: [] }], // custom permissions
  
  // Team/Organization Support (V3.0)
  organizationId: { type: mongoose.Schema.Types.ObjectId, ref: "Organization", default: null },
  organizationRole: { type: String, enum: ["owner", "admin", "member"], default: "member" },
  teamId: { type: mongoose.Schema.Types.ObjectId, ref: "Team", default: null },
  
  // Social & Connections
  followers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  following: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],

  // Security (V3.0 Enhanced)
  lastLogin: { type: Date, default: null },
  loginAttempts: { type: Number, default: 0 },
  loginAttemptResetTime: { type: Date, default: null },
  
  // Two-Factor Authentication (V3.0)
  twoFactorEnabled: { type: Boolean, default: false },
  twoFactorMethod: { type: String, enum: ["sms", "email", "authenticator"], default: "sms" }, // V3.0
  twoFactorSecret: { type: String, default: null }, // for authenticator apps
  twoFactorBackupCodes: [{ type: String }], // backup codes for 2FA
  
  // Session Management (V3.0)
  activeSessions: [{ type: mongoose.Schema.Types.ObjectId, ref: "Session" }],
  lastPasswordChange: { type: Date, default: null },
  
  // Security Flags (V3.0)
  accountLocked: { type: Boolean, default: false },
  accountLockedUntil: { type: Date, default: null },
  suspiciousActivityFlag: { type: Boolean, default: false },
  
  // Preferences & Settings (V3.0)
  language: { type: String, default: "en" },
  timezone: { type: String, default: "UTC" },
  notificationPreferences: {
    email: { type: Boolean, default: true },
    sms: { type: Boolean, default: true },
    push: { type: Boolean, default: true }
  },
  privacySettings: {
    profileVisibility: { type: String, enum: ["public", "private", "friends"], default: "public" },
    showEmail: { type: Boolean, default: false },
    showPhone: { type: Boolean, default: false }
  },
  
  // Account Status (V3.0)
  status: { type: String, enum: ["active", "inactive", "suspended", "deleted"], default: "active" },
  suspensionReason: { type: String, default: null },
  suspendedAt: { type: Date, default: null },
  
  // Compliance (V3.0)
  termsAcceptedAt: { type: Date, default: null },
  privacyAcceptedAt: { type: Date, default: null },
  dataConsent: { type: Boolean, default: false },
  
  // Analytics (V3.0)
  lastActivityAt: { type: Date, default: null },
  totalLogins: { type: Number, default: 0 }

}, { timestamps: true });

// Indexes for performance
userSchema.index(
  { email: 1 },
  { unique: true, partialFilterExpression: { email: { $exists: true, $type: "string" } } }
);
userSchema.index(
  { phone: 1 },
  { unique: true, partialFilterExpression: { phone: { $exists: true, $type: "string" } } }
);
userSchema.index({ organizationId: 1 });
userSchema.index({ role: 1 });
userSchema.index({ createdAt: -1 });

module.exports = mongoose.model("User", userSchema);
