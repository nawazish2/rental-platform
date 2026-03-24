# 🏠 RentEase — Rental Listings & Move-in Platform

> **Cohort 26 Buildathon · Web Dev · Problem Statement 2**

A full-stack rental housing platform built with the MERN stack — covering property discovery, visit scheduling, move-in workflows, reviews, notifications, payments, and multi-role access.

## 🔗 Live Links

- **Frontend**: _Add Vercel URL after deploy_
- **Backend API**: _Add Render URL after deploy_
- **GitHub**: _Your repo URL here_

---

## ✨ Features

### 🏠 Tenant Side
- Browse 74+ listings with filters (location, budget range, type, move-in date)
- View detailed property pages — gallery, amenities, rules, availability calendar
- Request property visits with preferred date + notes
- Track visit status: **Requested → Scheduled → Visited → Decision**
- Shortlist properties and **compare 2–3 side-by-side**
- Leave **star ratings & reviews** (visit required)
- **Move-in checklist**: document uploads, agreement confirmation, inventory list
- Request **stay extension** with reason
- Request **move-out** with preferred date (admin approval flow)
- **Support tickets** with threaded messages and categories
- **Payment history** — rent, deposit, maintenance tracking
- **Notification bell** — real-time updates on visit/ticket status changes
- **Profile page** — edit name, phone, avatar

### 🏢 Property Owner Side
- Register as a Property Owner
- Add/edit/delete your own listings
- View tenant visit inquiries on your properties
- Listings go through Admin review before publishing

### ⚙️ Admin Side
- Dashboard with live stats (properties, visits, tickets, move-ins)
- **Manage Listings** — Add, publish, review, delete; status: Draft → Review → Published
- **Manage Visits** — Update visit status, schedule dates
- **Support Tickets** — Threaded replies, resolve tickets
- **Move-Out Requests** — Approve or reject tenant move-out requests

---

## 🛠 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + Vite + TailwindCSS |
| Backend | Node.js + Express.js |
| Database | MongoDB Atlas + Mongoose |
| Auth | JWT (role-based: tenant / owner / admin) |
| File Uploads | Cloudinary |
| Deployment | Vercel (frontend) + Render (backend) |

---

## 🚀 Setup Instructions

### Prerequisites
- Node.js 18+
- MongoDB Atlas account
- Cloudinary account

### 1. Clone & Install

```bash
git clone <your-repo-url>
cd rental-platform

# Install backend deps
cd server && npm install

# Install frontend deps
cd ../client && npm install
```

### 2. Backend Environment (`server/.env`)

```env
MONGO_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/rentease
JWT_SECRET=your_jwt_secret_here
PORT=5001
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

### 3. Frontend Environment (`client/.env`)

```env
VITE_API_URL=http://localhost:5001
```

### 4. Seed Demo Data

```bash
cd server
node seed/seed.js
```

Creates **74 properties** across 8 Indian cities + demo users.

### 5. Run Locally

```bash
# Terminal 1 — backend
cd server && npm run dev

# Terminal 2 — frontend
cd client && npm run dev
```

---

## 🔑 Demo Credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | nawazish@gmail.com | admin@macbook |
| Tenant | tenant@demo.com | demo123 |
| Tenant 2 | tenant2@demo.com | demo123 |

---

## 📁 Project Structure

```
rental-platform/
├── client/                  # React SPA (Vite + TailwindCSS)
│   └── src/
│       ├── pages/
│       │   ├── Landing.jsx
│       │   ├── Browse.jsx
│       │   ├── PropertyDetail.jsx
│       │   ├── Compare.jsx
│       │   ├── TenantDashboard.jsx
│       │   ├── MoveIn.jsx
│       │   ├── SupportTickets.jsx
│       │   ├── Profile.jsx
│       │   ├── OwnerDashboard.jsx
│       │   └── admin/
│       │       ├── AdminDashboard.jsx
│       │       ├── AdminListings.jsx
│       │       ├── AdminVisits.jsx
│       │       ├── AdminTickets.jsx
│       │       └── AdminMoveOut.jsx
│       ├── components/
│       │   ├── Navbar.jsx
│       │   ├── PropertyCard.jsx
│       │   ├── FilterBar.jsx
│       │   ├── StatusBadge.jsx
│       │   ├── StarRating.jsx
│       │   ├── NotificationBell.jsx
│       │   ├── AvailabilityCalendar.jsx
│       │   └── ProtectedRoute.jsx
│       ├── context/         # AuthContext (JWT state)
│       └── api/             # Axios instance with JWT interceptor
└── server/                  # Express REST API
    ├── models/              # User, Property, Visit, Shortlist, MoveIn, SupportTicket, Review, Notification, Payment
    ├── routes/              # auth, properties, visits, shortlists, moveIn, support, reviews, notifications, payments, admin
    ├── middleware/          # verifyToken, requireRole
    ├── utils/               # cloudinary config
    └── seed/                # 74-property demo seed script
```

---

## 📊 Database Schema

**9 MongoDB collections:**

| Model | Key Fields |
|-------|-----------|
| User | name, email, password (bcrypt), role (tenant/owner/admin), avatar |
| Property | title, location, city, price, type, images, amenities, rules, availableFrom, blockedDates, status, createdBy |
| Visit | property, tenant, preferredDate, scheduledDate, notes, status |
| Shortlist | tenant, properties[] |
| MoveIn | property, tenant, checklist (docs/agreement/inventory), extensionRequests, moveOut, status |
| SupportTicket | property, raisedBy, subject, messages[] (threaded), category, status |
| Review | property, tenant, rating, comment (unique per tenant+property, visit-gated) |
| Notification | user, type, title, message, link, read |
| Payment | tenant, property, amount, type, status, month |

---

## 🌐 Deployment Guide

### Backend → Render
1. Go to [render.com](https://render.com) → **New → Web Service**
2. Connect GitHub repo → Root directory: `server`
3. Build command: `npm install`
4. Start command: `node index.js`
5. Add all env vars from `server/.env`
6. After deploy → copy the Render URL

### Frontend → Vercel
1. Go to [vercel.com](https://vercel.com) → **New Project**
2. Connect GitHub repo → Root directory: `client`
3. Add env var: `VITE_API_URL=https://your-render-url.onrender.com`
4. Deploy → copy the Vercel URL

### Post-Deploy
- Update this README with both live URLs
- Run seed on production: call the seed script once with production `MONGO_URI`
- Test all flows end-to-end on the live URL


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
