const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const User = require("../models/userModel");
const Session = require("../models/sessionModel");
const OTP = require("../models/otpModel");
const {
  validatePhone,
  validateEmail,
  validatePassword,
  validateUsername,
  validateName,
  getPasswordStrength
} = require("../utils/validation");
const {
  createOTP,
  verifyOTP,
  requestPasswordResetOTP,
  hashOTP,
  compareOTP,
  sendOTPEmail,
  sendOTPSMS
} = require("../services/otpService");
const {
  trackLoginAttempt,
  resetLoginAttempts,
  trackOTPRequest
} = require("../middleware/rateLimiter");
const {
  generateDeviceId,
  parseDeviceInfo,
  getClientIP
} = require("../utils/deviceUtils");

const router = express.Router();

const getJwtSecret = () => {
  const secret = process.env.JWT_SECRET;
  if (process.env.NODE_ENV === "production" && (!secret || secret === "your-secret-key")) {
    throw new Error("JWT_SECRET must be set to a strong production secret");
  }
  return secret || "your-secret-key";
};

const getTokenFromRequest = (req) => req.headers.authorization?.split(" ")[1];

const requireAuthenticatedUser = async (req, res, next) => {
  try {
    const token = getTokenFromRequest(req);
    if (!token) {
      return res.status(401).json({ message: "No token provided" });
    }

    const decoded = jwt.verify(token, getJwtSecret());
    const user = await User.findById(decoded._id);
    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    if (user.status && user.status !== "active") {
      return res.status(403).json({ message: `Account is ${user.status}` });
    }

    req.authUser = user;
    req.authToken = token;
    next();
  } catch (err) {
    res.status(401).json({ message: "Unauthorized", error: err.message });
  }
};

const canManageUser = (req, userId) =>
  req.authUser?._id?.toString() === userId?.toString() ||
  ["admin", "moderator"].includes(req.authUser?.role);

const normalizeEmail = (email) => {
  const normalized = typeof email === "string" ? email.trim().toLowerCase() : "";
  return normalized || undefined;
};

const normalizePhone = (phone) => {
  const normalized = typeof phone === "string" ? phone.trim() : "";
  return normalized || undefined;
};

const normalizeUsername = (username) => {
  const normalized = typeof username === "string" ? username.trim().toLowerCase() : "";
  return normalized || undefined;
};

const normalizeIdentifier = (identifier) => {
  const value = typeof identifier === "string" ? identifier.trim() : "";
  if (!value) return "";
  return value.includes("@") ? value.toLowerCase() : value;
};

const buildUniqueUserQuery = ({ phone, email, username }) => {
  const conditions = [];
  if (phone) conditions.push({ phone });
  if (email) conditions.push({ email });
  if (username) conditions.push({ username });
  return conditions.length ? { $or: conditions } : null;
};

const buildLoginQuery = (identifier) => {
  const normalized = normalizeIdentifier(identifier);
  if (!normalized) return null;

  if (normalized.includes("@")) {
    return { email: normalized };
  }

  return {
    $or: [
      { phone: normalized },
      { username: normalized.toLowerCase() }
    ]
  };
};

const getUserResetContact = (user, requestedIdentifier) => {
  if (requestedIdentifier.includes("@")) return user.email;
  if (requestedIdentifier.startsWith("+")) return user.phone;
  return user.email || user.phone;
};

const createAuthResponseUser = (user) => ({
  _id: user._id,
  name: user.name,
  username: user.username,
  email: user.email,
  phone: user.phone,
  role: user.role,
  roles: user.roles,
  farmType: user.farmType,
  location: user.location,
  avatar: user.avatar,
  status: user.status
});

const isAllowedOtpType = (type) => ["signup", "reset", "2fa"].includes(type);

const buildContactOtpQuery = ({ phone, email, type = "signup", verified } = {}) => {
  const contactConditions = [];
  if (phone) contactConditions.push({ phone });
  if (email) contactConditions.push({ email });

  if (!contactConditions.length) return null;

  const query = {
    type,
    $or: contactConditions
  };

  if (typeof verified === "boolean") {
    query.verified = verified;
  }

  return query;
};

// Country list (for signup)
const countries = [
  { "name": "India", "code": "IN", "phoneCode": "+91", "flag": "🇮🇳", "format": "(xxxxx xxxxx)" },
  { "name": "United States", "code": "US", "phoneCode": "+1", "flag": "🇺🇸", "format": "(xxx) xxx-xxxx" },
  { "name": "United Kingdom", "code": "GB", "phoneCode": "+44", "flag": "🇬🇧", "format": "+44 xxxx xxxxxx" },
  { "name": "Canada", "code": "CA", "phoneCode": "+1", "flag": "🇨🇦", "format": "(xxx) xxx-xxxx" },
  { "name": "Australia", "code": "AU", "phoneCode": "+61", "flag": "🇦🇺", "format": "+61 x xxxx xxxx" },
  { "name": "Germany", "code": "DE", "phoneCode": "+49", "flag": "🇩🇪", "format": "+49 xxx xxxxxxxx" },
  { "name": "France", "code": "FR", "phoneCode": "+33", "flag": "🇫🇷", "format": "+33 x xx xx xx xx" },
  { "name": "Italy", "code": "IT", "phoneCode": "+39", "flag": "🇮🇹", "format": "+39 xxx xxx xxxx" },
  { "name": "Spain", "code": "ES", "phoneCode": "+34", "flag": "🇪🇸", "format": "+34 xxx xx xx xx" },
  { "name": "Brazil", "code": "BR", "phoneCode": "+55", "flag": "🇧🇷", "format": "+55 xx xxxxx xxxx" }
];

// GET /api/auth/countries - Get list of countries with phone codes
router.get("/countries", (req, res) => {
  try {
    res.json(countries);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/auth/ready-check - Report launch-readiness for authentication
router.get("/ready-check", (req, res) => {
  try {
    const checks = {
      jwtConfigured: Boolean(process.env.JWT_SECRET && process.env.JWT_SECRET !== "your-secret-key"),
      databaseConfigured: Boolean(process.env.MONGODB_URI || process.env.MONGO_URI),
      otpConfigured: Boolean(process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN),
      frontendConfigured: Boolean(process.env.FRONTEND_URL || process.env.ALLOWED_ORIGINS || process.env.ALLOWED_ORIGIN)
    };

    const ready = checks.jwtConfigured && checks.databaseConfigured && checks.otpConfigured && checks.frontendConfigured;

    res.json({
      ready,
      checks,
      message: ready
        ? "Authentication is ready for launch"
        : "Authentication is partially ready and needs deployment configuration before launch"
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/auth/test-otp/:phoneOrEmail - Get last OTP for testing (DEVELOPMENT ONLY)
router.get("/test-otp/:phoneOrEmail", async (req, res) => {
  try {
    const { phoneOrEmail } = req.params;
    
    if (process.env.NODE_ENV === "production") {
      return res.status(403).json({ message: "Not available in production" });
    }

    const isEmail = phoneOrEmail.includes("@");
    const otpRecord = await OTP.findOne({
      [isEmail ? "email" : "phone"]: phoneOrEmail
    }).sort({ createdAt: -1 });

    if (!otpRecord) {
      return res.status(404).json({ message: "No OTP found for this phone/email" });
    }

    if (new Date() > otpRecord.expiresAt) {
      return res.status(400).json({ message: "OTP has expired" });
    }

    res.json({
      message: "⚠️ DEVELOPMENT MODE - OTP for testing",
      phoneOrEmail,
      expiresAt: otpRecord.expiresAt,
      note: "Check backend console for OTP code during signup"
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/auth/check-phone - Check if phone exists
router.post("/check-phone", async (req, res) => {
  try {
    const phone = normalizePhone(req.body.phone);

    if (!phone) {
      return res.status(400).json({ message: "Phone number required" });
    }

    if (!validatePhone(phone)) {
      return res.status(400).json({ message: "Invalid phone format" });
    }

    const user = await User.findOne({ phone });

    res.json({
      available: !user,
      message: user ? "Phone already registered" : "Phone available"
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/auth/check-email - Check if email exists
router.post("/check-email", async (req, res) => {
  try {
    const email = normalizeEmail(req.body.email);

    if (!email) {
      return res.status(400).json({ message: "Email required" });
    }

    if (!validateEmail(email)) {
      return res.status(400).json({ message: "Invalid email format" });
    }

    const user = await User.findOne({ email });

    res.json({
      available: !user,
      message: user ? "Email already registered" : "Email available"
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/auth/check-username - Check if username exists
router.post("/check-username", async (req, res) => {
  try {
    const username = normalizeUsername(req.body.username);

    if (!username) {
      return res.status(400).json({ message: "Username required" });
    }

    if (!validateUsername(username)) {
      return res.status(400).json({
        message: "Username must be 3-30 characters, letters/numbers/underscores/hyphens only"
      });
    }

    const user = await User.findOne({ username });

    res.json({
      available: !user,
      message: user ? "Username taken" : "Username available"
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/auth/send-otp - Send OTP
router.post("/send-otp", async (req, res) => {
  try {
    const phoneOrEmail = normalizeIdentifier(req.body.phoneOrEmail);
    const { type = "signup" } = req.body;

    if (!phoneOrEmail) {
      return res.status(400).json({ message: "Phone or Email required" });
    }

    if (!isAllowedOtpType(type)) {
      return res.status(400).json({ message: "Invalid OTP type" });
    }

    // Check rate limit
    const rateLimitCheck = trackOTPRequest(phoneOrEmail);
    if (rateLimitCheck.limited) {
      return res.status(429).json({ message: rateLimitCheck.message });
    }

    // Validate format
    const isEmail = phoneOrEmail.includes("@");
    if (isEmail && !validateEmail(phoneOrEmail)) {
      return res.status(400).json({ message: "Invalid email format" });
    }
    if (!isEmail && !validatePhone(phoneOrEmail)) {
      return res.status(400).json({ message: "Invalid phone format" });
    }

    const result = await createOTP(phoneOrEmail, type);

    res.json(result);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/auth/verify-otp - Verify OTP
router.post("/verify-otp", async (req, res) => {
  try {
    const phoneOrEmail = normalizeIdentifier(req.body.phoneOrEmail);
    const { otp, type = "signup" } = req.body;

    if (!phoneOrEmail || !otp) {
      return res.status(400).json({ message: "Phone/Email and OTP required" });
    }

    if (!isAllowedOtpType(type)) {
      return res.status(400).json({ message: "Invalid OTP type" });
    }

    const result = await verifyOTP(phoneOrEmail, otp, type);

    res.json(result);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/auth/signup - Create account
router.post("/signup", async (req, res) => {
  try {
    const phone = normalizePhone(req.body.phone);
    const email = normalizeEmail(req.body.email);
    const username = normalizeUsername(req.body.username);
    const { password, name, bio, country } = req.body;

    // Validation
    if (!phone && !email) {
      return res.status(400).json({ message: "Phone or Email required" });
    }

    if (!validatePassword(password)) {
      return res.status(400).json({
        message: "Password must be 8+ chars with uppercase, lowercase, number, special char"
      });
    }

    if (!validateUsername(username)) {
      return res.status(400).json({
        message: "Username must be 3-30 characters, letters/numbers/underscores/hyphens only"
      });
    }

    if (!validateName(name)) {
      return res.status(400).json({
        message: "Name must be 2-50 characters, letters and spaces only"
      });
    }

    // Check if OTP is verified
    const otpQuery = buildContactOtpQuery({ phone, email, type: "signup", verified: true });
    const otpRecord = otpQuery ? await OTP.findOne(otpQuery).sort({ createdAt: -1 }) : null;

    if (!otpRecord) {
      return res.status(400).json({ message: "Please verify OTP first" });
    }

    // Check if user already exists
    const existingUserQuery = buildUniqueUserQuery({ phone, email, username });
    const existingUser = existingUserQuery ? await User.findOne(existingUserQuery) : null;

    if (existingUser) {
      if (phone && existingUser.phone === phone) {
        return res.status(400).json({ message: "Phone already registered" });
      }
      if (email && existingUser.email === email) {
        return res.status(400).json({ message: "Email already registered" });
      }
      if (username && existingUser.username === username) {
        return res.status(400).json({ message: "Username already taken" });
      }
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await User.create({
      phone,
      email,
      username,
      password: hashedPassword,
      name,
      bio: bio || "",
      country,
      phoneVerified: Boolean(phone && otpRecord.phone === phone),
      emailVerified: Boolean(email && otpRecord.email === email),
      verifiedAt: new Date()
    });

    // Delete OTP record
    await OTP.deleteOne({ _id: otpRecord._id });

    // Create JWT token
    const token = jwt.sign(
      { _id: user._id, username: user.username, role: user.role },
      getJwtSecret(),
      { expiresIn: "30d" }
    );

    res.status(201).json({
      message: "Account created successfully",
      token,
      user: createAuthResponseUser(user)
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/auth/login - Login
router.post("/login", async (req, res) => {
  try {
    const phoneOrEmail = normalizeIdentifier(req.body.identifier || req.body.phoneOrEmail);
    const { password, rememberMe } = req.body;

    if (!phoneOrEmail || !password) {
      return res.status(400).json({ message: "Phone/Email and password required" });
    }

    // Check rate limit
    const rateLimitCheck = trackLoginAttempt(phoneOrEmail);
    if (rateLimitCheck.locked) {
      return res.status(429).json({
        message: `Too many login attempts. Try again in ${rateLimitCheck.remainingMinutes} minutes.`
      });
    }

    // Find user
    const loginQuery = buildLoginQuery(phoneOrEmail);
    const user = loginQuery ? await User.findOne(loginQuery) : null;

    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Reset login attempts
    resetLoginAttempts(phoneOrEmail);

    // Create JWT token
    const expiresIn = rememberMe ? "30d" : "7d";
    const token = jwt.sign(
      { _id: user._id, username: user.username },
      getJwtSecret(),
      { expiresIn }
    );

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    res.json({
      message: "Login successful",
      token,
      user: createAuthResponseUser(user)
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/auth/forgot-password - Request password reset
router.post("/forgot-password", async (req, res) => {
  try {
    const phoneOrEmail = normalizeIdentifier(req.body.identifier || req.body.phoneOrEmail);

    if (!phoneOrEmail) {
      return res.status(400).json({ message: "Phone or Email required" });
    }

    const loginQuery = buildLoginQuery(phoneOrEmail);
    const user = loginQuery ? await User.findOne(loginQuery) : null;

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const resetContact = getUserResetContact(user, phoneOrEmail);

    if (!resetContact) {
      return res.status(400).json({ message: "No verified phone or email available for password reset" });
    }

    const result = await requestPasswordResetOTP(resetContact);

    res.json(result);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/auth/reset-password - Reset password
router.post("/reset-password", async (req, res) => {
  try {
    const phoneOrEmail = normalizeIdentifier(req.body.identifier || req.body.phoneOrEmail);
    const { otp, newPassword, confirmPassword } = req.body;

    if (!phoneOrEmail || !otp || !newPassword) {
      return res.status(400).json({ message: "All fields required" });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({ message: "Passwords do not match" });
    }

    if (!validatePassword(newPassword)) {
      return res.status(400).json({
        message: "Password must be 8+ chars with uppercase, lowercase, number, special char"
      });
    }

    const loginQuery = buildLoginQuery(phoneOrEmail);
    const user = loginQuery ? await User.findOne(loginQuery) : null;

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const resetContact = getUserResetContact(user, phoneOrEmail);

    if (!resetContact) {
      return res.status(400).json({ message: "No verified phone or email available for password reset" });
    }

    // Verify reset OTP
    const isEmail = resetContact.includes("@");
    const otpRecord = await OTP.findOne({
      [isEmail ? "email" : "phone"]: resetContact,
      type: "reset"
    }).sort({ createdAt: -1 });

    if (!otpRecord) {
      return res.status(400).json({ message: "OTP not found or expired" });
    }

    if (new Date() > otpRecord.expiresAt) {
      await OTP.deleteOne({ _id: otpRecord._id });
      return res.status(400).json({ message: "OTP expired" });
    }

    if (otpRecord.attempts >= otpRecord.maxAttempts) {
      await OTP.deleteOne({ _id: otpRecord._id });
      return res.status(400).json({ message: "Max attempts reached" });
    }

    // Verify OTP
    const otpService = require("../services/otpService");
    if (!otpService.compareOTP(otp, otpRecord.otp)) {
      otpRecord.attempts += 1;
      await otpRecord.save();
      return res.status(400).json({ message: "Invalid OTP" });
    }

    // Update user password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();

    // Delete OTP
    await OTP.deleteOne({ _id: otpRecord._id });

    res.json({ message: "Password reset successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/auth/verify-token - Verify JWT token
router.get("/verify-token", (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.status(401).json({ valid: false });
    }

    jwt.verify(token, getJwtSecret());
    res.json({ valid: true });
  } catch (err) {
    res.status(401).json({ valid: false, message: "Invalid token" });
  }
});

// ========== V3.0 ENHANCED ROUTES ==========

// POST /api/auth/signup-v3 - V3.0 Signup with role selection
router.post("/signup-v3", async (req, res) => {
  try {
    const phone = normalizePhone(req.body.phone);
    const email = normalizeEmail(req.body.email);
    const username = normalizeUsername(req.body.username);
    const { 
      password, 
      name, 
      role = "farmer", 
      farmType,
      location,
      farmName,
      termsAccepted,
      dataConsent
    } = req.body;

    // Validation
    if (!phone && !email) {
      return res.status(400).json({ message: "Phone or Email required" });
    }

    if (!validatePassword(password)) {
      return res.status(400).json({
        message: "Password must be 8+ chars with uppercase, lowercase, number, special char"
      });
    }

    if (!validateUsername(username)) {
      return res.status(400).json({
        message: "Username must be 3-30 characters, letters/numbers/underscores only"
      });
    }

    if (!validateName(name)) {
      return res.status(400).json({
        message: "Name must be 2-50 characters"
      });
    }

    // Validate role
    const validRoles = ["farmer", "vendor", "buyer", "analyst"];
    if (!validRoles.includes(role)) {
      return res.status(400).json({ message: "Invalid role selected" });
    }

    // Terms acceptance required
    if (!termsAccepted) {
      return res.status(400).json({ message: "Please accept terms and conditions" });
    }

    // Check if OTP is verified
    const otpQuery = buildContactOtpQuery({ phone, email, type: "signup", verified: true });
    const otpRecord = otpQuery ? await OTP.findOne(otpQuery).sort({ createdAt: -1 }) : null;

    if (!otpRecord) {
      return res.status(400).json({ message: "Please verify OTP first" });
    }

    // Check if user already exists
    const existingUserQuery = buildUniqueUserQuery({ phone, email, username });
    const existingUser = existingUserQuery ? await User.findOne(existingUserQuery) : null;

    if (existingUser) {
      if (phone && existingUser.phone === phone) {
        return res.status(400).json({ message: "Phone already registered" });
      }
      if (email && existingUser.email === email) {
        return res.status(400).json({ message: "Email already registered" });
      }
      if (username && existingUser.username === username) {
        return res.status(400).json({ message: "Username already taken" });
      }
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user with V3.0 fields
    const user = await User.create({
      phone,
      email,
      username,
      password: hashedPassword,
      name,
      role,
      roles: [role],
      farmType: farmType || "crop",
      location: location || "",
      farmName: farmName || "",
      phoneVerified: Boolean(phone && otpRecord.phone === phone),
      emailVerified: Boolean(email && otpRecord.email === email),
      verifiedAt: new Date(),
      termsAcceptedAt: new Date(),
      dataConsent: dataConsent || false,
      status: "active",
      language: "en",
      timezone: "UTC"
    });

    // Delete OTP record
    await OTP.deleteOne({ _id: otpRecord._id });

    // Create JWT token
    const token = jwt.sign(
      { _id: user._id, username: user.username, role: user.role },
      getJwtSecret(),
      { expiresIn: "30d" }
    );

    // Create session
    const deviceInfo = parseDeviceInfo(req.headers["user-agent"]);
    const deviceId = generateDeviceId(req);
    const ipAddress = getClientIP(req);

    const session = await Session.create({
      userId: user._id,
      token,
      deviceId,
      deviceName: `${deviceInfo.deviceBrowser} on ${deviceInfo.deviceOS}`,
      deviceType: deviceInfo.deviceType,
      deviceOS: deviceInfo.deviceOS,
      deviceBrowser: deviceInfo.deviceBrowser,
      userAgent: req.headers["user-agent"],
      ipAddress,
      isActive: true,
      isSecure: req.secure || req.headers["x-forwarded-proto"] === "https",
      isMobile: deviceInfo.deviceType === "mobile",
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
    });

    // Update user's active sessions
    user.activeSessions = [session._id];
    user.lastLogin = new Date();
    user.totalLogins = 1;
    await user.save();

    res.status(201).json({
      message: "Account created successfully",
      token,
      user: createAuthResponseUser(user)
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/auth/login-v3 - V3.0 Login with 2FA support
router.post("/login-v3", async (req, res) => {
  try {
    const phoneOrEmail = normalizeIdentifier(req.body.identifier || req.body.phoneOrEmail);
    const { password, rememberMe } = req.body;

    if (!phoneOrEmail || !password) {
      return res.status(400).json({ message: "Phone/Email and password required" });
    }

    // Check rate limit
    const rateLimitCheck = trackLoginAttempt(phoneOrEmail);
    if (rateLimitCheck.locked) {
      return res.status(429).json({
        message: `Too many login attempts. Try again in ${rateLimitCheck.remainingMinutes} minutes.`
      });
    }

    // Find user
    const loginQuery = buildLoginQuery(phoneOrEmail);
    const user = loginQuery ? await User.findOne(loginQuery) : null;

    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Check account status (V3.0)
    if (user.status === "suspended") {
      return res.status(403).json({ 
        message: "Account suspended",
        suspensionReason: user.suspensionReason
      });
    }

    if (user.status === "deleted") {
      return res.status(403).json({ message: "Account no longer exists" });
    }

    if (user.accountLocked && user.accountLockedUntil > new Date()) {
      return res.status(423).json({ 
        message: "Account locked. Try again later"
      });
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      user.loginAttempts = (user.loginAttempts || 0) + 1;
      if (user.loginAttempts >= 5) {
        user.accountLocked = true;
        user.accountLockedUntil = new Date(Date.now() + 30 * 60 * 1000); // 30 min lockout
      }
      await user.save();
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Reset login attempts on successful password check
    user.loginAttempts = 0;
    user.accountLocked = false;
    resetLoginAttempts(phoneOrEmail);

    // Check if 2FA is enabled (V3.0)
    if (user.twoFactorEnabled) {
      const twoFactorContact = user.twoFactorMethod === "email" ? user.email : user.phone;
      if (!twoFactorContact) {
        return res.status(400).json({ message: "No phone or email available for 2FA" });
      }

      // Send 2FA code
      const twoFactorOTP = Math.floor(100000 + Math.random() * 900000).toString();
      const hashedTwoFactorOTP = hashOTP(twoFactorOTP);
      
      // Store temporarily in Redis or cache (for this example, we'll store in OTP collection)
      await OTP.create({
        [twoFactorContact.includes("@") ? "email" : "phone"]: twoFactorContact,
        otp: hashedTwoFactorOTP,
        type: "2fa",
        expiresAt: new Date(Date.now() + 5 * 60 * 1000), // 5 min
        verified: false
      });

      if (twoFactorContact.includes("@")) {
        await sendOTPEmail(twoFactorContact, twoFactorOTP);
      } else {
        await sendOTPSMS(twoFactorContact, twoFactorOTP);
      }

      return res.status(200).json({
        message: "2FA code sent",
        requiresTwoFactor: true,
        userId: user._id,
        method: user.twoFactorMethod
      });
    }

    // Create JWT token (V3.0 with role)
    const expiresIn = rememberMe ? "30d" : "7d";
    const token = jwt.sign(
      { 
        _id: user._id, 
        username: user.username,
        role: user.role,
        permissions: user.permissions 
      },
      getJwtSecret(),
      { expiresIn }
    );

    // Create session (V3.0)
    const deviceInfo = parseDeviceInfo(req.headers["user-agent"]);
    const deviceId = generateDeviceId(req);
    const ipAddress = getClientIP(req);

    const session = await Session.create({
      userId: user._id,
      token,
      deviceId,
      deviceName: `${deviceInfo.deviceBrowser} on ${deviceInfo.deviceOS}`,
      deviceType: deviceInfo.deviceType,
      deviceOS: deviceInfo.deviceOS,
      deviceBrowser: deviceInfo.deviceBrowser,
      userAgent: req.headers["user-agent"],
      ipAddress,
      isActive: true,
      isSecure: req.secure || req.headers["x-forwarded-proto"] === "https",
      isMobile: deviceInfo.deviceType === "mobile",
      expiresAt: new Date(Date.now() + (rememberMe ? 30 : 7) * 24 * 60 * 60 * 1000)
    });

    // Update user
    user.lastLogin = new Date();
    user.lastActivityAt = new Date();
    user.totalLogins = (user.totalLogins || 0) + 1;
    if (!user.activeSessions.includes(session._id)) {
      user.activeSessions.push(session._id);
    }
    await user.save();

    res.json({
      message: "Login successful",
      token,
      sessionId: session._id,
      user: createAuthResponseUser(user)
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/auth/verify-2fa - Verify 2FA code
router.post("/verify-2fa", async (req, res) => {
  try {
    const { userId, code, phoneOrEmail } = req.body;

    if (!userId || !code) {
      return res.status(400).json({ message: "User ID and 2FA code required" });
    }

    // Find user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Verify 2FA code
    const otpQueries = [];
    if (user.email) otpQueries.push({ email: user.email });
    if (user.phone) otpQueries.push({ phone: user.phone });

    const otpRecord = otpQueries.length
      ? await OTP.findOne({ type: "2fa", $or: otpQueries }).sort({ createdAt: -1 })
      : null;

    if (!otpRecord) {
      return res.status(400).json({ message: "2FA code expired or not found" });
    }

    if (new Date() > otpRecord.expiresAt) {
      await OTP.deleteOne({ _id: otpRecord._id });
      return res.status(400).json({ message: "2FA code expired" });
    }

    if (!compareOTP(code, otpRecord.otp)) {
      return res.status(400).json({ message: "Invalid 2FA code" });
    }

    // Delete used OTP
    await OTP.deleteOne({ _id: otpRecord._id });

    // Create session and token
    const expiresIn = "7d";
    const token = jwt.sign(
      { 
        _id: user._id, 
        username: user.username,
        role: user.role,
        permissions: user.permissions 
      },
      getJwtSecret(),
      { expiresIn }
    );

    const deviceInfo = parseDeviceInfo(req.headers["user-agent"]);
    const deviceId = generateDeviceId(req);
    const ipAddress = getClientIP(req);

    const session = await Session.create({
      userId: user._id,
      token,
      deviceId,
      deviceName: `${deviceInfo.deviceBrowser} on ${deviceInfo.deviceOS}`,
      deviceType: deviceInfo.deviceType,
      deviceOS: deviceInfo.deviceOS,
      deviceBrowser: deviceInfo.deviceBrowser,
      userAgent: req.headers["user-agent"],
      ipAddress,
      isActive: true,
      isSecure: req.secure || req.headers["x-forwarded-proto"] === "https",
      isMobile: deviceInfo.deviceType === "mobile",
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    });

    user.activeSessions = [session._id];
    user.lastLogin = new Date();
    await user.save();

    res.json({
      message: "2FA verified successfully",
      token,
      sessionId: session._id,
      user: createAuthResponseUser(user)
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/auth/enable-2fa - Enable 2FA
router.post("/enable-2fa", requireAuthenticatedUser, async (req, res) => {
  try {
    const { userId, method = "sms" } = req.body;

    if (!canManageUser(req, userId)) {
      return res.status(403).json({ message: "Cannot change 2FA for another account" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Generate backup codes
    const backupCodes = Array.from({ length: 10 }, () => 
      crypto.randomBytes(4).toString('hex')
    );

    user.twoFactorEnabled = true;
    user.twoFactorMethod = method;
    user.twoFactorBackupCodes = backupCodes;
    await user.save();

    res.json({
      message: "2FA enabled successfully",
      backupCodes,
      warning: "Save these backup codes in a safe place"
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/auth/disable-2fa - Disable 2FA
router.post("/disable-2fa", requireAuthenticatedUser, async (req, res) => {
  try {
    const { userId, password } = req.body;

    if (!canManageUser(req, userId)) {
      return res.status(403).json({ message: "Cannot change 2FA for another account" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Verify password
    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      return res.status(401).json({ message: "Invalid password" });
    }

    user.twoFactorEnabled = false;
    user.twoFactorBackupCodes = [];
    await user.save();

    res.json({ message: "2FA disabled successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/auth/sessions - Get active sessions
router.get("/sessions/:userId", requireAuthenticatedUser, async (req, res) => {
  try {
    const { userId } = req.params;

    if (!canManageUser(req, userId)) {
      return res.status(403).json({ message: "Cannot view sessions for another account" });
    }

    const sessions = await Session.find({
      userId,
      isActive: true,
      expiresAt: { $gt: new Date() }
    }).select("deviceName deviceOS ipAddress createdAt lastActivity");

    res.json({ sessions });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE /api/auth/sessions/:sessionId - Logout from specific session
router.delete("/sessions/:sessionId", requireAuthenticatedUser, async (req, res) => {
  try {
    const { sessionId } = req.params;

    const session = await Session.findById(sessionId);
    if (!session) {
      return res.status(404).json({ message: "Session not found" });
    }

    if (!canManageUser(req, session.userId)) {
      return res.status(403).json({ message: "Cannot log out another user's device" });
    }

    session.isActive = false;
    await session.save();

    res.json({ message: "Logged out from device successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/auth/logout - Logout
router.post("/logout", async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    
    if (token) {
      await Session.findOneAndUpdate(
        { token },
        { isActive: false }
      );
    }

    res.json({ message: "Logged out successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
