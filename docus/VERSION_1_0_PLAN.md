# FarmSocial Version 1.0 Plan

## Goal

Launch a stable MVP social platform for farmers with core Instagram-like functionality and basic marketplace readiness.

---

## Features Included

### Core Social
- User signup/login
- Email/phone verification
- Forgot/reset password
- Session logout from all devices
- Profile create/edit
- Profile photo upload
- Bio, farm type, crop interests
- Follow/unfollow
- Followers/following lists
- Feed with posts
- Home feed sorting (latest + relevant)
- Likes and comments
- Comment delete/edit by owner
- Stories
- Story viewer and auto-expire behavior
- Direct messages
- Conversation list + unread badges
- Notifications
- Mark as read / mark all read
- Search and explore
- User search + post search + hashtag search

### Content
- Text + image posts
- Post type tags (tip, question, market update)
- Draft post support
- Hashtag and mention linking
- Clickable hashtags with topic pages
- Mention notifications
- Saved posts
- Saved collections (default + custom)
- Repost/share flow
- Share to profile/story (basic)
- Post delete with confirmation

### Safety + Platform
- Terms and Conditions acceptance
- OTP verification (SMS/email fallback)
- Basic settings page
- Privacy toggle (public/private profile)
- Change password and account controls
- Basic report abuse form
- Content guideline banner for new users

### Must Complete Before Public Launch
- Block user
- Report post/user
- Checkout foundation for marketplace
- Better form validation and error messages
- API rate limiting and request validation
- Activity logging for critical auth actions

---

## How It Works (User Flow)

1. User signs up, verifies OTP, and accepts Terms.
2. User creates profile and follows other users.
3. Home feed shows posts from followed users + discovery sections.
4. User can create posts with image upload and interact (like/comment/save/share).
5. User receives notifications for interactions.
6. User chats via direct messages and uses stories for short-lived content.
7. Safety controls (block/report) protect user experience.

---

## How It Will Be Built

### Frontend (React)
- Route-first architecture (`/home`, `/explore`, `/messages`, `/profile/:id`, etc.)
- Reusable components: feed, post card, story bar, composer, notification list
- Central API service module with auth token handling
- Form validation and loading/error states on all critical actions
- Protected routes with auth guard and token refresh handling
- Responsive layouts for desktop/tablet/mobile breakpoints

### Backend (Node/Express + MongoDB)
- REST APIs for auth, users, posts, comments, follows, messages, notifications
- JWT authentication middleware
- Multer for image upload
- Models for User, Post, Comment, Message, Notification, Story, SavedPost
- Block/Report routes and filtering logic before launch
- Input schema validation for auth/post/comment endpoints
- Security middleware (helmet, CORS policy, basic rate limits)
- Search indexes for user + post + hashtag queries

### Delivery Phases
- Phase A: harden existing features and fix validation gaps
- Phase B: implement block/report + safety checks
- Phase C: complete checkout foundation + regression tests
- Phase D: production config + monitoring + deployment checklist

---

## Build Checklist

- [ ] Finalize safety features (block/report)
- [ ] Complete checkout baseline flow
- [ ] Add API input validation and rate limiting
- [ ] Run mobile and desktop regression testing
- [ ] Configure production env vars and logging
- [ ] Prepare launch runbook
- [ ] Complete password reset and profile privacy controls
- [ ] Add mention/hashtag notifications and topic pages
- [ ] Verify post save/share/delete edge cases
- [ ] Add smoke tests for auth, feed, and messaging

---

## Definition of Done

- No critical bugs in signup, posting, feed, messaging, and notifications
- Safety features active
- Marketplace checkout baseline working
- Stable performance and verified deployment setup
- Search, profile, and post interactions work consistently on mobile + desktop
