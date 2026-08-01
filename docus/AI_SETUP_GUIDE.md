# 🌾 FarmAI Complete Setup Guide

## Overview
FarmAI is a comprehensive AI platform with 19 features across 3 versions (V1.0, V2.0, V3.0) with personalized history and settings tracking.

---

## ✅ What's Implemented

### **V1.0 - Core AI Features (10)**
- 💬 AI Chat with knowledge base
- 🦠 Crop disease detection
- 🌤️ Weather forecasting
- 🌱 Soil analysis & recommendations
- 📊 Yield prediction
- 💰 Market price analysis
- 🎯 Farm recommendations
- 🐛 Pest identification
- 🌿 Weed detection
- 📅 Crop calendar

### **V2.0 - Social Features (2)**
- 📝 Social media caption generation
- 🌐 Multi-language translation (English → Hindi/Spanish)

### **V3.0 - Advanced Features (7)**
- 🎲 Personalized recommendations
- 📈 Farm optimization
- 📊 Farm analytics & KPIs
- 🚨 Anomaly detection
- 🎮 Scenario simulation
- 📋 Planning & budgeting tools
- 🛡️ Content moderation

### **User-Centric Features (2)**
- 📜 AI interaction history tracking
- ⚙️ Personalized user settings

---

## 📋 Quick Start

### **1. Install Dependencies**

#### Python AI Service
```bash
cd /home/am/Desktop/project/ai
pip install -r requirements.txt
```

#### Node.js Backend
```bash
cd /home/am/Desktop/project/backend
npm install
```

#### Frontend (if needed)
```bash
cd /home/am/Desktop/project/client
npm install
```

### **2. Start Services**

#### Terminal 1: AI Service (Port 5001)
```bash
cd /home/am/Desktop/project/ai
python3 app.py
```

Expected output:
```
🌾 FarmAI Service v3.0 - Starting...
🚀 Starting server on port 5001...
```

#### Terminal 2: Backend (Port 5000)
```bash
cd /home/am/Desktop/project/backend
npm start
```

Expected output:
```
Server running on: http://localhost:5000
MongoDB Connected
```

### **3. Test the App**

#### Option A: Use HTML Test App (Easiest)
```bash
# Open in browser
/home/am/Desktop/project/ai_test_app.html
```

Or copy the file URL and paste in browser.

#### Option B: Use curl
```bash
# Health check
curl http://localhost:5001/api/ai/health

# Chat with personalization
curl -X POST http://localhost:5001/api/ai/chat \
  -H "Content-Type: application/json" \
  -d '{"message":"what should I grow?","user_id":"farmer_1"}'

# Get user history
curl http://localhost:5001/api/ai/history/farmer_1

# Get user settings
curl http://localhost:5001/api/ai/settings/farmer_1

# Update settings
curl -X POST http://localhost:5001/api/ai/settings/farmer_1 \
  -H "Content-Type: application/json" \
  -d '{"language":"hindi","experience_level":"beginner"}'
```

---

## 🎯 API Endpoints

### **Base URL**: `http://localhost:5001/api/ai`

### **Chat & General**
```
POST /chat
  Input: { message, user_id? }
  Output: { reply }
  
GET /health
  Output: { status, version, total_features, features: {...} }
```

### **History & Settings**
```
GET /history/{user_id}?limit=20
  Output: { history: [...], total_interactions, features_used }
  
GET /settings/{user_id}
  Output: { language, experience_level, location, units, ... }
  
POST /settings/{user_id}
  Input: { language, experience_level, location, units, ... }
  Output: { status, settings }
```

### **V1.0 Features**
```
POST /disease-detection
  Input: { image (multipart) }
  Output: { disease, confidence, severity, treatment, prevention }

GET /weather-forecast?lat=28.7&lon=77.1&days=7
  Output: { forecast: [...], insights: [...] }

POST /soil-analysis
  Input: { ph, nitrogen, phosphorus, potassium }
  Output: { health_score, nutrient_levels, recommendations }

POST /yield-prediction
  Input: { crop_type, area, temperature, rainfall, soil_ph, nitrogen, phosphorus, potassium }
  Output: { predicted_yield, confidence_range, factors }

GET /market-prices?crop=wheat
  Output: { current_price, trend, forecast }

POST /farm-recommendations
  Input: { user_profile: {...} }
  Output: { crop_suggestions, optimization_tips, risk_assessment }
```

### **V2.0 Features**
```
POST /generate-caption
  Input: { topic, achievement?, hashtags? }
  Output: { caption, hashtags, engagement_tips }

POST /translate
  Input: { text, target_language, source_language? }
  Output: { original_text, translated_text, source_language, target_language }
```

### **V3.0 Features**
```
POST /personalized-recommendations
  Input: { user_profile: {...} }
  Output: { content_recommendations, crop_suggestions, product_recommendations, people_to_follow, learning_path }

POST /optimize-farm
  Input: { crop_type, soil_type, location, ... }
  Output: { irrigation_schedule, fertilizer_plan, planting_schedule, cost_savings, yield_improvements }

POST /farm-analytics
  Input: { farm_data, time_period? }
  Output: { kpi_summary, trends_analysis, benchmarking, insights, recommendations }

POST /detect-anomalies
  Input: { sensor_data, farm_data }
  Output: { detected_anomalies, risk_assessment, early_warnings, preventive_actions }

POST /scenario-simulation
  Input: { baseline_data, scenario_changes }
  Output: { baseline_projection, scenario_results, risk_analysis, recommendations }

POST /planning-tools
  Input: { farm_profile, planning_type? }
  Output: { crop_planning, resource_planning, timeline, risk_mitigation }

POST /moderate-content
  Input: { content, content_type? }
  Output: { content_score, toxicity_level, spam_probability, compliance_status, moderation_action }
```

---

## 📊 Personalization System

### **User Settings**
```json
{
  "language": "english|hindi|spanish",
  "experience_level": "beginner|intermediate|advanced",
  "location": "location string",
  "units": "metric|imperial",
  "detail_level": "brief|standard|detailed",
  "notifications": true|false,
  "preferred_crops": ["crop1", "crop2"],
  "interests": ["organic_farming", "precision_farming", ...]
}
```

### **How Personalization Works**
1. **Language**: Responses can be translated
2. **Experience Level**: 
   - Beginner: Simplified advice + tips
   - Intermediate: Balanced detail
   - Advanced: Technical insights + recommendations
3. **Location**: Regionally relevant suggestions
4. **Detail Level**: Control response length
5. **History Tracking**: AI learns from interaction history

---

## 🔍 Testing Features

### **Using the Test App**
1. Enter a User ID
2. Type questions in the chat box
3. Use "Quick Features" buttons to test specific AI features
4. Modify settings to see personalization changes
5. Check history to see saved interactions

### **Example Test Scenarios**

#### Beginner Farmer in India
```
User ID: farmer_india_1
Settings: beginner, location: India, language: hindi
Query: "tomato leaves turning yellow"
Expected: Detailed beginner explanation + tips
```

#### Advanced Farmer in Punjab
```
User ID: farmer_punjab_pro
Settings: advanced, location: Punjab, language: english
Query: "optimize my irrigation"
Expected: Complex technical optimization plan + IoT recommendations
```

#### Market Trader
```
User ID: trader_market
Settings: intermediate, interests: market analysis
Query: "what are wheat prices?"
Expected: Price trends + buy/sell recommendations
```

---

## 🐛 Troubleshooting

### AI Service Won't Start
```bash
# Check Python installation
python3 --version

# Check if port 5001 is in use
lsof -i :5001

# Kill process using port
lsof -ti:5001 | xargs kill -9
```

### Backend Won't Start
```bash
# Check Node installation
node --version

# Check if port 5000 is in use
lsof -i :5000

# Kill process using port
lsof -ti:5000 | xargs kill -9
```

### CORS Errors
- AI Service has CORS enabled for all origins
- Backend handles proxy requests
- Test app uses direct API calls

### No Response from AI Service
```bash
# Test health endpoint
curl http://localhost:5001/api/ai/health

# Check service is running
ps aux | grep python3 | grep app.py
```

---

## 📝 Development Notes

### **Architecture**
- **AI Service** (Python/Flask): Port 5001 - Core AI logic
- **Backend** (Node/Express): Port 5000 - API proxy & business logic
- **Frontend** (React): Port 3000 - User interface (optional)
- **Test App** (HTML): Direct API calls for testing

### **Data Flow**
```
Frontend → Backend (Port 5000) → AI Service (Port 5001)
                  ↓
           Proxy & Format Response
                  ↓
           Return to Frontend
```

### **User History Storage**
- In-memory: Keeps last 100 interactions per user
- For production: Replace with database (MongoDB/PostgreSQL)

### **Personalization Storage**
- In-memory: Default settings per user
- For production: Save to user's profile in MongoDB

---

## 🚀 Next Steps

### Production Deployment
1. Replace Flask with production server (Gunicorn)
2. Use environment variables for secrets
3. Implement actual ML models
4. Set up real database for history & settings
5. Add authentication & authorization
6. Deploy with Docker

### Production ML Models
Currently using mock implementations. Replace with:
- TensorFlow/PyTorch for disease detection
- Real weather APIs (OpenWeatherMap)
- Market data APIs
- NLP for caption generation
- ML models for predictions

### Database Integration
```python
# Example: MongoDB
from pymongo import MongoClient
client = MongoClient('mongodb://localhost:27017')
db = client['farmsocial']
user_history = db['ai_history']
user_settings = db['ai_settings']
```

---

## 📞 Support

For issues or questions, check:
1. Terminal output for error messages
2. Browser console for frontend errors
3. Health endpoint: `GET /api/ai/health`
4. Test individual endpoints with curl

---

**Version**: 3.0  
**Features**: 19 (10 V1.0 + 2 V2.0 + 7 V3.0)  
**Last Updated**: May 2, 2026
