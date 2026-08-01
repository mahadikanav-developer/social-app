const jwt = require("jsonwebtoken");
const User = require("../models/userModel");
const Session = require("../models/sessionModel");

const getJwtSecret = () => {
  const secret = process.env.JWT_SECRET;
  if (process.env.NODE_ENV === "production" && (!secret || secret === "your-secret-key")) {
    throw new Error("JWT_SECRET must be set to a strong production secret");
  }
  return secret || "your-secret-key";
};

// V3.0 Enhanced Auth Middleware - Verify JWT and validate session
const authMiddleware = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.status(401).json({ message: "No token provided" });
    }

    // Verify JWT
    const decoded = jwt.verify(token, getJwtSecret());
    
    // Check if user exists
    const user = await User.findById(decoded._id);
    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    // Check if user account is active
    if (user.status !== "active") {
      return res.status(403).json({ 
        message: `Account is ${user.status}`,
        status: user.status
      });
    }

    // Verify session exists and is active
    const session = await Session.findOne({
      userId: user._id,
      token,
      isActive: true,
      expiresAt: { $gt: new Date() }
    });

    if (!session) {
      return res.status(401).json({ message: "Session expired or invalid" });
    }

    // Update last activity
    session.lastActivity = new Date();
    await session.save();

    // Attach user and token to request
    req.user = user;
    req.token = token;
    req.session = session;
    req.userId = user._id;

    next();
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Token expired" });
    }
    return res.status(401).json({ message: "Unauthorized", error: err.message });
  }
};

// Role-based access control (V3.0)
const roleMiddleware = (allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    // Check if user has one of the allowed roles
    const hasRole = allowedRoles.includes(req.user.role) || 
                    allowedRoles.some(role => req.user.roles?.includes(role));

    if (!hasRole) {
      return res.status(403).json({ message: "Insufficient permissions" });
    }

    next();
  };
};

// Permission-based access control (V3.0)
const permissionMiddleware = (requiredPermission) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    // Check if user has permission
    const hasPermission = req.user.permissions?.includes(requiredPermission) ||
                          // Admins and moderators have all permissions
                          ["admin", "moderator"].includes(req.user.role);

    if (!hasPermission) {
      return res.status(403).json({ message: "Permission denied" });
    }

    next();
  };
};

// Rate limiting middleware (V3.0)
const requestRateLimiter = (limit = 100, windowMs = 15 * 60 * 1000) => {
  const requests = new Map();

  return (req, res, next) => {
    const key = req.user?._id || req.ip;
    const now = Date.now();
    const userRequests = requests.get(key) || [];

    // Remove old requests
    const validRequests = userRequests.filter(time => now - time < windowMs);

    if (validRequests.length >= limit) {
      return res.status(429).json({ 
        message: "Too many requests. Please try again later.",
        retryAfter: Math.ceil((Math.min(...validRequests) + windowMs - now) / 1000)
      });
    }

    validRequests.push(now);
    requests.set(key, validRequests);
    next();
  };
};

// CORS and security headers middleware (V3.0)
const securityHeadersMiddleware = (req, res, next) => {
  // CORS headers
  res.header("Access-Control-Allow-Origin", process.env.ALLOWED_ORIGIN || "*");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, PATCH, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");

  // Security headers
  res.header("X-Content-Type-Options", "nosniff");
  res.header("X-Frame-Options", "DENY");
  res.header("X-XSS-Protection", "1; mode=block");
  res.header("Strict-Transport-Security", "max-age=31536000; includeSubDomains");
  res.header("Content-Security-Policy", "default-src 'self'");

  next();
};

// Audit logging middleware (V3.0)
const auditLogMiddleware = (req, res, next) => {
  const startTime = Date.now();

  // Log after response
  res.on("finish", () => {
    const duration = Date.now() - startTime;
    const auditLog = {
      timestamp: new Date(),
      userId: req.user?._id,
      method: req.method,
      path: req.path,
      statusCode: res.statusCode,
      duration: `${duration}ms`,
      ipAddress: req.ip,
      userAgent: req.headers["user-agent"]
    };

    // Console log (in production, this would go to a logging service)
    if (res.statusCode >= 400) {
      console.warn("[AUDIT]", auditLog);
    }
  });

  next();
};

// Middleware to check if user has 2FA enabled (V3.0)
const check2FAEnabled = (req, res, next) => {
  if (req.user?.twoFactorEnabled) {
    // User has 2FA enabled - verify they've completed it in this session
    if (!req.session?.twoFAVerified) {
      return res.status(403).json({ message: "2FA verification required" });
    }
  }
  next();
};

module.exports = {
  authMiddleware,
  roleMiddleware,
  permissionMiddleware,
  requestRateLimiter,
  securityHeadersMiddleware,
  auditLogMiddleware,
  check2FAEnabled
};
