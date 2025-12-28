# 🚀 ThreadCast

**[🌐 View Live Demo](https://threadcast.vercel.app/)**

ThreadCast is a modern, full-stack social media platform built with **Next.js App Router**, designed around **scalable backend architecture, server-first rendering, real-time communication, and clean data modeling**.

The project focuses on building **production-grade foundations first** — authentication, profiles, posts, messaging, presence, and WebRTC — before layering advanced social features.

---

## ✨ Features

### 🔐 Authentication & Security
- Credentials-based authentication (email & password)
- Google OAuth support
- JWT-based sessions using NextAuth
- Secure password hashing with bcrypt
- Server-side session validation
- Protected routes via middleware

### 👤 User Profiles
- Public profile pages (`/u/[username]`)
- Editable profile information
- Avatar upload & update
- Follow / unfollow users
- Followers & following system
- Onboarding enforcement for new users

### 🧵 Posts & Feed
- Create text-based threads
- Media posts (images)
- Server-rendered feed
- Explore page for discovering posts
- Post detail pages
- Comments on posts
- Like / unlike system
- Real-time UI refresh using `router.refresh()`

### 💬 Realtime Chat
- One-to-one conversations
- Message sending & receiving
- Image messages
- Typing indicators
- Read receipts
- Chat sidebar & conversation layout
- Optimized message fetching per conversation

### 🎥 WebRTC Calling
- One-to-one audio/video calls
- Incoming call UI
- Call overlay & controls
- Media preview before joining
- WebRTC peer connection handling
- ICE candidate exchange
- Custom signaling layer

### 🟢 Presence System
- Online / offline tracking
- Real-time presence updates
- Typing & activity indicators

### 📡 Realtime Infrastructure
- Pusher for realtime events
- Custom signaling endpoints
- Presence & messaging events
- Call signaling via API routes

---

## 🧱 Tech Stack

### Frontend
- Next.js 14+ (App Router)
- React 18
- TypeScript
- Tailwind CSS
- Server Components & Client Components

### Backend
- NextAuth.js
- Prisma ORM
- PostgreSQL
- Zod (schema validation)

### Realtime
- WebRTC (peer-to-peer media)
- Pusher (messaging & presence)
- WebSocket-style signaling via API routes

### Media & Storage
- Cloudinary (image uploads & optimization)

---

## 📸 Screenshots

### Feed
![Feed View](public/feed.png)

### Feed Alternative
![Feed View 2](public/feed2.png)

### Profile
![User Profile](public/profile.png)

### Chat
![Real-time Chat](public/chat.png)

---

## 📁 Project Structure

```
threadcast/
├── app/
│   ├── api/
│   │   ├── auth/
│   │   │   ├── [...nextauth]/route.ts
│   │   │   └── register/route.ts
│   │   ├── call/
│   │   │   └── signal/route.ts
│   │   ├── chat/
│   │   │   ├── conversation/route.ts
│   │   │   ├── conversations/route.ts
│   │   │   ├── messages/
│   │   │   │   ├── [messageId]/route.ts
│   │   │   │   └── route.ts
│   │   │   ├── read/route.ts
│   │   │   └── typing/route.ts
│   │   ├── explore/route.ts
│   │   ├── me/
│   │   │   ├── avatar/route.ts
│   │   │   └── route.ts
│   │   ├── posts/
│   │   │   ├── [postId]/
│   │   │   │   ├── comments/route.ts
│   │   │   │   └── like/route.ts
│   │   │   ├── media/route.ts
│   │   │   ├── threads/route.ts
│   │   │   └── route.ts
│   │   ├── presence/
│   │   │   ├── offline/route.ts
│   │   │   └── route.ts
│   │   ├── pusher/
│   │   │   └── auth/route.ts
│   │   ├── upload/route.ts
│   │   └── users/
│   │       ├── [userId]/follow/route.ts
│   │       └── following/route.ts
│   │
│   ├── auth/
│   │   ├── error/page.tsx
│   │   ├── login/page.tsx
│   │   └── register/page.tsx
│   │
│   ├── chat/
│   │   ├── [conversationId]/page.tsx
│   │   └── page.tsx
│   │
│   ├── explore/page.tsx
│   ├── feed/page.tsx
│   ├── messages/page.tsx
│   ├── onboarding/page.tsx
│   │
│   ├── post/
│   │   ├── [postId]/page.tsx
│   │   └── page.tsx
│   │
│   ├── providers/
│   │   └── presence-provider.tsx
│   │
│   ├── u/[username]/page.tsx
│   ├── layout.tsx
│   └── globals.css
│
├── components/
│   ├── call/
│   │   ├── incoming-call.tsx
│   │   ├── LocalMediaPreview.tsx
│   │   └── Overlay.tsx
│   │
│   ├── chat/
│   │   ├── call-button.tsx
│   │   ├── chat-header.tsx
│   │   ├── chat-layout.tsx
│   │   ├── chat-message.tsx
│   │   ├── chat-sidebar.tsx
│   │   ├── chat-typing.tsx
│   │   ├── image-message.tsx
│   │   ├── image-preview-model.tsx
│   │   └── new-message-model.tsx
│   │
│   ├── feed/
│   │   ├── FeedClient.tsx
│   │   ├── FeedTab.tsx
│   │   ├── MediaFeed.tsx
│   │   └── ThreadsFeed.tsx
│   │
│   ├── post/
│   │   └── PostCard.tsx
│   │
│   ├── profile/
│   │   ├── EditProfileModel.tsx
│   │   ├── follow-button.tsx
│   │   └── profile-card.tsx
│   │
│   ├── comments-form.tsx
│   ├── create-post-form.tsx
│   ├── like-button.tsx
│   └── navbar.tsx
│
├── lib/
│   ├── auth-user.ts
│   ├── cloudinary.ts
│   ├── prisma.ts
│   ├── pusher-client.ts
│   ├── pusher-server.ts
│   └── webrtc.ts
│
├── prisma/
│   ├── migrations/
│   └── schema.prisma
│
├── schema/
│   └── auth.ts
│
├── types/
│   ├── chat.ts
│   └── next-auth.d.ts
│
├── middleware.ts
├── server.js
├── next.config.ts
├── tsconfig.json
├── package.json
└── README.md
```

### 🗂️ Directory Overview

**`app/`** - Next.js App Router directory
- **`api/`** - Backend API routes (REST endpoints)
- **`auth/`** - Authentication pages (login, register, error)
- **`chat/`** - Real-time messaging interface
- **`feed/`** - Main social feed
- **`post/`** - Individual post pages
- **`providers/`** - React context providers

**`components/`** - Reusable React components
- **`call/`** - WebRTC video call UI
- **`chat/`** - Chat interface components
- **`feed/`** - Feed display components
- **`post/`** - Post card and interactions
- **`profile/`** - User profile components

**`lib/`** - Utility functions and configurations
- **`prisma.ts`** - Database client
- **`webrtc.ts`** - WebRTC peer connection logic
- **`pusher-*.ts`** - Real-time messaging setup

**`prisma/`** - Database schema and migrations

**`types/`** - TypeScript type definitions

---

## 🚀 Installation & Setup

### Prerequisites
- Node.js 18+
- PostgreSQL
- npm / pnpm / yarn

### Clone Repository

```bash
git clone https://github.com/Alorik/threadcast.git
cd threadcast
```

### Install Dependencies

```bash
npm install
```

### Environment Variables

Create a `.env` file in the root directory:

```env
DATABASE_URL=postgresql://user:password@localhost:5432/threadcast
NEXTAUTH_SECRET=your_secret_here
NEXTAUTH_URL=http://localhost:3000

PUSHER_APP_ID=your_pusher_app_id
PUSHER_KEY=your_pusher_key
PUSHER_SECRET=your_pusher_secret
PUSHER_CLUSTER=your_pusher_cluster

CLOUDINARY_CLOUD_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_cloudinary_key
CLOUDINARY_API_SECRET=your_cloudinary_secret

GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
```

### Run Migrations

```bash
npx prisma migrate dev
npx prisma generate
```

### Start Development Server

```bash
npm run dev
```

Visit `http://localhost:3000` to see the application running.

---

## 🏁 Current Status

- ✅ Authentication & Sessions
- ✅ Profiles & Follow System
- ✅ Posts, Media, Comments & Likes
- ✅ Realtime Chat
- ✅ Presence Tracking
- ✅ WebRTC Audio/Video Calls
- ✅ Production-ready architecture

---

## 🗺️ Roadmap

- [ ] Group chats
- [ ] Group video calls
- [ ] Notifications system
- [ ] Post sharing & reposting
- [ ] Search functionality
- [ ] Hashtags & trending
- [ ] Direct message reactions
- [ ] Mobile app (React Native)
- [ ] Advanced analytics dashboard

---

## 🧠 Engineering Philosophy

> **Build systems that scale before features that impress.**

ThreadCast emphasizes:
- Server-first rendering for performance
- Clean API boundaries and separation of concerns
- Strong data modeling with Prisma
- Real-time features without architectural hacks
- Type safety throughout the stack

---

## 🌐 Live Demo

Experience ThreadCast in production:

### **[👉 threadcast.vercel.app](https://threadcast.vercel.app/)**

Deployed on **Vercel** with:
- ✅ PostgreSQL database (Neon/Supabase)
- ✅ Automatic deployments from `main` branch
- ✅ Edge-optimized performance
- ✅ HTTPS enabled

---

## 👨‍💻 Author

**Nitin Kirola**

[![GitHub](https://img.shields.io/badge/GitHub-Alorik-181717?style=for-the-badge&logo=github)](https://github.com/Alorik)
[![Live Demo](https://img.shields.io/badge/Live%20Demo-ThreadCast-blue?style=for-the-badge&logo=vercel)](https://threadcast.vercel.app/)

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

---

<div align="center">
  <strong>Built with ❤️ using Next.js, Prisma, and WebRTC</strong>
  <br><br>
  <a href="https://threadcast.vercel.app/">Live Demo</a> •
  <a href="#-features">Features</a> •
  <a href="#-tech-stack">Tech Stack</a> •
  <a href="#-installation--setup">Setup</a>
</div>