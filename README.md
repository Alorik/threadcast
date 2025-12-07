🚀 Super Social App — Phase 1 (Auth + Profile)

A full-stack social media / collaborative platform built using:
	•	Next.js App Router (React)
	•	NextAuth (credentials + OAuth)
	•	Prisma ORM
	•	PostgreSQL
	•	TypeScript
	•	Zod for validation

This document covers everything implemented in Phase 1.

⸻

📦 Current Features (Phase 1 Complete)

✔️ Authentication
	•	Credentials-based login and registration
	•	Google OAuth provider ready (optional)
	•	Secure password hashing with bcrypt
	•	JWT session strategy

✔️ User Profile
	•	Onboarding flow for first-time users
	•	/api/me endpoint to view & update authed user profile
	•	Basic fields:
	•	email
	•	username
	•	bio
	•	avatarUrl

✔️ Protected Routes
	•	Authentication required for protected sections
	•	Access control using sessions

✔️ Postman Tested Successfully
	•	Login (credentials)
	•	Register
	•	GET /api/me
	•	PATCH /api/me

⸻

📂 Folder Structure Summary


🧑‍💻 API Routes Implemented

POST /api/auth/register
	•	Creates a new user
	•	Hashes password with bcrypt
	•	Validates with Zod

POST /api/auth/callback/credentials
	•	Authenticates credentials via NextAuth
	•	Returns session cookies

GET /api/auth/session
	•	Check current logged-in user

GET /api/me
	•	Returns logged-in user (session required)

PATCH /api/me
	•	Updates username, bio, and avatar URL
	•	Requires auth


  🔐 Authentication Flow
	1.	User hits /auth/register (UI form)
	2.	User logs in via /auth/login
	3.	NextAuth sets session tokens
	4.	System checks:
	•	If user has username, proceed
	•	If user does not have username, redirect /onboarding
  
🎨 Frontend Screens (Minimal)

/auth/login
	•	Email + password login form
	•	Calls signIn("credentials")

/auth/error
	•	Handles login errors

/onboarding
	•	Updates profile details
	•	Uses PATCH /api/me