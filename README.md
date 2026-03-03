# 🏠 RentEase — Rental Listings & Move-in Platform

> Cohort 26 Buildathon · Web Dev · Problem Statement 2

A full-stack rental housing platform that manages property discovery, visit scheduling, and complete move-in workflows — built with MERN stack.

## 🔗 Live Links

- **Frontend**: [https://rentease.vercel.app](https://rentease.vercel.app) _(update after deploy)_
- **Backend API**: [https://rentease-api.onrender.com](https://rentease-api.onrender.com) _(update after deploy)_

## ✨ Features

### Tenant Side
- Browse listings with filters (location, budget range, move-in date, type)
- View detailed property page with image gallery, amenities, house rules, and availability timeline
- Request property visit with preferred date and notes
- Track visit status: **Requested → Scheduled → Visited → Decision**
- Shortlist properties and compare 2–3 side-by-side

### Operations
- Move-in checklist with 3 steps:
  1. **Document uploads** (Aadhar, Employment proof, etc.)
  2. **Agreement confirmation**
  3. **Inventory list** with item condition tracking
- Request **stay extension** with reason
- **Support ticket system** with threaded messages and categories

### Admin Side
- Admin dashboard with stats (listings, visits, tickets, move-ins)
- Manage listings with status workflow: **Draft → Review → Published**
- Update visit statuses and schedule dates
- Reply to and resolve support tickets

## 🛠 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + Vite + TailwindCSS |
| Backend | Node.js + Express.js |
| Database | MongoDB Atlas + Mongoose |
| Auth | JWT (role-based: tenant/admin) |
| File Uploads | Cloudinary |
| Deployment | Vercel (frontend) + Render (backend) |

## 🚀 Setup Instructions

### Prerequisites
- Node.js 18+
- MongoDB Atlas account (free tier)
- Cloudinary account (free tier)

### Backend Setup

```bash
cd server
npm install
cp .env.example .env
# Fill in your MONGO_URI, JWT_SECRET, CLOUDINARY credentials
npm run dev
```

### Frontend Setup

```bash
cd client
npm install
cp .env.example .env
# Set VITE_API_URL=http://localhost:5000
npm run dev
```

### Seed Demo Data

```bash
cd server
node seed/seed.js
```

This creates:
- 10 sample properties across Mumbai, Bangalore, Hyderabad, Delhi
- Demo users (admin + 2 tenants)
- Sample visits and support tickets

## 🔑 Demo Credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@demo.com | demo123 |
| Tenant | tenant@demo.com | demo123 |
| Tenant 2 | tenant2@demo.com | demo123 |

## 📁 Project Structure

```
rental-platform/
├── client/          # React SPA (Vite + TailwindCSS)
│   └── src/
│       ├── pages/   # Landing, Browse, PropertyDetail, Compare, Dashboard, MoveIn, Support, Admin
│       ├── components/  # Navbar, PropertyCard, FilterBar, StatusBadge, ProtectedRoute
│       ├── context/ # AuthContext (JWT state)
│       └── api/     # Axios instance with JWT interceptor
└── server/          # Express REST API
    ├── models/      # User, Property, Visit, Shortlist, MoveIn, SupportTicket
    ├── routes/      # auth, properties, visits, shortlists, moveIn, support, admin
    ├── middleware/  # verifyToken, requireRole
    └── seed/        # Demo data seed script
```

## 📊 Database Schema

6 MongoDB collections:

- **User** — name, email, password (bcrypt), role (tenant/admin)
- **Property** — title, location, price, type, images, amenities, rules, availableFrom, status
- **Visit** — property, tenant, preferredDate, scheduledDate, status (requested→scheduled→visited→decision_pending)
- **Shortlist** — tenant (unique), properties array
- **MoveIn** — property, tenant, checklist (documents, agreement, inventory), extensionRequests, status
- **SupportTicket** — property, raisedBy, subject, messages (threaded), status

## 🌐 Deployment

### Backend (Render)
1. Create new Web Service on [render.com](https://render.com)
2. Connect GitHub repo, set root directory to `server`
3. Build command: `npm install` | Start command: `node index.js`
4. Add environment variables from `.env.example`

### Frontend (Vercel)
1. Import GitHub repo on [vercel.com](https://vercel.com)
2. Set root directory to `client`
3. Add `VITE_API_URL` environment variable (your Render URL)
4. Deploy

### Database (MongoDB Atlas)
1. Create free cluster at [mongodb.com/atlas](https://mongodb.com/atlas)
2. Get connection string → add to Render env vars as `MONGO_URI`
3. Allow all IP addresses in Network Access (0.0.0.0/0)
