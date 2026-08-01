#!/bin/bash
# FarmAI Complete Startup Script

echo "🌾 FarmAI System - Complete Startup"
echo "=================================="
echo ""

# Check if services are already running
check_port() {
    lsof -i :$1 > /dev/null 2>&1
    return $?
}

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

PROJECT_DIR="/home/am/Desktop/project"
AI_DIR="$PROJECT_DIR/ai"
BACKEND_DIR="$PROJECT_DIR/backend"

# Check port 5001 (AI Service)
echo "Checking AI Service (Port 5001)..."
if check_port 5001; then
    echo -e "${YELLOW}⚠️  Port 5001 already in use. Killing existing process...${NC}"
    lsof -ti:5001 | xargs kill -9 2>/dev/null || true
    sleep 1
fi

# Check port 5000 (Backend)
echo "Checking Backend (Port 5000)..."
if check_port 5000; then
    echo -e "${YELLOW}⚠️  Port 5000 already in use. Killing existing process...${NC}"
    lsof -ti:5000 | xargs kill -9 2>/dev/null || true
    sleep 1
fi

echo ""
echo -e "${GREEN}Starting FarmAI Services...${NC}"
echo ""

# Start AI Service
echo -e "${GREEN}1️⃣  Starting AI Service (Port 5001)...${NC}"
cd "$AI_DIR"
python3 app.py &
AI_PID=$!
sleep 2

# Start Backend
echo -e "${GREEN}2️⃣  Starting Backend (Port 5000)...${NC}"
cd "$BACKEND_DIR"
npm start &
BACKEND_PID=$!
sleep 2

echo ""
echo -e "${GREEN}✅ All Services Started!${NC}"
echo ""
echo "📍 Service URLs:"
echo "   AI Service:    http://localhost:5001"
echo "   Backend:       http://localhost:5000"
echo "   Test App:      file://$PROJECT_DIR/ai_test_app.html"
echo ""
echo "🎯 To use:"
echo "   1. Open $PROJECT_DIR/ai_test_app.html in your browser"
echo "   2. Or use these curl commands:"
echo ""
echo "   Health Check:"
echo "   curl http://localhost:5001/api/ai/health"
echo ""
echo "   Chat:"
echo "   curl -X POST http://localhost:5001/api/ai/chat \\"
echo "     -H 'Content-Type: application/json' \\"
echo "     -d '{\"message\":\"hello\",\"user_id\":\"test_user\"}'"
echo ""
echo "💡 To stop services, press Ctrl+C"
echo ""

# Wait for services
wait
