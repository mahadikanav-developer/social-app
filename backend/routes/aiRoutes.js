const express = require("express");
const router = express.Router();
const axios = require("axios");
const multer = require("multer");
const FormData = require("form-data");
const Post = require("../models/postModal");

// Configure multer for file uploads
const upload = multer({
  dest: 'uploads/',
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  }
});

// Helper: clean input
const normalize = (text) => text.toLowerCase().trim();

// AI Service base URL
const AI_SERVICE_URL = process.env.AI_SERVICE_URL || "http://127.0.0.1:5001";

// AI / Search endpoint
router.post("/ask", async (req, res) => {
  const { message } = req.body;

  if (!message) {
    return res.status(400).json({ error: "Message required" });
  }

  const cleanMessage = normalize(message);

  try {
    // 🔥 1. SMART SEARCH (better matching)
    const keywords = cleanMessage.split(" ");

    const posts = await Post.find({
      $or: keywords.map(word => ({
        text: { $regex: word, $options: "i" }
      }))
    }).limit(5);

    if (posts.length > 0) {
      return res.json({
        source: "community",
        reply:
          "👨‍🌾 Farmers say:\n\n" +
          posts.map((p, i) => `${i + 1}. ${p.text}`).join("\n")
      });
    }

    // 🤖 2. AI FALLBACK
    const aiRes = await axios.post(
      `${AI_SERVICE_URL}/api/ai/chat`,
      { message: cleanMessage },
      { timeout: 5000 }
    );

    return res.json({
      source: "ai",
      reply: aiRes.data.reply || "No response from AI"
    });

  } catch (err) {
    console.error("AI ROUTE ERROR:", err.message);

    // ⚠️ FINAL FALLBACK (VERY IMPORTANT)
    return res.json({
      source: "fallback",
      reply:
        "⚠️ I couldn't find a strong answer. Try adding crop name + problem (e.g., 'tomato yellow leaves')."
    });
  }
});

// Disease Detection
router.post("/disease-detection", upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "Image file required" });
    }

    // Forward to AI service
    const formData = new FormData();
    formData.append('image', req.file.buffer, {
      filename: req.file.originalname,
      contentType: req.file.mimetype
    });

    const aiRes = await axios.post(
      `${AI_SERVICE_URL}/api/ai/disease-detection`,
      formData,
      {
        headers: { 'Content-Type': 'multipart/form-data' },
        timeout: 30000
      }
    );

    res.json(aiRes.data);

  } catch (err) {
    console.error("Disease detection error:", err.message);
    res.status(500).json({ error: "Disease detection failed" });
  }
});

// Weather Forecast
router.get("/weather-forecast", async (req, res) => {
  try {
    const { lat, lon, days } = req.query;

    if (!lat || !lon) {
      return res.status(400).json({ error: "Latitude and longitude required" });
    }

    const aiRes = await axios.get(
      `${AI_SERVICE_URL}/api/ai/weather-forecast`,
      {
        params: { lat, lon, days },
        timeout: 10000
      }
    );

    res.json(aiRes.data);

  } catch (err) {
    console.error("Weather forecast error:", err.message);
    res.status(500).json({ error: "Weather forecast failed" });
  }
});

// Soil Analysis
router.post("/soil-analysis", async (req, res) => {
  try {
    const { ph, nitrogen, phosphorus, potassium } = req.body;

    if (!ph || !nitrogen || !phosphorus || !potassium) {
      return res.status(400).json({ error: "All soil parameters required" });
    }

    const aiRes = await axios.post(
      `${AI_SERVICE_URL}/api/ai/soil-analysis`,
      { ph, nitrogen, phosphorus, potassium },
      { timeout: 10000 }
    );

    res.json(aiRes.data);

  } catch (err) {
    console.error("Soil analysis error:", err.message);
    res.status(500).json({ error: "Soil analysis failed" });
  }
});

// Yield Prediction
router.post("/yield-prediction", async (req, res) => {
  try {
    const aiRes = await axios.post(
      `${AI_SERVICE_URL}/api/ai/yield-prediction`,
      req.body,
      { timeout: 10000 }
    );

    res.json(aiRes.data);

  } catch (err) {
    console.error("Yield prediction error:", err.message);
    res.status(500).json({ error: "Yield prediction failed" });
  }
});

// Market Prices
router.get("/market-prices/:crop", async (req, res) => {
  try {
    const { crop } = req.params;
    const { location } = req.query;

    const aiRes = await axios.get(
      `${AI_SERVICE_URL}/api/ai/market-prices/${crop}`,
      {
        params: { location },
        timeout: 10000
      }
    );

    res.json(aiRes.data);

  } catch (err) {
    console.error("Market prices error:", err.message);
    res.status(500).json({ error: "Market data retrieval failed" });
  }
});

// Farm Recommendations
router.post("/farm-recommendations", async (req, res) => {
  try {
    const aiRes = await axios.post(
      `${AI_SERVICE_URL}/api/ai/farm-recommendations`,
      req.body,
      { timeout: 10000 }
    );

    res.json(aiRes.data);

  } catch (err) {
    console.error("Farm recommendations error:", err.message);
    res.status(500).json({ error: "Recommendation generation failed" });
  }
});

// Pest Identification
router.post("/pest-identification", upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "Image file required" });
    }

    const formData = new FormData();
    formData.append('image', req.file.buffer, {
      filename: req.file.originalname,
      contentType: req.file.mimetype
    });

    const aiRes = await axios.post(
      `${AI_SERVICE_URL}/api/ai/pest-identification`,
      formData,
      {
        headers: { 'Content-Type': 'multipart/form-data' },
        timeout: 30000
      }
    );

    res.json(aiRes.data);

  } catch (err) {
    console.error("Pest identification error:", err.message);
    res.status(500).json({ error: "Pest identification failed" });
  }
});

// Weed Detection
router.post("/weed-detection", upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "Image file required" });
    }

    const formData = new FormData();
    formData.append('image', req.file.buffer, {
      filename: req.file.originalname,
      contentType: req.file.mimetype
    });

    const aiRes = await axios.post(
      `${AI_SERVICE_URL}/api/ai/weed-detection`,
      formData,
      {
        headers: { 'Content-Type': 'multipart/form-data' },
        timeout: 30000
      }
    );

    res.json(aiRes.data);

  } catch (err) {
    console.error("Weed detection error:", err.message);
    res.status(500).json({ error: "Weed detection failed" });
  }
});

// Crop Calendar
router.get("/crop-calendar", async (req, res) => {
  try {
    const aiRes = await axios.get(
      `${AI_SERVICE_URL}/api/ai/crop-calendar`,
      {
        params: req.query,
        timeout: 10000
      }
    );

    res.json(aiRes.data);

  } catch (err) {
    console.error("Crop calendar error:", err.message);
    res.status(500).json({ error: "Calendar generation failed" });
  }
});

// AI Service Health Check
router.get("/health", async (req, res) => {
  try {
    const aiRes = await axios.get(
      `${AI_SERVICE_URL}/api/ai/health`,
      { timeout: 5000 }
    );

    res.json({
      backend: "healthy",
      ai_service: aiRes.data
    });

  } catch (err) {
    res.json({
      backend: "healthy",
      ai_service: {
        status: "unavailable",
        error: err.message
      }
    });
  }
});

// ===== V2.0 AI FEATURES =====

// Generate Social Media Captions
router.post("/generate-caption", async (req, res) => {
  try {
    const aiRes = await axios.post(
      `${AI_SERVICE_URL}/api/ai/generate-caption`,
      req.body,
      { timeout: 10000 }
    );

    res.json(aiRes.data);

  } catch (err) {
    console.error("Caption generation error:", err.message);
    res.status(500).json({ error: "Caption generation failed" });
  }
});

// Translate Content
router.post("/translate", async (req, res) => {
  try {
    const aiRes = await axios.post(
      `${AI_SERVICE_URL}/api/ai/translate`,
      req.body,
      { timeout: 10000 }
    );

    res.json(aiRes.data);

  } catch (err) {
    console.error("Translation error:", err.message);
    res.status(500).json({ error: "Translation failed" });
  }
});

// ===== V3.0 ADVANCED AI FEATURES =====

// Personalized Recommendations
router.post("/personalized-recommendations", async (req, res) => {
  try {
    const aiRes = await axios.post(
      `${AI_SERVICE_URL}/api/ai/personalized-recommendations`,
      req.body,
      { timeout: 15000 }
    );

    res.json(aiRes.data);

  } catch (err) {
    console.error("Personalized recommendations error:", err.message);
    res.status(500).json({ error: "Personalized recommendations failed" });
  }
});

// Farm Optimization
router.post("/optimize-farm", async (req, res) => {
  try {
    const aiRes = await axios.post(
      `${AI_SERVICE_URL}/api/ai/optimize-farm`,
      req.body,
      { timeout: 15000 }
    );

    res.json(aiRes.data);

  } catch (err) {
    console.error("Farm optimization error:", err.message);
    res.status(500).json({ error: "Farm optimization failed" });
  }
});

// Farm Analytics
router.post("/farm-analytics", async (req, res) => {
  try {
    const aiRes = await axios.post(
      `${AI_SERVICE_URL}/api/ai/farm-analytics`,
      req.body,
      { timeout: 15000 }
    );

    res.json(aiRes.data);

  } catch (err) {
    console.error("Farm analytics error:", err.message);
    res.status(500).json({ error: "Farm analytics failed" });
  }
});

// Anomaly Detection
router.post("/detect-anomalies", async (req, res) => {
  try {
    const aiRes = await axios.post(
      `${AI_SERVICE_URL}/api/ai/detect-anomalies`,
      req.body,
      { timeout: 10000 }
    );

    res.json(aiRes.data);

  } catch (err) {
    console.error("Anomaly detection error:", err.message);
    res.status(500).json({ error: "Anomaly detection failed" });
  }
});

// Scenario Simulation
router.post("/scenario-simulation", async (req, res) => {
  try {
    const aiRes = await axios.post(
      `${AI_SERVICE_URL}/api/ai/scenario-simulation`,
      req.body,
      { timeout: 15000 }
    );

    res.json(aiRes.data);

  } catch (err) {
    console.error("Scenario simulation error:", err.message);
    res.status(500).json({ error: "Scenario simulation failed" });
  }
});

// Planning Tools
router.post("/planning-tools", async (req, res) => {
  try {
    const aiRes = await axios.post(
      `${AI_SERVICE_URL}/api/ai/planning-tools`,
      req.body,
      { timeout: 15000 }
    );

    res.json(aiRes.data);

  } catch (err) {
    console.error("Planning tools error:", err.message);
    res.status(500).json({ error: "Planning tools failed" });
  }
});

// Content Moderation
router.post("/moderate-content", async (req, res) => {
  try {
    const aiRes = await axios.post(
      `${AI_SERVICE_URL}/api/ai/moderate-content`,
      req.body,
      { timeout: 10000 }
    );

    res.json(aiRes.data);

  } catch (err) {
    console.error("Content moderation error:", err.message);
    res.status(500).json({ error: "Content moderation failed" });
  }
});

// ===== AI HISTORY AND PERSONALIZED SETTINGS =====

// Get AI History
router.get("/history/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const limit = req.query.limit || 20;

    const aiRes = await axios.get(
      `${AI_SERVICE_URL}/api/ai/history/${userId}`,
      {
        params: { limit },
        timeout: 10000
      }
    );

    res.json(aiRes.data);

  } catch (err) {
    console.error("AI history error:", err.message);
    res.status(500).json({ error: "AI history retrieval failed" });
  }
});

// Get/Update User Settings
router.route("/settings/:userId")
  .get(async (req, res) => {
    try {
      const { userId } = req.params;

      const aiRes = await axios.get(
        `${AI_SERVICE_URL}/api/ai/settings/${userId}`,
        { timeout: 10000 }
      );

      res.json(aiRes.data);

    } catch (err) {
      console.error("Get settings error:", err.message);
      res.status(500).json({ error: "Settings retrieval failed" });
    }
  })
  .post(async (req, res) => {
    try {
      const { userId } = req.params;

      const aiRes = await axios.post(
        `${AI_SERVICE_URL}/api/ai/settings/${userId}`,
        req.body,
        { timeout: 10000 }
      );

      res.json(aiRes.data);

    } catch (err) {
      console.error("Update settings error:", err.message);
      res.status(500).json({ error: "Settings update failed" });
    }
  });

module.exports = router;
