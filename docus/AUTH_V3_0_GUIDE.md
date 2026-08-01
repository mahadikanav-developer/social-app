# FarmSocial V3.0 Authentication System - Implementation Guide

## Overview

FarmSocial V3.0 includes a modern, enterprise-grade authentication and security system with support for:
- **Role-based access control** (Farmer, Vendor, Buyer, Analyst)
- **Multi-factor authentication (2FA)** via SMS, Email, or Authenticator apps
- **Device management** with device tracking and remote logout
- **Session-based security** with automatic expiration
- **Account protection** with lockout policies and suspension management
- **Enhanced validation** and comprehensive error handling
- **Audit logging** and compliance tracking
- **Permission-based access** with granular controls

---

## Features

### 1. Enhanced User Model (V3.0)

#### Role System
```javascript
role: "farmer" | "vendor" | "buyer" | "admin" | "moderator" | "analyst"
roles: ["farmer", "vendor"] // Multiple roles support
permissions: ["post.create", "community.moderate"] // Custom permissions
```

#### Security Fields
- `twoFactorEnabled`: Boolean - Enable/disable 2FA
- `twoFactorMethod`: "sms" | "email" | "authenticator"
- `twoFactorBackupCodes`: Array - Backup codes for account recovery
- `accountLocked`: Boolean - Account lock due to too many failed attempts
- `status`: "active" | "inactive" | "suspended" | "deleted"

#### Session Management
- `activeSessions`: Array - List of active session IDs
- `lastLogin`: Date - Last successful login
- `totalLogins`: Number - Lifetime login count

#### Organization/Team Support (V3.0)
- `organizationId`: ObjectId - Organization membership
- `organizationRole`: "owner" | "admin" | "member"
- `teamId`: ObjectId - Team assignment

#### Preferences (V3.0)
- `language`: String - User's preferred language
- `timezone`: String - User's timezone
- `notificationPreferences`: Object - Email, SMS, Push preferences
- `privacySettings`: Object - Profile visibility, data sharing

---

## Backend API Endpoints

### Authentication Endpoints

#### V3.0 Sign Up with Role Selection
```
POST /api/auth/signup-v3
Body: {
  firstName: string,
  lastName: string,
  username: string,
  email: string,
  phone: string,
  countryCode: string,
  password: string,
  role: "farmer" | "vendor" | "buyer" | "analyst",
  farmType: string,
  location: string,
  farmName: string (optional),
  termsAccepted: boolean,
  dataConsent: boolean (optional)
}
```

Response:
```json
{
  "message": "Account created successfully",
  "token": "jwt_token",
  "user": {
    "_id": "user_id",
    "name": "John Doe",
    "username": "johndoe",
    "role": "farmer",
    "status": "active"
  }
}
```

#### V3.0 Login with 2FA Support
```
POST /api/auth/login-v3
Body: {
  phoneOrEmail: string,
  password: string,
  rememberMe: boolean (optional)
}
```

Response (if 2FA enabled):
```json
{
  "requiresTwoFactor": true,
  "userId": "user_id",
  "method": "sms"
}
```

Response (if successful):
```json
{
  "message": "Login successful",
  "token": "jwt_token",
  "sessionId": "session_id",
  "user": { ... }
}
```

#### Verify 2FA Code
```
POST /api/auth/verify-2fa
Body: {
  userId: string,
  code: "000000"
}
```

#### Enable 2FA
```
POST /api/auth/enable-2fa
Body: {
  userId: string,
  method: "sms" | "email" | "authenticator"
}
```

Response:
```json
{
  "message": "2FA enabled successfully",
  "backupCodes": ["code1", "code2", ...]
}
```

#### Disable 2FA
```
POST /api/auth/disable-2fa
Body: {
  userId: string,
  password: string
}
```

#### Get Active Sessions
```
GET /api/auth/sessions/:userId
```

Response:
```json
{
  "sessions": [
    {
      "_id": "session_id",
      "deviceName": "Chrome on Windows",
      "deviceOS": "Windows",
      "ipAddress": "192.168.1.1",
      "createdAt": "2026-04-19T10:00:00Z",
      "lastActivity": "2026-04-19T10:30:00Z"
    }
  ]
}
```

#### Logout from Device
```
DELETE /api/auth/sessions/:sessionId
```

#### Logout from All Devices
```
POST /api/auth/logout
```

---

## Frontend Components

### 1. LoginPageV3
Located at: `client/src/pages/LoginPageV3.js`

Features:
- Enhanced login form with improved UX
- 2FA code verification
- Remember me functionality
- Account lockout protection
- Real-time validation

Usage:
```javascript
import LoginPageV3 from "./pages/LoginPageV3";

<Route path="/login" element={<LoginPageV3 setUser={setUser} />} />
```

### 2. SignupPageV3
Located at: `client/src/pages/SignupPageV3.js`

Features:
- Multi-step signup process (5 steps)
- Role selection (farmer, vendor, buyer, analyst)
- Terms and conditions acceptance
- Data consent management
- Real-time username/email availability check

Steps:
1. Role Selection
2. Basic Information (Name, Username, Email)
3. Contact & Security (Phone, Password)
4. Farm/Business Information (Farm Type, Location)
5. Review & Confirm

Usage:
```javascript
import SignupPageV3 from "./pages/SignupPageV3";

<Route path="/signup" element={<SignupPageV3 setUser={setUser} />} />
```

### 3. TwoFactorSetup
Located at: `client/src/components/TwoFactorSetup.js`

A component for enabling and managing 2FA settings.

Usage:
```javascript
import TwoFactorSetup from "./components/TwoFactorSetup";

<TwoFactorSetup userId={user._id} />
```

---

## API Service Methods

### Updated API Methods

Located at: `client/src/services/api.js`

```javascript
// V3.0 Authentication
authAPI.signupV3(data)           // Sign up with role
authAPI.loginV3(data)            // Login with 2FA support
authAPI.verify2FA(data)          // Verify 2FA code
authAPI.enable2FA(userId, method) // Enable 2FA
authAPI.disable2FA(userId, password) // Disable 2FA
authAPI.getSessions(userId)      // Get active sessions
authAPI.logoutDevice(sessionId)  // Logout from device
authAPI.logout()                 // Logout from all devices
```

---

## Middleware

### Authentication Middleware V3.0
Located at: `backend/middleware/authMiddlewareV3.js`

Usage in routes:
```javascript
const { 
  authMiddleware, 
  roleMiddleware, 
  permissionMiddleware,
  check2FAEnabled 
} = require("../middleware/authMiddlewareV3");

// Protected route (any authenticated user)
router.get("/profile", authMiddleware, (req, res) => {
  // req.user contains user info
});

// Role-based access
router.post("/moderate", 
  authMiddleware, 
  roleMiddleware(["admin", "moderator"]),
  (req, res) => { ... }
);

// Permission-based access
router.post("/posts", 
  authMiddleware,
  permissionMiddleware("post.create"),
  (req, res) => { ... }
);

// Require 2FA
router.delete("/account", 
  authMiddleware,
  check2FAEnabled,
  (req, res) => { ... }
);
```

---

## Database Models

### User Model
```javascript
{
  // Basic Info
  name: String,
  username: String (unique),
  email: String,
  phone: String (unique),
  password: String (hashed),
  
  // V3.0 Role System
  role: String (farmer|vendor|buyer|admin|moderator|analyst),
  roles: [String],
  permissions: [String],
  
  // V3.0 Organization
  organizationId: ObjectId,
  organizationRole: String,
  teamId: ObjectId,
  
  // Verification
  phoneVerified: Boolean,
  emailVerified: Boolean,
  verifiedAt: Date,
  
  // Account Security
  accountLocked: Boolean,
  accountLockedUntil: Date,
  suspiciousActivityFlag: Boolean,
  
  // 2FA
  twoFactorEnabled: Boolean,
  twoFactorMethod: String,
  twoFactorSecret: String,
  twoFactorBackupCodes: [String],
  
  // Sessions
  activeSessions: [ObjectId],
  lastLogin: Date,
  totalLogins: Number,
  
  // Status
  status: String (active|inactive|suspended|deleted),
  suspensionReason: String,
  suspendedAt: Date,
  
  // Preferences
  language: String (default: "en"),
  timezone: String (default: "UTC"),
  notificationPreferences: {
    email: Boolean,
    sms: Boolean,
    push: Boolean
  },
  privacySettings: {
    profileVisibility: String,
    showEmail: Boolean,
    showPhone: Boolean
  },
  
  // Compliance
  termsAcceptedAt: Date,
  privacyAcceptedAt: Date,
  dataConsent: Boolean,
  
  // Analytics
  lastActivityAt: Date,
  
  // Farm/Business Info
  farmType: String,
  farmName: String,
  location: String,
  crops: String
}
```

### Session Model
```javascript
{
  userId: ObjectId (ref: User),
  token: String (unique),
  
  // Device Info
  deviceId: String,
  deviceName: String,
  deviceType: String (mobile|tablet|desktop),
  deviceOS: String,
  deviceBrowser: String,
  userAgent: String,
  
  // Network
  ipAddress: String,
  lastActivity: Date,
  
  // Status
  isActive: Boolean,
  isSecure: Boolean,
  isMobile: Boolean,
  
  // Timestamps
  createdAt: Date,
  updatedAt: Date,
  expiresAt: Date
}
```

---

## Security Features

### Account Protection
1. **Login Attempt Limiting**: Max 5 failed attempts → 30-minute lockout
2. **Account Suspension**: Admin capability to suspend accounts
3. **Device Tracking**: All active devices are tracked and can be remotely logged out
4. **Session Expiration**: Sessions automatically expire after 7-30 days

### 2FA Protection
1. **Multiple Methods**: SMS, Email, Authenticator Apps
2. **Backup Codes**: 10 backup codes for account recovery
3. **Time-Limited Codes**: OTP codes expire after 5 minutes
4. **Attempt Limiting**: Max 3 failed 2FA attempts

### Data Security
1. **Password Hashing**: BCrypt with 10 salt rounds
2. **JWT Tokens**: Signed with secret key, 7-30 day expiration
3. **HTTPS Only**: Secure flag on all security-related operations
4. **Rate Limiting**: 100 requests per 15 minutes per user

### Audit & Compliance
1. **Activity Logging**: All authentication events logged
2. **Compliance Tracking**: Terms and Privacy Policy acceptance tracking
3. **Data Consent**: Optional data collection consent
4. **Export Ready**: User data can be exported for compliance

---

## Implementation Checklist

### Backend Setup
- [x] Update User model with V3.0 fields
- [x] Create Session model
- [x] Create device utility functions
- [x] Create V3.0 auth routes
- [x] Create authentication middleware V3.0
- [ ] Configure environment variables
- [ ] Set up MongoDB indexes
- [ ] Set up logging/monitoring

### Frontend Setup
- [x] Create LoginPageV3
- [x] Create SignupPageV3
- [x] Create TwoFactorSetup component
- [x] Update API service
- [x] Update App.js routing
- [ ] Add device management page
- [ ] Add security settings page
- [ ] Add activity log viewer

### Testing
- [ ] Test signup with role selection
- [ ] Test login with 2FA
- [ ] Test session management
- [ ] Test account suspension
- [ ] Test device tracking
- [ ] Test backup codes
- [ ] Test rate limiting
- [ ] Test CORS and security headers

---

## Migration Guide (Existing Users)

If you're upgrading from V2.0, existing users need to:

1. **Role Assignment**: Default role = "farmer" for existing users
2. **2FA Optional**: Users can enable 2FA in settings (disabled by default)
3. **Session Migration**: New sessions created on next login
4. **Backward Compatibility**: Old login/signup endpoints still work

---

## Environment Variables

Add these to your `.env` file:

```env
# Authentication
JWT_SECRET=your-super-secret-key-change-in-production
JWT_EXPIRE=30d

# Session
SESSION_TIMEOUT_MINUTES=1440

# Security
MAX_LOGIN_ATTEMPTS=5
LOGIN_LOCKOUT_MINUTES=30
ALLOWED_ORIGIN=https://farmsocial.com

# 2FA
TWO_FA_ATTEMPTS=3
TWO_FA_TIMEOUT_MINUTES=5

# Database
MONGODB_URI=mongodb://localhost:27017/farmsocial
```

---

## Troubleshooting

### "2FA code expired"
- User needs to request a new code
- Default expiration: 5 minutes

### "Account locked"
- Account locks after 5 failed login attempts
- Automatic unlock: 30 minutes
- Admin can force unlock

### "Session expired"
- Sessions expire after 7 days (or 30 days with "Remember Me")
- User needs to login again
- Device sessions are tracked separately

### "Role not found"
- Ensure user's role is in: ["farmer", "vendor", "buyer", "admin", "moderator", "analyst"]
- Check user.roles array

---

## Future Enhancements (Roadmap)

- [ ] Biometric authentication (fingerprint, face ID)
- [ ] Single Sign-On (SSO) with Google, Microsoft
- [ ] Risk-based authentication
- [ ] Passwordless authentication
- [ ] FIDO2/WebAuthn support
- [ ] Hardware security key support
- [ ] Multi-region session management
- [ ] Real-time fraud detection
- [ ] Behavior-based anomaly detection

---

## Support & Documentation

For more information:
- Email: support@farmsocial.com
- Docs: https://docs.farmsocial.com
- Issues: https://github.com/farmsocial/issues
