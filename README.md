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