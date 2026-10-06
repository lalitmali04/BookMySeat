# 🎟️ BookMySeat — Enterprise Movie & Event Ticket Booking Platform

**BookMySeat** is a high-performance cinema and live event ticket booking application built with **React, TypeScript, Tailwind CSS, Node.js/Express, PostgreSQL, Redis, and WebSockets**. 

It features an interactive cinema venue map, realistic tiering (Recliner, Prime, Classic), and an enterprise-grade **multi-layer concurrency control engine** that guarantees:

> 🛡️ **Zero Double-Bookings Guarantee:** No two concurrent users can ever successfully lock or book the same seat for the same showtime, even when requests arrive at the exact same millisecond.

---

## 🌟 Key Features

### 🎬 Visual & User Experience
- **Cinematic Dark Theme & Glassmorphism:** Curated dark palette with ruby/gold accents, glowing screen beam effects, and micro-interactions.
- **Interactive Cinema Seat Map & Venue Layout:**
  - Curved screen with ambient projection beam.
  - Multi-tier seat rows: **Recliner VIP Lounges (A-B)**, **Prime Immersion Zone (C-E)**, and **Classic (F-H)** with center aisles.
  - Cinema venue overview diagram indicating sound speaker arrays (Dolby Atmos / IMAX), eye-level guide, and entry/exit gates.
  - Dynamic visual seat states: `AVAILABLE`, `SELECTED` (with pulsing glow), `LOCKED` (pulsing amber lock for seats held by other users), and `BOOKED` (disabled slate).
- **Live Seat Availability Status:** Dynamic showtime chips (`Available`, `Filling Fast`, `Almost Full`, `Sold Out`) calculated dynamically from live database and Redis hold states.
- **Sticky Booking Summary Bar with Countdown Timer:** Displays real-time `Seats held for mm:ss` countdown synchronized with Redis TTL.
- **Mock Payment Gateway:** Realistic multi-option checkout supporting UPI (QR code & VPA), Credit/Debit Cards, Net Banking, and Digital Wallets with idempotency protection.
- **Digital E-Tickets:** Scannable QR-code tickets with booking reference (`BMS-XXXXXXXX`), hall entry gate, and print/download capability.
- **Booking Management:** Real-time cancellation with automated refund calculation and immediate seat release back to `AVAILABLE`.
- **Operations Control Panel (Admin Dashboard):** Real-time gross revenue metrics, occupancy rates, movie catalog CRUD, and live bookings monitoring.

---

## 🏗️ Multi-Layer Concurrency Architecture

To eliminate race conditions, **BookMySeat** enforces an enterprise 5-stage defense pipeline:

```
[User Clicks Seat]
       │
       ▼
1. Frontend Optimistic State (UI Only - Never Trusted as Authority)
       │
       ▼
2. Redis Distributed Temporary Lock (SET seat_lock:{showId}:{seatId} {userToken} NX EX 300)
       ├── ❌ Collision → 409 Conflict: "Seat temporarily locked by another user."
       └── ✅ Acquired → 5-minute countdown starts; broadcasted via WebSocket
       │
       ▼
[User Proceeds to Checkout & Clicks Pay]
       │
       ▼
3. Redis Lock Ownership Verification (Ensures hold has not expired and token belongs to user)
       │
       ▼
4. Database ACID Transaction + Row-Level Locking
       ├── BEGIN;
       ├── SELECT * FROM show_seats WHERE show_id = $1 AND seat_id IN (...) FOR UPDATE;
       ├── Verify no seat has status = 'BOOKED'
       ├── UPDATE show_seats SET status = 'BOOKED' WHERE ...
       ├── INSERT INTO bookings (...) RETURNING *;
       ├── INSERT INTO booking_items (...);
       ├── COMMIT;
       │
       ▼
5. Database Unique Constraints (Safety Net)
       └── UNIQUE (show_id, seat_id) on show_seats
       └── UNIQUE (idempotency_key) on bookings
       │
       ▼
[Release Redis Temporary Lock & Broadcast seat:booked via WebSockets]
```

---

## 🧪 Concurrency Test Suite (8/8 Automated Tests)

The backend includes an automated concurrency test runner (`server/test/concurrency.test.ts`) that validates all 8 concurrency scenarios:

| # | Test Scenario | Verified Behavior | Status |
|---|---------------|-------------------|--------|
| **1** | Simultaneous seat lock (2 users click same seat at same ms) | Exactly one acquires lock; other receives `409 Conflict` | ✅ PASSED |
| **2** | TTL Expiry (1-second hold expiration) | Expired lock is evicted; seat becomes acquirable by another user | ✅ PASSED |
| **3** | Simultaneous final booking race | Database transaction with row lock allows only 1 booking; rejects concurrent attempt | ✅ PASSED |
| **4** | Unowned lock booking attempt | Server rejects booking without valid Redis lock ownership | ✅ PASSED |
| **5** | Lock expires during payment delay | Server rejects payment confirmation when TTL has expired | ✅ PASSED |
| **6** | Double-click Pay (Idempotency key) | Exactly one booking is created; duplicate request returns identical booking reference | ✅ PASSED |
| **7** | Simultaneous distinct seat bookings | Both bookings succeed in parallel without interference | ✅ PASSED |
| **8** | Multi-seat batch booking with partial collision | Atomic rollback: no partial locks or phantom seats remain | ✅ PASSED |

To run the test suite:
```bash
npm run test:concurrency
```

---

## 🚀 Quick Start Guide

### 1. Prerequisites
- **Node.js** v18+ or v20+ / v24+
- **NPM** (or PowerShell on Windows)

> **Note:** The backend features a resilient dual-engine database and Redis abstraction. It seamlessly connects to your live **PostgreSQL** and **Redis** instances when configured in `.env`, and also includes zero-config fallback storage for immediate out-of-the-box local testing.

---

### 2. Environment Configuration

Create a `.env` file in `server/` (optional for local testing, defaults are pre-configured):

```env
PORT=5000
NODE_ENV=development
JWT_SECRET=bookmyseat-super-secret-jwt-key-2026
SEAT_LOCK_TTL=300

# Optional: Real PostgreSQL & Redis instances
DATABASE_URL=postgres://postgres:password@localhost:5432/bookmyseat
REDIS_URL=redis://localhost:6379
```

---

### 3. Installation & Seeding

Install root, client, and server dependencies:
```bash
# In project root:
cd server && npm install
cd ../client && npm install
```

Seed the demo database with 10+ blockbuster movies, 5 multiplexes, 6 screens, 480+ seats, and sample shows:
```bash
npm run seed
```

---

### 4. Running the Application

In **Terminal 1** (Start Backend Server):
```bash
cd server
npm run dev
```
*Backend runs on `http://localhost:5000` with WebSocket support.*

In **Terminal 2** (Start Frontend Client):
```bash
cd client
npm run dev
```
*Frontend runs on `http://localhost:5173`.*

---

## 🚀 Production Deployment

### Frontend (Vercel)
The `client` directory can be deployed directly to Vercel as a Single Page Application (SPA).
1. Connect your repository to Vercel and import the project.
2. In the Vercel project settings, configure:
   - **Root Directory**: `client`
   - **Framework Preset**: Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`
3. Add the following **Environment Variables** in Vercel:
   - `VITE_API_URL`: Your backend REST API URL (e.g., `https://your-backend-app.onrender.com/api`)
   - `VITE_SOCKET_URL`: Your backend WebSocket URL (e.g., `https://your-backend-app.onrender.com`)

*Note: A `vercel.json` file is already included in the `client/` directory to handle React Router SPA rewrites.*

### Backend (Render / Railway / Heroku)
The `server` directory must be deployed on a platform that supports persistent Node.js instances (e.g., Render, Railway) since it relies on long-running processes for WebSockets and Redis connections.
1. Deploy the `server` directory as a Node.js web service.
2. Ensure you have provisioned external PostgreSQL and Redis databases.
3. Configure the following **Environment Variables**:
   - `NODE_ENV`: `production`
   - `PORT`: Server port (often assigned automatically by the host, e.g., `5000`)
   - `DATABASE_URL`: Your production PostgreSQL connection string
   - `REDIS_URL`: Your production Redis connection string
   - `JWT_SECRET`: A strong, secure random string for JWT signing
   - `SEAT_LOCK_TTL`: Expiration time for temporary seat holds (default: `300` seconds)
   - `CLIENT_URL`: Your frontend Vercel domain (e.g., `https://your-vercel-domain.vercel.app`) - required for CORS

---

## 🔑 Demo Login Credentials

You can use the **1-Click Demo Switcher** in the Sign In modal or type manually:

| Account Type | Email | Password | Role |
|--------------|-------|----------|------|
| **Customer Demo** | `user@bookmyseat.com` | `User@123` | Customer (VIP Gold) |
| **Admin Demo** | `admin@bookmyseat.com` | `Admin@123` | Super Administrator |

---

## 📂 Project Structure

```
bookmyseat/
├── client/                     # Vite + React 19 + TypeScript + Tailwind CSS
│   ├── src/
│   │   ├── components/
│   │   │   ├── SeatMap/       # CinemaScreen, CinemaVenueLayout, SeatButton, StickyBookingBar
│   │   │   ├── Navbar.tsx     # City picker, live autocomplete search, user menu
│   │   │   ├── Footer.tsx     # Tech overview, multiplex partners, legal
│   │   │   ├── HeroBanner.tsx # Featured movie slider with trailer modal
│   │   │   ├── MovieCard.tsx  # Interactive poster card with rating & CTA
│   │   │   ├── AuthModal.tsx  # Login/Register + 1-Click Demo accounts
│   │   │   ├── CityModal.tsx  # Multi-city selector modal
│   │   │   └── TicketModal.tsx# Boarding-pass digital ticket with QR generator
│   │   ├── context/           # AuthContext & CityContext
│   │   ├── pages/
│   │   │   ├── HomePage.tsx
│   │   │   ├── MovieDetailsPage.tsx
│   │   │   ├── SeatSelectionPage.tsx
│   │   │   ├── CheckoutPage.tsx
│   │   │   ├── BookingConfirmationPage.tsx
│   │   │   ├── MyBookingsPage.tsx
│   │   │   ├── UserProfilePage.tsx
│   │   │   └── AdminDashboardPage.tsx
│   │   └── services/          # API client & Socket.io client
├── server/                     # Node.js + Express + TypeScript + PostgreSQL + Redis
│   ├── src/
│   │   ├── config/            # Environment settings
│   │   ├── controllers/       # Auth, Movies, Theatres, Shows, Seats, Bookings, Admin
│   │   ├── db/
│   │   │   ├── connection.ts  # Database client with row-level locks & ACID transactions
│   │   │   ├── schema.sql     # PostgreSQL relational schema DDL
│   │   │   └── seed.ts        # Comprehensive demo seed data
│   │   ├── middleware/        # JWT auth & admin guards
│   │   ├── routes/            # REST API endpoints
│   │   ├── services/          # RedisLockService & BookingService
│   │   ├── socket.ts          # Real-time WebSocket broadcasting
│   │   └── server.ts          # Express server entrypoint
│   └── test/
│       └── concurrency.test.ts# 8-scenario race condition test suite
└── package.json
```

---

## 📄 License
This project is licensed under the MIT License.
