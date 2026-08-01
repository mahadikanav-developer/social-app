const crypto = require("crypto");

// Device fingerprinting utility (V3.0)
function generateDeviceFingerprint(req) {
  const userAgent = req.headers["user-agent"] || "";
  const acceptLanguage = req.headers["accept-language"] || "";
  const acceptEncoding = req.headers["accept-encoding"] || "";
  
  const fingerprint = crypto
    .createHash("sha256")
    .update(`${userAgent}${acceptLanguage}${acceptEncoding}`)
    .digest("hex");
  
  return fingerprint;
}

// Parse device info from user agent (V3.0)
function parseDeviceInfo(userAgent) {
  let deviceType = "desktop";
  let deviceOS = "unknown";
  let deviceBrowser = "unknown";

  // Detect device type
  if (/Mobile|Android|iPhone|iPad|iPod/.test(userAgent)) {
    deviceType = /iPad/.test(userAgent) ? "tablet" : "mobile";
  }

  // Detect OS
  if (/Windows/.test(userAgent)) deviceOS = "Windows";
  else if (/Macintosh/.test(userAgent)) deviceOS = "macOS";
  else if (/Linux/.test(userAgent)) deviceOS = "Linux";
  else if (/iPhone/.test(userAgent)) deviceOS = "iOS";
  else if (/Android/.test(userAgent)) deviceOS = "Android";

  // Detect browser
  if (/Chrome/.test(userAgent)) deviceBrowser = "Chrome";
  else if (/Safari/.test(userAgent)) deviceBrowser = "Safari";
  else if (/Firefox/.test(userAgent)) deviceBrowser = "Firefox";
  else if (/Edge/.test(userAgent)) deviceBrowser = "Edge";

  return { deviceType, deviceOS, deviceBrowser };
}

// Get IP address (V3.0)
function getClientIP(req) {
  return (
    req.headers["x-forwarded-for"]?.split(",")[0] ||
    req.socket.remoteAddress ||
    "unknown"
  );
}

// Generate secure device ID (V3.0)
function generateDeviceId(req) {
  const fingerprint = generateDeviceFingerprint(req);
  const ip = getClientIP(req);
  return crypto
    .createHash("sha256")
    .update(`${fingerprint}${ip}`)
    .digest("hex");
}

module.exports = {
  generateDeviceFingerprint,
  parseDeviceInfo,
  getClientIP,
  generateDeviceId
};
