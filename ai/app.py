from flask import Flask
from flask_cors import CORS
from routes.ai_routes import ai_bp

app = Flask(__name__)

# Enable CORS for all routes - allow all origins for testing
CORS(app, resources={
    r"/api/ai/*": {
        "origins": ["*"],
        "methods": ["GET", "POST", "OPTIONS"],
        "allow_headers": ["Content-Type"]
    }
})

# Register blueprints
app.register_blueprint(ai_bp, url_prefix='/api/ai')

if __name__ == "__main__":
    print("\n" + "="*60)
    print("🌾 FarmAI Service v3.0 - Starting...")
    print("="*60)
    print("\n📍 Server: http://0.0.0.0:5001")
    print("\n✅ V1.0 CORE FEATURES (10 endpoints):")
    print("  POST /api/ai/chat - 💬 AI Chat with personalization")
    print("  POST /api/ai/disease-detection - 🦠 Crop disease detection")
    print("  GET  /api/ai/weather-forecast - 🌤️ Weather forecasting")
    print("  POST /api/ai/soil-analysis - 🌱 Soil analysis & recommendations")
    print("  POST /api/ai/yield-prediction - 📊 Yield prediction")
    print("  GET  /api/ai/market-prices - 💰 Market price trends")
    print("  POST /api/ai/farm-recommendations - 🎯 Farm recommendations")
    print("  POST /api/ai/pest-identification - 🐛 Pest identification")
    print("  POST /api/ai/weed-detection - 🌿 Weed detection")
    print("  GET  /api/ai/crop-calendar - 📅 Crop calendar")
    
    print("\n✅ V2.0 SOCIAL FEATURES (2 endpoints):")
    print("  POST /api/ai/generate-caption - 📝 Social media captions")
    print("  POST /api/ai/translate - 🌐 Multi-language translation")
    
    print("\n✅ V3.0 ADVANCED FEATURES (7 endpoints):")
    print("  POST /api/ai/personalized-recommendations - 🎲 Personalized recommendations")
    print("  POST /api/ai/optimize-farm - 📈 Farm optimization")
    print("  POST /api/ai/farm-analytics - 📊 Farm analytics & KPIs")
    print("  POST /api/ai/detect-anomalies - 🚨 Anomaly detection")
    print("  POST /api/ai/scenario-simulation - 🎮 Scenario simulation")
    print("  POST /api/ai/planning-tools - 📋 Planning tools")
    print("  POST /api/ai/moderate-content - 🛡️ Content moderation")
    
    print("\n✅ USER FEATURES (2 endpoints):")
    print("  GET  /api/ai/history/<user_id> - 📜 AI interaction history")
    print("  GET/POST /api/ai/settings/<user_id> - ⚙️ Personalized settings")
    
    print("\n✅ UTILITY (1 endpoint):")
    print("  GET  /api/ai/health - ✅ Service health check")
    
    print("\n" + "="*60)
    print("🚀 Starting server on port 5001...")
    print("="*60 + "\n")
    
    app.run(debug=True, host='0.0.0.0', port=5001)