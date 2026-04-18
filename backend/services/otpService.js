const crypto = require("crypto");
const bcrypt = require("bcryptjs");
const OTP = require("../models/otpModel");
const nodemailer = require("nodemailer");

// Initialize Twilio
let twilioClient = null;
try {
  if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
    const twilio = require("twilio");
    twilioClient = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
  }
} catch (err) {
  console.log("Twilio not initialized. SMS will be logged to console.");
}

// Initialize email service
const emailTransporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || "smtp.gmail.com",
  port: process.env.EMAIL_PORT || 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});

// Generate 6-digit OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Hash OTP for storage
const hashOTP = (otp) => {
  return bcrypt.hashSync(otp, 10);
};

// Compare OTP
const compareOTP = (otp, hash) => {
  return bcrypt.compareSync(otp, hash);
};

// Send OTP via Email
const sendOTPEmail = async (email, otp) => {
  try {
    await emailTransporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: "FarmSocial - Your Verification Code",
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; background: #F5F5F5; border-radius: 8px;">
          <h2 style="color: #FF1654;">🌾 FarmSocial Verification</h2>
          <p>Your verification code is:</p>
          <h1 style="color: #FF1654; letter-spacing: 5px; font-size: 32px; margin: 20px 0;">${otp}</h1>
          <p style="color: #666;">This code will expire in <strong>5 minutes</strong>.</p>
          <hr style="border: none; border-top: 1px solid #DDD; margin: 20px 0;">
          <p style="color: #999; font-size: 12px;">
            If you didn't request this, please ignore this email or contact support.
          </p>
        </div>
      `
    });
    console.log(`✅ OTP email sent to ${email}`);
    return true;
  } catch (err) {
    console.error("❌ Email send error:", err);
    return false;
  }
};

// Send OTP via SMS (Twilio)
const sendOTPSMS = async (phone, otp) => {
  try {
    // If Twilio is configured
    if (twilioClient) {
      await twilioClient.messages.create({
        body: `🌾 FarmSocial Verification Code: ${otp}. Valid for 5 minutes. Do not share with anyone.`,
        from: process.env.TWILIO_PHONE_NUMBER,
        to: phone
      });
      console.log(`✅ SMS OTP sent to ${phone}`);
      return true;
    } else {
      // Development mode: Log to console for testing
      console.log("════════════════════════════════════════");
      console.log(`📱 SMS OTP for ${phone}`);
      console.log(`🔐 CODE: ${otp}`);
      console.log(`⏰ Valid for 5 minutes`);
      console.log("════════════════════════════════════════");
      console.log("⚠️  Twilio not configured. Enable Twilio for production SMS.");
      return true;
    }
  } catch (err) {
    console.error("❌ SMS send error:", err);
    return false;
  }
};

// Create OTP
const createOTP = async (phoneOrEmail, type = "signup") => {
  try {
    // Delete old OTPs for this phone/email
    await OTP.deleteMany({
      $or: [
        { phone: phoneOrEmail },
        { email: phoneOrEmail }
      ]
    });

    const otp = generateOTP();
    const hashedOTP = hashOTP(otp);

    const isEmail = phoneOrEmail.includes("@");
    const otpDoc = await OTP.create({
      [isEmail ? "email" : "phone"]: phoneOrEmail,
      otp: hashedOTP,
      type,
      attempts: 0
    });

    // Send OTP
    if (isEmail) {
      await sendOTPEmail(phoneOrEmail, otp);
    } else {
      await sendOTPSMS(phoneOrEmail, otp);
    }

    return {
      success: true,
      message: `OTP sent to ${isEmail ? "email" : "phone"}`,
      expiresAt: otpDoc.expiresAt,
      type: isEmail ? "email" : "sms"
    };
  } catch (err) {
    console.error("Create OTP error:", err);
    return { success: false, message: "Failed to send OTP" };
  }
};

// Verify OTP
const verifyOTP = async (phoneOrEmail, otp, type = "signup") => {
  try {
    const isEmail = phoneOrEmail.includes("@");
    
    const otpDoc = await OTP.findOne({
      [isEmail ? "email" : "phone"]: phoneOrEmail,
      type: type
    });

    if (!otpDoc) {
      return { success: false, message: "OTP not found or expired" };
    }

    // Check if expired
    if (new Date() > otpDoc.expiresAt) {
      await OTP.deleteOne({ _id: otpDoc._id });
      return { success: false, message: "OTP expired. Please request a new one." };
    }

    // Check attempts
    if (otpDoc.attempts >= otpDoc.maxAttempts) {
      await OTP.deleteOne({ _id: otpDoc._id });
      return { success: false, message: "Max attempts reached. Request new OTP." };
    }

    // Verify OTP
    if (!compareOTP(otp, otpDoc.otp)) {
      otpDoc.attempts += 1;
      await otpDoc.save();
      return {
        success: false,
        message: `Wrong OTP. ${otpDoc.maxAttempts - otpDoc.attempts} attempts remaining.`
      };
    }

    // OTP is correct - mark as verified
    otpDoc.verified = true;
    await otpDoc.save();

    return { success: true, message: "OTP verified" };
  } catch (err) {
    console.error("Verify OTP error:", err);
    return { success: false, message: "Error verifying OTP" };
  }
};

// Get OTP for password reset (returns different object)
const requestPasswordResetOTP = async (phoneOrEmail) => {
  try {
    // Delete old OTPs
    await OTP.deleteMany({
      $or: [
        { phone: phoneOrEmail },
        { email: phoneOrEmail }
      ],
      type: "reset"
    });

    const otp = generateOTP();
    const hashedOTP = hashOTP(otp);

    const isEmail = phoneOrEmail.includes("@");
    await OTP.create({
      [isEmail ? "email" : "phone"]: phoneOrEmail,
      otp: hashedOTP,
      type: "reset"
    });

    // Send OTP
    if (isEmail) {
      await sendOTPEmail(phoneOrEmail, otp);
    } else {
      await sendOTPSMS(phoneOrEmail, otp);
    }

    return { success: true, message: "Reset OTP sent" };
  } catch (err) {
    console.error("Password reset OTP error:", err);
    return { success: false, message: "Failed to send reset OTP" };
  }
};

module.exports = {
  generateOTP,
  hashOTP,
  compareOTP,
  sendOTPEmail,
  sendOTPSMS,
  createOTP,
  verifyOTP,
  requestPasswordResetOTP
};
