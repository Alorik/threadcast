# 🚀 ThreadCast

ThreadCast is a modern, full-stack social media platform built with **Next.js App Router**, focusing on **correct data modeling, scalable APIs, server-driven UI, and real-time communication**.

The project is designed to mirror real-world production systems by prioritizing backend correctness, clean architecture, and extensibility before adding features.

---

## ✨ Features

### 👤 Authentication & Profiles
- Email + password authentication
- Credentials-based login
- Google OAuth support
- JWT-based session strategy
- Secure password hashing using bcrypt
- First-time onboarding flow
- Profile creation & updates
- Avatar upload support

### 🧵 Posts & Feed
- Create text-based posts
- Server-rendered feed
- Latest-first ordering
- Author metadata included
- Optimistic UI updates using `router.refresh()`

### ❤️ Likes System
- Like / unlike posts
- Unique user-post constraint
- Real-time like count updates
- Safe handling of duplicate likes

### 🎥 Realtime (WebRTC)
- 1-to-1 audio/video calls
- Peer-to-peer media streaming
- WebSocket-based signaling
- ICE candidate handling
- Graceful call lifecycle management

### 🔒 Security & Architecture
- Server-side session validation
- Protected routes
- Zod-validated API inputs
- Clean Prisma schema design
- Server Components where possible

---

## 🧱 Tech Stack

### Frontend
- Next.js (App Router)
- React + TypeScript
- Tailwind CSS
- Server Components & Client Components
- Zod (schema validation)

### Backend
- NextAuth (Credentials + OAuth)
- Prisma ORM
- PostgreSQL
- JWT-based sessions

### Realtime
- WebRTC
- WebSockets (signaling)
- STUN/TURN-ready architecture

---

## 📸 Screenshots

> Images are stored in `/public`

### Feed
![Feed](public/feed.png)


![Feed](public/feed2.png)


### Profile
![Profile](public/profile.png)


---



📂 Project Structure

.
├── app/
│   ├── api/
│   │   ├── auth/
│   │   │   ├── [...nextauth]/route.ts
│   │   │   └── register/route.ts
│   │   ├── call/signal/route.ts
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
│   │   ├── pusher/auth/route.ts
│   │   ├── upload/route.ts
│   │   └── users/
│   │       ├── [userId]/follow/route.ts
│   │       └── following/route.ts
│   │
│   ├── auth/
│   │   ├── error/page.tsx
│   │   ├── login/page.tsx
│   │   └── register/page.tsx
│   ├── chat/
│   │   ├── [conversationId]/page.tsx
│   │   └── page.tsx
│   ├── explore/page.tsx
│   ├── feed/page.tsx
│   ├── messages/page.tsx
│   ├── onboarding/page.tsx
│   ├── post/
│   │   ├── [postId]/page.tsx
│   │   └── page.tsx
│   ├── providers/
│   │   └── presence-provider.tsx
│   ├── u/[username]/page.tsx
│   ├── layout.tsx
│   └── globals.css
│
├── components/
│   ├── call/
│   │   ├── incoming-call.tsx
│   │   ├── LocalMediaPreview.tsx
│   │   └── Overlay.tsx
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
│   ├── feed/
│   │   ├── FeedClient.tsx
│   │   ├── FeedTab.tsx
│   │   ├── MediaFeed.tsx
│   │   └── ThreadsFeed.tsx
│   ├── post/PostCard.tsx
│   ├── profile/
│   │   ├── EditProfileModel.tsx
│   │   ├── follow-button.tsx
│   │   └── profile-card.tsx
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