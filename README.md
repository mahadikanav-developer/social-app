# FarmSocial - Complete Application

![FarmSocial](https://img.shields.io/badge/FarmSocial-1.0-brightgreen)
![React](https://img.shields.io/badge/React-18.2.0-blue)
![Node.js](https://img.shields.io/badge/Node.js-14+-green)
![MongoDB](https://img.shields.io/badge/MongoDB-4.4+-13AA52)
![License](https://img.shields.io/badge/License-MIT-blue)

## 🌾 About FarmSocial

FarmSocial is a complete social platform designed for farmers, vendors, and agricultural enthusiasts. It combines Instagram-like social features with marketplace functionality and enterprise-grade security.

**Unified Build**: Includes ALL features from v1.0, v2.0, and v3.0 in a single production-ready application.

---

## ✨ Key Features

### 🔐 Security & Authentication (v3.0)
- **Multi-step signup** with role selection (Farmer, Vendor, Buyer, Analyst)
- **Two-factor authentication** (SMS, Email, Authenticator apps + backup codes)
- **Device management** with session tracking and remote logout
- **Account protection** (lockout policy, suspension, audit logging)
- **Role-based access control** (6 roles with custom permissions)

### 📱 Social Features (v1.0)
- **User profiles** with customizable bios and avatars
- **Posts** with image uploads and captions
- **Comments & Likes** with real-time updates
- **Stories** (24-hour ephemeral content)
- **Direct messaging** (1-to-1 conversations)
- **Follow system** with followers/following lists
- **Notifications** (likes, comments, follows, mentions)
- **Saved posts** (bookmarking functionality)

### 🔍 Discovery & Content (v2.0)
- **Explore page** with trending content and categories
- **Advanced search** (posts, users, hashtags, combined results)
- **Hashtag pages** with trending hashtags
- **User recommendations** (suggested accounts to follow)
- **Search history** and real-time suggestions

### 🏪 Marketplace & Commerce (v2.0)
- **Product listings** with pricing and descriptions
- **Shopping cart** functionality
- **Order management** system
- **Checkout flow** with payment integration
- **Order history** and tracking

### 🎬 Entertainment Features (v2.0)
- **Reels** (short-form video content)
- **IGTV** (longer video content)
- **Live streaming** capabilities
- **Broadcasting** (stream to followers)
- **Events** (create and manage events)
- **Groups** and **Communities** (group discussions)
- **Pages** (brand/business pages)

### 🏢 Enterprise Features (v3.0)
- **Organization support** (teams and organizations)
- **Permissions system** (granular access control)
- **Admin moderation tools** (content moderation)
- **Compliance tracking** (terms, privacy, data consent)
- **Activity audit logging** (comprehensive event logging)
- **Multi-device sessions** (manage devices)
- **Preference management** (language, timezone, notifications)

---

## 🚀 Quick Start

### Using Automated Build Script (Recommended)

```bash
# Clone/navigate to project
cd /path/to/farmsocial

# Run build script
chmod +x build.sh
./build.sh

# Start backend (Terminal 1)
cd backend && npm start

# Start frontend (Terminal 2)  
cd client && npm start
```

The app will be available at: **http://localhost:3000**

### Using Docker

```bash
# Build and run with Docker Compose
docker-compose up -d

# View logs
docker-compose logs -f

# Stop
docker-compose down
```

Access at: **http://localhost**

### Manual Setup

**Backend:**
```bash
cd backend
npm install --legacy-peer-deps
cp .env.example .env
# Edit .env with your settings
npm start
```

**Frontend (in new terminal):**
```bash
cd client
npm install --legacy-peer-deps
cp .env.example .env
npm start
```

---

## 📋 Prerequisites

- **Node.js** v14+ (recommended v16 or v18)
- **npm** v6+ or **yarn** v1.22+
- **MongoDB** v4.4+ (local or cloud)
- **RAM** minimum 2GB
- **Disk** minimum 2GB free space

---

## 📁 Project Structure

```
farmsocial/
├── backend/                    # Node.js/Express API
│   ├── models/                 # Database schemas (20+)
│   ├── routes/                 # API endpoints (22+)
│   ├── middleware/             # Auth, security, logging
│   ├── services/               # Business logic
│   ├── utils/                  # Helper utilities
│   ├── server.js              # Main entry point
│   ├── package.json           # Dependencies
│   ├── .env.example           # Environment template
│   ├── Dockerfile             # Docker configuration
│   └── README.md              # Backend documentation
│
├── client/                     # React frontend
│   ├── src/
│   │   ├── pages/             # Page components (25+)
│   │   ├── components/        # React components (19+)
│   │   ├── services/          # API calls (api.js)
│   │   ├── context/           # React Context
│   │   ├── utils/             # Helper functions
│   │   ├── styles/            # CSS files
│   │   ├── App.js             # Root component
│   │   └── index.js           # Entry point
│   ├── public/                # Static files
│   ├── package.json           # Dependencies
│   ├── .env.example           # Environment template
│   ├── Dockerfile             # Docker configuration
│   ├── nginx.conf             # Nginx configuration
│   └── README.md              # Frontend documentation
│
├── ai/                         # Python AI service (optional)
├── docus/                      # Documentation
│   ├── UNIFIED_BUILD_COMPLETE.md
│   ├── AUTH_V3_0_GUIDE.md
│   ├── BUILD_AND_DEPLOY.md
│   ├── VERSION_1_0_PLAN.md
│   ├── VERSION_2_0_PLAN.md
│   ├── VERSION_3_0_PLAN.md
│   └── Other guides
│
├── docker-compose.yml         # Docker Compose configuration
├── build.sh                   # Build automation script
└── README.md                  # This file
```

---

## 🔌 API Documentation

### Base URL
- Development: `http://localhost:5000/api`
- Production: `https://api.farmsocial.com/api`

### Key Endpoints

**Authentication**
- `POST /auth/signup-v3` - Register new account
- `POST /auth/login-v3` - Login user
- `POST /auth/verify-2fa` - Verify 2FA code
- `GET /auth/sessions/:userId` - Get active sessions

**Social**
- `GET /posts` - Get posts feed
- `POST /posts` - Create post
- `POST /posts/:id/like` - Like post
- `POST /posts/:id/comment` - Add comment

**Users**
- `GET /users/:id` - Get user profile
- `PUT /users/:id` - Update profile
- `POST /users/:id/follow` - Follow user

**Messages**
- `GET /messages` - Get conversations
- `POST /messages` - Send message

**Full API Reference**: See `backend/routes/` directory

---

## 🔒 Security Features

✅ **Encryption**
- Bcrypt password hashing (10 rounds)
- JWT token-based authentication
- Session encryption

✅ **Protection**
- 2FA with multiple methods (SMS, Email, Authenticator)
- Device fingerprinting and tracking
- Account lockout after failed attempts
- Rate limiting (100 requests/15 minutes)

✅ **Compliance**
- Terms of Service acceptance tracking
- Privacy Policy acceptance tracking
- Data consent management
- GDPR-compliant data deletion
- Audit logging of all actions

✅ **Infrastructure**
- CORS configuration
- Security headers (HSTS, CSP, X-Frame-Options)
- Input validation and sanitization
- SQL/NoSQL injection prevention

---

## ⚙️ Configuration

### Backend Environment Variables

```env
# Server
NODE_ENV=development
PORT=5000

# Database
MONGODB_URI=mongodb://localhost:27017/farmsocial

# Authentication
JWT_SECRET=your-secret-key-change-in-production
JWT_EXPIRE=30d

# Security
MAX_LOGIN_ATTEMPTS=5
LOGIN_LOCKOUT_MINUTES=30

# For full list, see backend/.env.example
```

### Frontend Environment Variables

```env
# API
REACT_APP_API_URL=http://localhost:5000/api

# Features
REACT_APP_FEATURE_MARKETPLACE=true
REACT_APP_FEATURE_LIVE_STREAMING=true

# For full list, see client/.env.example
```

---

## 📊 Database Schema

### Models Included (20+)
- **User** - User profiles with v3.0 security fields
- **Post** - User posts with images
- **Comment** - Post comments
- **Like** - Post likes
- **Story** - 24-hour stories
- **Message** - Direct messages
- **Notification** - User notifications
- **Session** - Device sessions (v3.0)
- **Reel** - Short video content
- **IGTV** - Long-form video
- **Event** - Events management
- **Group** - Group discussions
- **Community** - Community management
- **Order** - Marketplace orders
- **SavedPost** - Bookmarked posts
- **Reaction** - Post reactions
- **Hashtag** - Hashtag tracking
- **Page** - Brand pages
- **Report** - Content reports
- **Block** - User blocks
- And more...

---

## 🧪 Testing

### Manual Testing

```bash
# Test backend API
curl -X GET http://localhost:5000/api/auth/countries

# Test frontend
# Open http://localhost:3000 in browser
# Create account and login
```

### Running Tests (if available)

```bash
# Backend tests
cd backend
npm test

# Frontend tests
cd client
npm test
```

---

## 📦 Deployment

### Local Development
```bash
npm start  # in both backend and client
```

### Docker Deployment
```bash
docker-compose up -d
```

### Cloud Deployment

**Heroku:**
```bash
git push heroku main
```

**AWS, DigitalOcean, Google Cloud, Azure:**
See [BUILD_AND_DEPLOY.md](BUILD_AND_DEPLOY.md) for detailed instructions.

---

## 🛠️ Development

### Available Scripts

**Backend:**
```bash
npm start        # Start server
npm run dev      # Development with nodemon
npm test         # Run tests
```

**Frontend:**
```bash
npm start        # Start development server
npm build        # Build for production
npm test         # Run tests
npm eject        # Eject from Create React App (⚠️ irreversible)
```

### Contributing

1. Create a feature branch (`git checkout -b feature/AmazingFeature`)
2. Commit changes (`git commit -m 'Add AmazingFeature'`)
3. Push to branch (`git push origin feature/AmazingFeature`)
4. Open a Pull Request

---

## 📖 Documentation

- **[Complete Setup Guide](BUILD_AND_DEPLOY.md)** - Detailed build and deployment instructions
- **[Authentication Guide](docus/AUTH_V3_0_GUIDE.md)** - v3.0 authentication system details
- **[Feature Overview](docus/UNIFIED_BUILD_COMPLETE.md)** - All features in this build
- **[API Reference](backend/README.md)** - Backend API documentation
- **[Frontend Guide](client/README.md)** - Frontend documentation

---

## 🆘 Troubleshooting

### MongoDB Connection Errors
```bash
# Start MongoDB
mongod
# or
docker run -d -p 27017:27017 mongo:latest
```

### Port Already in Use
```bash
# Kill process on port 5000
lsof -i :5000
kill -9 <PID>
```

### Module Not Found
```bash
rm -rf node_modules package-lock.json
npm install --legacy-peer-deps
```

### CORS Errors
Update `ALLOWED_ORIGIN` in `backend/.env`:
```env
ALLOWED_ORIGIN=http://localhost:3000
```

See [BUILD_AND_DEPLOY.md](BUILD_AND_DEPLOY.md) for more troubleshooting tips.

---

## 📚 Versions Included

| Feature | v1.0 | v2.0 | v3.0 | Total |
|---------|------|------|------|-------|
| Social Features | ✅ | ✅ | ✅ | 45+ |
| Discovery | ❌ | ✅ | ✅ | 30+ |
| Marketplace | ❌ | ✅ | ✅ | 20+ |
| Security | ✅ | ✅ | ✅ | 25+ |
| **Total Features** | **45+** | **75+** | **100+** | **100+** |

---

## 📋 Version History

- **v1.0 (Apr 2026)** - Core social features
- **v2.0 (Apr 2026)** - Marketplace, discovery, entertainment
- **v3.0 (Apr 2026)** - Enterprise security, 2FA, multi-device
- **v1.0 Complete (Apr 19, 2026)** - All versions unified in single build

---

## 📄 License

MIT License - See LICENSE file for details

---

## 👥 Support

- 📧 Email: support@farmsocial.com
- 💬 Discord: [Join Community]
- 📖 Wiki: [Knowledge Base]
- 🐛 Issues: GitHub Issues

---

## 🌟 Key Statistics

- **Lines of Code**: 40,000+
- **API Endpoints**: 50+
- **Database Models**: 20+
- **React Components**: 50+
- **Features**: 100+
- **Documentation Pages**: 10+

---

## 🎯 Roadmap

- [x] v1.0 - Social features
- [x] v2.0 - Marketplace & discovery
- [x] v3.0 - Enterprise & security
- [x] Unified build (all versions)
- [ ] Mobile app (React Native)
- [ ] AI recommendations engine
- [ ] Advanced analytics dashboard
- [ ] Live streaming upgrades
- [ ] Blockchain integration

---

**Ready to Start? Run:** `./build.sh`

**Questions? Check:** Documentation in `docus/` folder

**Happy farming! 🌾**

---

Made with ❤️ for farmers, by developers.
FarmSocial © 2026
