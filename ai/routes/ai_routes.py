from flask import Blueprint, request, jsonify
from services.farm_ai_service import FarmAIService
import os
import tempfile
import random

ai_bp = Blueprint("ai", __name__)

# Initialize AI service
ai_service = FarmAIService()

@ai_bp.route("/chat", methods=["GET", "POST"])
def chat():
    # 👉 Handle GET (browser test)
    if request.method == "GET":
        return "✅ AI server is running. Use POST to chat."

    # 👉 Handle POST (real AI)
    data = request.get_json()
    message = data.get("message", "")
    user_id = data.get("user_id", None)  # Optional user ID for personalization

    if not message:
        return jsonify({"reply": "Message is required"}), 400

    reply = ai_service.get_ai_response(message, user_id=user_id)

    return jsonify({"reply": reply})

@ai_bp.route("/disease-detection", methods=["POST"])
def disease_detection():
    """Detect crop diseases from uploaded images"""
    try:
        if 'image' not in request.files:
            return jsonify({"error": "No image file provided"}), 400

        image_file = request.files['image']
        if image_file.filename == '':
            return jsonify({"error": "No image selected"}), 400

        # Save image temporarily
        with tempfile.NamedTemporaryFile(delete=False, suffix='.jpg') as temp_file:
            image_file.save(temp_file.name)
            temp_path = temp_file.name

        try:
            result = ai_service.detect_crop_disease(temp_path)
            return jsonify(result)
        finally:
            # Clean up temp file
            os.unlink(temp_path)

    except Exception as e:
        return jsonify({"error": f"Disease detection failed: {str(e)}"}), 500

@ai_bp.route("/weather-forecast", methods=["GET"])
def weather_forecast():
    """Get weather forecast for farming"""
    try:
        lat = request.args.get('lat', type=float)
        lon = request.args.get('lon', type=float)
        days = request.args.get('days', default=7, type=int)

        if not lat or not lon:
            return jsonify({"error": "Latitude and longitude required"}), 400

        result = ai_service.get_weather_forecast(lat, lon, days)
        return jsonify(result)

    except Exception as e:
        return jsonify({"error": f"Weather forecast failed: {str(e)}"}), 500

@ai_bp.route("/soil-analysis", methods=["POST"])
def soil_analysis():
    """Analyze soil health and provide recommendations"""
    try:
        data = request.get_json()

        ph = data.get('ph')
        nitrogen = data.get('nitrogen')
        phosphorus = data.get('phosphorus')
        potassium = data.get('potassium')

        if not all([ph is not None, nitrogen is not None, phosphorus is not None, potassium is not None]):
            return jsonify({"error": "All soil parameters (pH, N, P, K) required"}), 400

        result = ai_service.analyze_soil(ph, nitrogen, phosphorus, potassium)
        return jsonify(result)

    except Exception as e:
        return jsonify({"error": f"Soil analysis failed: {str(e)}"}), 500

@ai_bp.route("/yield-prediction", methods=["POST"])
def yield_prediction():
    """Predict crop yield based on conditions"""
    try:
        data = request.get_json()

        required_fields = ['crop_type', 'area', 'temperature', 'rainfall', 'soil_ph', 'nitrogen', 'phosphorus', 'potassium']
        if not all(field in data for field in required_fields):
            return jsonify({"error": f"Missing required fields: {required_fields}"}), 400

        result = ai_service.predict_yield(
            data['crop_type'],
            data['area'],
            data['temperature'],
            data['rainfall'],
            data['soil_ph'],
            data['nitrogen'],
            data['phosphorus'],
            data['potassium']
        )
        return jsonify(result)

    except Exception as e:
        return jsonify({"error": f"Yield prediction failed: {str(e)}"}), 500

@ai_bp.route("/market-prices/<crop_type>", methods=["GET"])
def market_prices(crop_type):
    """Get market prices and predictions"""
    try:
        location = request.args.get('location')
        result = ai_service.get_market_prices(crop_type, location)
        return jsonify(result)

    except Exception as e:
        return jsonify({"error": f"Market data retrieval failed: {str(e)}"}), 500

@ai_bp.route("/farm-recommendations", methods=["POST"])
def farm_recommendations():
    """Get personalized farm recommendations"""
    try:
        user_profile = request.get_json()
        result = ai_service.get_farm_recommendations(user_profile)
        return jsonify(result)

    except Exception as e:
        return jsonify({"error": f"Recommendation generation failed: {str(e)}"}), 500

@ai_bp.route("/pest-identification", methods=["POST"])
def pest_identification():
    """Identify pests from images"""
    try:
        if 'image' not in request.files:
            return jsonify({"error": "No image file provided"}), 400

        image_file = request.files['image']
        if image_file.filename == '':
            return jsonify({"error": "No image selected"}), 400

        # For now, return placeholder response
        # In production, this would use a trained pest identification model
        return jsonify({
            "pest": "aphids",
            "confidence": 0.85,
            "damage_level": "moderate",
            "treatment": "Apply insecticidal soap or neem oil spray",
            "prevention": "Introduce ladybugs as natural predators",
            "note": "This is a placeholder - full pest identification model coming soon"
        })

    except Exception as e:
        return jsonify({"error": f"Pest identification failed: {str(e)}"}), 500

@ai_bp.route("/weed-detection", methods=["POST"])
def weed_detection():
    """Detect weeds vs crops in images"""
    try:
        if 'image' not in request.files:
            return jsonify({"error": "No image file provided"}), 400

        image_file = request.files['image']
        if image_file.filename == '':
            return jsonify({"error": "No image selected"}), 400

        # For now, return placeholder response
        # In production, this would use computer vision for weed detection
        return jsonify({
            "analysis": "Image analyzed successfully",
            "weed_coverage": "15%",
            "crop_health": "good",
            "recommendations": [
                "Spot treat weeds in marked areas",
                "Consider precision herbicide application",
                "Improve crop spacing for better weed control"
            ],
            "note": "This is a placeholder - full weed detection model coming soon"
        })

    except Exception as e:
        return jsonify({"error": f"Weed detection failed: {str(e)}"}), 500

@ai_bp.route("/crop-calendar", methods=["GET"])
def crop_calendar():
    """Get optimal planting and harvesting calendar"""
    try:
        location = request.args.get('location', 'unknown')
        crop = request.args.get('crop', 'general')

        # Mock crop calendar data
        calendars = {
            'wheat': {
                'planting_season': 'October-November (Rabi) or March-April (Kharif)',
                'harvest_time': '120-150 days after planting',
                'optimal_conditions': 'Temperature: 15-25°C, Rainfall: 300-500mm',
                'varieties': ['HD-2967', 'PBW-725', 'WH-1105']
            },
            'rice': {
                'planting_season': 'June-July (Kharif) or December-January (Rabi)',
                'harvest_time': '120-150 days after planting',
                'optimal_conditions': 'Temperature: 20-35°C, Rainfall: 1000-1500mm',
                'varieties': ['PR-126', 'Pusa Basmati', 'IR-64']
            },
            'corn': {
                'planting_season': 'May-June (Kharif) or September-October (Rabi)',
                'harvest_time': '90-120 days after planting',
                'optimal_conditions': 'Temperature: 20-30°C, Rainfall: 500-800mm',
                'varieties': ['Ganga-5', 'Pioneer-30V92', 'DKC-9108']
            }
        }

        result = calendars.get(crop.lower(), {
            'planting_season': 'Depends on local climate and crop type',
            'harvest_time': 'Varies by crop variety',
            'optimal_conditions': 'Consult local agricultural extension',
            'varieties': ['Contact local seed suppliers']
        })

        return jsonify({
            'crop': crop,
            'location': location,
            'calendar': result
        })

    except Exception as e:
        return jsonify({"error": f"Calendar generation failed: {str(e)}"}), 500

@ai_bp.route("/generate-caption", methods=["POST"])
def generate_caption():
    """Generate social media captions for farming posts"""
    try:
        data = request.get_json()
        topic = data.get('topic', 'general')
        achievement = data.get('achievement')
        include_hashtags = data.get('hashtags', True)

        result = ai_service.generate_post_caption(topic, achievement, include_hashtags)
        return jsonify(result)

    except Exception as e:
        return jsonify({"error": f"Caption generation failed: {str(e)}"}), 500

@ai_bp.route("/translate", methods=["POST"])
def translate():
    """Translate farming content to different languages"""
    try:
        data = request.get_json()
        text = data.get('text', '')
        target_language = data.get('target_language', 'hindi')
        source_language = data.get('source_language', 'english')

        result = ai_service.translate_text(text, target_language, source_language)
        return jsonify(result)

    except Exception as e:
        return jsonify({"error": f"Translation failed: {str(e)}"}), 500

@ai_bp.route("/personalized-recommendations", methods=["POST"])
def personalized_recommendations():
    """Get personalized recommendations for users"""
    try:
        user_profile = request.get_json()
        content_history = user_profile.get('content_history')

        result = ai_service.get_personalized_recommendations(user_profile, content_history)
        return jsonify(result)

    except Exception as e:
        return jsonify({"error": f"Personalized recommendations failed: {str(e)}"}), 500

@ai_bp.route("/optimize-farm", methods=["POST"])
def optimize_farm():
    """Optimize farm operations and planning"""
    try:
        farm_data = request.get_json()

        result = ai_service.optimize_farm_operations(farm_data)
        return jsonify(result)

    except Exception as e:
        return jsonify({"error": f"Farm optimization failed: {str(e)}"}), 500

@ai_bp.route("/farm-analytics", methods=["POST"])
def farm_analytics():
    """Analyze farm performance and KPIs"""
    try:
        data = request.get_json()
        farm_data = data.get('farm_data', {})
        time_period = data.get('time_period', 'season')

        result = ai_service.analyze_farm_analytics(farm_data, time_period)
        return jsonify(result)

    except Exception as e:
        return jsonify({"error": f"Analytics analysis failed: {str(e)}"}), 500

@ai_bp.route("/detect-anomalies", methods=["POST"])
def detect_anomalies():
    """Detect anomalies in farm sensor data"""
    try:
        data = request.get_json()
        sensor_data = data.get('sensor_data', {})
        farm_data = data.get('farm_data', {})

        result = ai_service.detect_anomalies(sensor_data, farm_data)
        return jsonify(result)

    except Exception as e:
        return jsonify({"error": f"Anomaly detection failed: {str(e)}"}), 500

@ai_bp.route("/scenario-simulation", methods=["POST"])
def scenario_simulation():
    """Run scenario simulations for farm planning"""
    try:
        data = request.get_json()
        baseline_data = data.get('baseline_data', {})
        scenario_changes = data.get('scenario_changes', {})

        result = ai_service.run_scenario_simulation(baseline_data, scenario_changes)
        return jsonify(result)

    except Exception as e:
        return jsonify({"error": f"Scenario simulation failed: {str(e)}"}), 500

@ai_bp.route("/planning-tools", methods=["POST"])
def planning_tools():
    """Generate comprehensive planning tools"""
    try:
        data = request.get_json()
        farm_profile = data.get('farm_profile', {})
        planning_type = data.get('planning_type', 'season')

        result = ai_service.generate_planning_tools(farm_profile, planning_type)
        return jsonify(result)

    except Exception as e:
        return jsonify({"error": f"Planning tool generation failed: {str(e)}"}), 500

@ai_bp.route("/moderate-content", methods=["POST"])
def moderate_content():
    """AI-powered content moderation"""
    try:
        data = request.get_json()
        content = data.get('content', '')
        content_type = data.get('content_type', 'post')

        result = ai_service.moderate_content(content, content_type)
        return jsonify(result)

    except Exception as e:
        return jsonify({"error": f"Content moderation failed: {str(e)}"}), 500

@ai_bp.route("/history/<user_id>", methods=["GET"])
def get_ai_history(user_id):
    """Get user's AI interaction history"""
    try:
        limit = int(request.args.get('limit', 20))
        result = ai_service.get_ai_history(user_id, limit)
        return jsonify(result)

    except Exception as e:
        return jsonify({"error": f"History retrieval failed: {str(e)}"}), 500

@ai_bp.route("/settings/<user_id>", methods=["GET", "POST"])
def user_settings(user_id):
    """Get or update user's personalized AI settings"""
    try:
        if request.method == "GET":
            result = ai_service.get_personalized_settings(user_id)
            return jsonify(result)
        elif request.method == "POST":
            settings = request.get_json()
            result = ai_service.update_personalized_settings(user_id, settings)
            return jsonify(result)

    except Exception as e:
        return jsonify({"error": f"Settings operation failed: {str(e)}"}), 500

# ===== ADVANCED WORLD-CLASS FEATURES =====

@ai_bp.route("/satellite-analysis", methods=["POST"])
def satellite_analysis():
    """Advanced satellite imagery analysis for precision farming"""
    try:
        data = request.get_json()
        location = data.get('location', 'unknown')
        crop_type = data.get('crop_type', 'general')

        result = ai_service.get_satellite_analysis(location, crop_type)
        return jsonify(result)

    except Exception as e:
        return jsonify({"error": f"Satellite analysis failed: {str(e)}"}), 500

@ai_bp.route("/iot-sensor-data", methods=["POST"])
def iot_sensor_data():
    """Integrate IoT sensor data for real-time monitoring"""
    try:
        data = request.get_json()
        farm_id = data.get('farm_id', 'default')

        result = ai_service.get_iot_sensor_data(farm_id)
        return jsonify(result)

    except Exception as e:
        return jsonify({"error": f"IoT integration failed: {str(e)}"}), 500

@ai_bp.route("/sustainability-score", methods=["POST"])
def sustainability_score():
    """Calculate comprehensive sustainability score"""
    try:
        farm_data = request.get_json()

        result = ai_service.get_sustainability_score(farm_data)
        return jsonify(result)

    except Exception as e:
        return jsonify({"error": f"Sustainability analysis failed: {str(e)}"}), 500

@ai_bp.route("/economic-optimization", methods=["POST"])
def economic_optimization():
    """Advanced economic optimization for farming operations"""
    try:
        farm_data = request.get_json()

        result = ai_service.optimize_economics(farm_data)
        return jsonify(result)

    except Exception as e:
        return jsonify({"error": f"Economic optimization failed: {str(e)}"}), 500

@ai_bp.route("/global-market-intelligence", methods=["POST"])
def global_market_intelligence():
    """Advanced global market intelligence"""
    try:
        data = request.get_json()
        crop_type = data.get('crop_type', 'wheat')
        region = data.get('region', 'North America')

        result = ai_service.get_global_market_intelligence(crop_type, region)
        return jsonify(result)

    except Exception as e:
        return jsonify({"error": f"Market intelligence failed: {str(e)}"}), 500

@ai_bp.route("/climate-adaptation-plan", methods=["POST"])
def climate_adaptation_plan():
    """Comprehensive climate adaptation planning"""
    try:
        data = request.get_json()
        location = data.get('location', 'unknown')
        crop_type = data.get('crop_type', 'general')

        result = ai_service.get_climate_adaptation_plan(location, crop_type)
        return jsonify(result)

    except Exception as e:
        return jsonify({"error": f"Climate adaptation planning failed: {str(e)}"}), 500

@ai_bp.route("/blockchain-traceability", methods=["POST"])
def blockchain_traceability():
    """Blockchain-based supply chain traceability"""
    try:
        data = request.get_json()
        product_id = data.get('product_id', 'PROD_' + str(random.randint(1000, 9999)))

        result = ai_service.get_blockchain_traceability(product_id)
        return jsonify(result)

    except Exception as e:
        return jsonify({"error": f"Blockchain traceability failed: {str(e)}"}), 500

@ai_bp.route("/ai-expert-consultation", methods=["POST"])
def ai_expert_consultation():
    """AI-powered expert consultation system"""
    try:
        data = request.get_json()
        query = data.get('query', '')
        user_profile = data.get('user_profile', {})

        result = ai_service.get_ai_expert_consultation(query, user_profile)
        return jsonify(result)

    except Exception as e:
        return jsonify({"error": f"Expert consultation failed: {str(e)}"}), 500

@ai_bp.route("/health", methods=["GET"])
def health_check():
    """AI service health check"""
    return jsonify({
        "status": "healthy",
        "service": "FarmAI",
        "version": "3.0",
        "models_loaded": ai_service.models_loaded,
        "features": {
            "v1_0_core": [
                "chat",
                "disease_detection",
                "weather_forecast",
                "soil_analysis",
                "yield_prediction",
                "market_prices",
                "farm_recommendations",
                "pest_identification",
                "weed_detection",
                "crop_calendar"
            ],
            "v2_0_enhanced": [
                "generate_caption",
                "translate"
            ],
            "v3_0_advanced": [
                "personalized_recommendations",
                "optimize_farm",
                "farm_analytics",
                "detect_anomalies",
                "scenario_simulation",
                "planning_tools",
                "moderate_content",
                "ai_history",
                "personalized_settings"
            ],
            "v4_0_world_class": [
                "satellite_analysis",
                "iot_sensor_data",
                "sustainability_score",
                "economic_optimization",
                "global_market_intelligence",
                "climate_adaptation_plan",
                "blockchain_traceability",
                "ai_expert_consultation"
            ]
        },
        "total_features": 27
    })