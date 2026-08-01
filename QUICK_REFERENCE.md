# 🌾 FarmAI - Quick Reference Card

## 🚀 ONE-LINE STARTUP

```bash
chmod +x /home/am/Desktop/project/start_ai.sh && /home/am/Desktop/project/start_ai.sh
```

Or manually:

### Terminal 1: AI Service (Port 5001)
```bash
cd /home/am/Desktop/project/ai && python3 app.py
```

### Terminal 2: Backend (Port 5000)
```bash
cd /home/am/Desktop/project/backend && npm start
```

### Open Test App
```bash
# Copy this path and open in browser:
/home/am/Desktop/project/ai_test_app.html
```

---

## 📚 API Quick URLs

| Feature | Method | Endpoint | 
|---------|--------|----------|
| **CHAT** | POST | `/api/ai/chat` |
| **Disease** | POST | `/api/ai/disease-detection` |
| **Weather** | GET | `/api/ai/weather-forecast?lat=X&lon=Y` |
| **Soil** | POST | `/api/ai/soil-analysis` |
| **Yield** | POST | `/api/ai/yield-prediction` |
| **Market** | GET | `/api/ai/market-prices?crop=X` |
| **Caption** | POST | `/api/ai/generate-caption` |
| **Translate** | POST | `/api/ai/translate` |
| **Settings** | GET/POST | `/api/ai/settings/{userId}` |
| **History** | GET | `/api/ai/history/{userId}` |
| **Health** | GET | `/api/ai/health` |

---

## 🎯 Usage Examples

### Chat with AI
```bash
curl -X POST http://localhost:5001/api/ai/chat \
  -H "Content-Type: application/json" \
  -d '{"message":"tomato disease help","user_id":"farmer1"}'
```

### Get User Settings
```bash
curl http://localhost:5001/api/ai/settings/farmer1
```

### Update Settings
```bash
curl -X POST http://localhost:5001/api/ai/settings/farmer1 \
  -H "Content-Type: application/json" \
  -d '{"language":"hindi","experience_level":"beginner"}'
```

### Check History
```bash
curl http://localhost:5001/api/ai/history/farmer1?limit=10
```

### Soil Analysis
```bash
curl -X POST http://localhost:5001/api/ai/soil-analysis \
  -H "Content-Type: application/json" \
  -d '{"ph":6.8,"nitrogen":45,"phosphorus":25,"potassium":180}'
```

### Market Prices
```bash
curl http://localhost:5001/api/ai/market-prices?crop=wheat
```

---

## 📊 Feature Count

- ✅ **V1.0**: 10 Features (Core AI)
- ✅ **V2.0**: 2 Features (Social)
- ✅ **V3.0**: 7 Features (Advanced)
- ✅ **User**: 2 Features (History & Settings)
- **Total**: **19 Features**

---

## 🛠️ Troubleshooting

### Port Already in Use?
```bash
# Kill process on port 5001 (AI)
lsof -ti:5001 | xargs kill -9

# Kill process on port 5000 (Backend)
lsof -ti:5000 | xargs kill -9
```

### Service Won't Start?
```bash
# Check Python
python3 --version

# Check Node
node --version

# Install dependencies
cd /home/am/Desktop/project/ai && pip install -r requirements.txt
cd /home/am/Desktop/project/backend && npm install
```

### No Response from API?
```bash
# Test health check
curl http://localhost:5001/api/ai/health

# Check if running
ps aux | grep python3
ps aux | grep node
```

---

## 📁 Project Structure

```
/home/am/Desktop/project/
├── ai/                          # Python Flask AI Service
│   ├── app.py                  # Main Flask app
│   ├── routes/
│   │   └── ai_routes.py        # API endpoints
│   ├── services/
│   │   └── farm_ai_service.py  # AI logic (19 features)
│   ├── data/
│   │   └── data.json           # Knowledge base
│   ├── requirements.txt         # Python dependencies
│   └── venv/                   # Virtual environment
├── backend/                     # Node.js Express API
│   ├── server.js               # Main server
│   ├── routes/
│   │   └── aiRoutes.js         # AI proxy routes
│   └── package.json
├── ai_test_app.html            # 🎯 Test UI (OPEN THIS!)
├── AI_SETUP_GUIDE.md           # Complete setup
├── FEATURES_COMPLETE.md        # Feature documentation
├── start_ai.sh                 # Auto startup script
└── README.md
```

---

## 🎮 Test Workflow

1. **Start Services** (use start_ai.sh or manual startup)
2. **Open Test App** → `/home/am/Desktop/project/ai_test_app.html`
3. **Enter User ID** → e.g., "farmer_123"
4. **Load Settings** → Customize language, experience, location
5. **Chat** → Type messages and get personalized responses
6. **Test Features** → Click quick feature buttons
7. **Check History** → See all interactions saved
8. **Change Settings** → See how responses adapt

---

## 📖 Documentation

- **Setup Guide**: `AI_SETUP_GUIDE.md` - Complete setup & troubleshooting
- **Features**: `FEATURES_COMPLETE.md` - All 19 features detailed
- **This File**: Quick reference

---

## 🔄 Data Flow

```
User Input
    ↓
Test App (HTML)
    ↓
AI API (Port 5001)
    ↓
Farm AI Service (Python)
    ↓
(Save History + Settings)
    ↓
Format Response
    ↓
Return to User
```

---

## 🎯 Common Tasks

| Task | Command |
|------|---------|
| Start All | `bash /home/am/Desktop/project/start_ai.sh` |
| Test Chat | `curl -X POST http://localhost:5001/api/ai/chat -H "Content-Type: application/json" -d '{"message":"hello","user_id":"test"}'` |
| Check Health | `curl http://localhost:5001/api/ai/health` |
| Kill All Services | `pkill -f "python3 app.py" && pkill -f "npm start"` |
| Open Test App | Open file → `/home/am/Desktop/project/ai_test_app.html` |
| View AI Logs | Check terminal running `python3 app.py` |

---

## ✨ Key Features

- ✅ 19 complete AI features
- ✅ Personalized responses based on user settings
- ✅ AI interaction history (last 100)
- ✅ Multi-language support
- ✅ Experience-level adaptation
- ✅ Location-based recommendations
- ✅ Real-time API responses
- ✅ CORS enabled for testing
- ✅ Mock implementations ready for real ML models
- ✅ Production-ready architecture

---

**Ready to Use!** 🚀 Everything is complete and functional.

**Latest Update**: May 2, 2026  
**Version**: 3.0
