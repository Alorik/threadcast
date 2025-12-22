🚀 ThreadCast — Phase 1 & 2

Auth · Profiles · Posts · Likes

ThreadCast is a full-stack social platform built with modern web architecture principles, focusing on correct data modeling, clean APIs, and scalable UI patterns.

This document summarizes everything implemented so far.

⸻

🧱 Tech Stack
	•	Next.js (App Router)
	•	React + TypeScript
	•	NextAuth (Credentials + OAuth)
	•	Prisma ORM
	•	PostgreSQL
	•	Zod (schema validation)
	•	Tailwind CSS

⸻

📦 Completed Features

⸻

✅ Phase 1 — Authentication & Profile System

🔐 Authentication
	•	Email + password registration
	•	Credentials-based login
	•	Google OAuth provider (optional)
	•	Secure password hashing using bcrypt
	•	JWT-based session strategy with NextAuth

👤 User Profile & Onboarding
	•	First-time onboarding flow
	•	Profile fetch & update APIs

Endpoints
	•	GET /api/me — fetch current user profile
	•	PATCH /api/me — update profile data

Profile Fields
	•	email
	•	username
	•	bio
	•	avatarUrl
	•	onboarded flag

🔒 Protected Routes
	•	Server-side session validation
	•	Redirects for unauthenticated users
	•	Onboarding enforced if profile incomplete

🧪 Fully Tested (Postman)
	•	Registration
	•	Login (Credentials)
	•	Session persistence
	•	Profile fetch & update

⸻

🎨 Frontend Screens (Phase 1)
	•	/auth/login — credentials login
	•	/auth/register — user registration
	•	/auth/error — NextAuth error handling
	•	/onboarding — profile completion

⸻

✅ Phase 2 — Posts & Likes System (Complete)

⸻

📝 Posts System

📐 Prisma Model
	•	User → Post (1-to-many)
	•	Clean, extensible schema

🔌 API Routes

POST /api/posts
	•	Creates a new post
	•	Auth-protected
	•	Zod-validated input

GET /api/posts
	•	Fetches feed (latest first)
	•	Includes:
	•	Author data
	•	Like count
	•	Whether the current user liked the post

⸻

🖥️ Feed UI (/feed)
	•	Server Component rendered feed
	•	Displays:
	•	Username
	•	Post content
	•	Timestamp
	•	Like count
	•	Like toggle button

✍️ Create Post Form
	•	Client component
	•	Calls POST /api/posts
	•	Uses router.refresh() for instant feed updates
	•	No client-side state hacks

⸻

❤️ Likes System

📐 Prisma Model
	•	Dedicated Like model
	•	Unique constraint: (userId, postId)

🔌 API Routes

POST /api/posts/[postId]/like
	•	Likes a post
	•	Safely handles already-liked cases

DELETE /api/posts/[postId]/like
	•	Unlikes a post

📂 Key Folder Structure


app/
 ├─ api/
 │   ├─ auth/
 │   │   ├─ [...nextauth]/route.ts
 │   │   └─ register/route.ts
 │   ├─ me/route.ts
 │   ├─ posts/
 │   │   ├─ route.ts
 │   │   └─ [postId]/
 │   │       └─ like/route.ts
 │
 ├─ auth/
 │   ├─ login/page.tsx
 │   ├─ register/page.tsx
 │   └─ error/page.tsx
 │
 ├─ onboarding/page.tsx
 ├─ feed/page.tsx

components/
 ├─ create-post-form.tsx
 └─ like-button.tsx

prisma/
 └─ schema.prisma




🏁 Current Status

✔ Phase 1 — Auth, Sessions, Profiles, Onboarding
✔ Phase 2 — Posts, Feed UI, Likes, Toggle Logic

Architecture is stable, scalable, and production-ready.
