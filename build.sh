#!/bin/bash

# ========================================
# FarmSocial Complete App Build Script
# ========================================
# This script builds and starts both the frontend and backend

set -e

echo "🌾 FarmSocial - Complete App Build (v1.0 + v2.0 + v3.0)"
echo "=================================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if running from project root
if [ ! -d "backend" ] || [ ! -d "client" ]; then
    echo -e "${RED}❌ Error: Must be run from project root directory${NC}"
    exit 1
fi

# ========== BACKEND SETUP ==========
echo -e "${BLUE}📦 Setting up Backend...${NC}"
cd backend

# Copy env if not exists
if [ ! -f ".env" ]; then
    echo -e "${YELLOW}Creating .env file from template...${NC}"
    cp .env.example .env
    echo -e "${YELLOW}⚠️  Please update backend/.env with your configuration${NC}"
fi

# Install dependencies
echo -e "${YELLOW}Installing backend dependencies...${NC}"
npm install --legacy-peer-deps

echo -e "${GREEN}✅ Backend setup complete${NC}"
cd ..

# ========== FRONTEND SETUP ==========
echo ""
echo -e "${BLUE}🎨 Setting up Frontend...${NC}"
cd client

# Copy env if not exists
if [ ! -f ".env" ]; then
    echo -e "${YELLOW}Creating .env file from template...${NC}"
    cp .env.example .env
    echo -e "${YELLOW}⚠️  Please update client/.env with your configuration${NC}"
fi

# Install dependencies
echo -e "${YELLOW}Installing frontend dependencies...${NC}"
npm install --legacy-peer-deps

echo -e "${GREEN}✅ Frontend setup complete${NC}"
cd ..

# ========== AI SETUP ==========
echo ""
echo -e "${BLUE}🤖 Setting up AI service...${NC}"
cd ai

if [ ! -f "requirements.txt" ]; then
    echo -e "${YELLOW}Creating AI requirements file...${NC}"
    cat > requirements.txt <<'EOF'
Flask>=3.0,<4.0
EOF
fi

echo -e "${YELLOW}Installing AI dependencies...${NC}"
python3 -m pip install --user --upgrade pip
python3 -m pip install --user --no-cache-dir -r requirements.txt

echo -e "${GREEN}✅ AI setup complete${NC}"
cd ..

# ========== BUILD SUMMARY ==========
echo ""
echo -e "${GREEN}=================================================="
echo "✅ Build Complete!"
echo "==================================================${NC}"
echo ""
echo "📝 Next Steps:"
echo ""
echo "1️⃣  Configure Environment Variables:"
echo "   - backend/.env (Database, JWT, Email, SMS, etc.)"
echo "   - client/.env (API URLs, Feature flags, etc.)"
echo ""
echo "2️⃣  Start Backend:"
echo "   cd backend && npm start"
echo "   (Or: npm run dev for development with nodemon)"
echo ""
echo "3️⃣  Start Frontend:"
echo "   cd client && npm start"
echo "   (App will open at http://localhost:3000)"
echo ""
echo "4️⃣  Start AI service:"
echo "   cd ai && python3 app.py"
echo "   (AI service will run at http://localhost:5001)"
echo ""
echo "5️⃣  Start all apps together (recommended):"
echo "   docker compose up --build"
echo ""
echo "6️⃣  Setup Database:"
echo "   - Ensure MongoDB is running on localhost:27017"
echo "   - Or update MONGODB_URI in backend/.env"
echo ""
echo "📚 Documentation:"
echo "   - See UNIFIED_BUILD_COMPLETE.md for feature overview"
echo "   - See AUTH_V3_0_GUIDE.md for authentication details"
echo "   - See BUILD_AND_DEPLOY.md for deployment instructions"
echo ""
echo -e "${BLUE}Happy farming! 🌾${NC}"
