# RentEase

RentEase is a full-stack MERN rental housing platform built for a college major-project setting. It covers the complete tenant journey from property discovery to visits, support, payments, and move-in operations, while also supporting owner and admin workflows.

## Why This Project Works Well For College

- Solves a real-world housing and operations problem instead of basic CRUD only
- Demonstrates full-stack development with authentication, role-based access, cloud uploads, and deployment readiness
- Includes multiple actors: tenant, owner, and admin
- Uses structured data models, notifications, reporting-ready documentation, and real-time updates

## Core Modules

### Tenant

- Browse rental listings with search and filters
- Compare up to 3 properties side by side
- Request property visits
- Track visit status updates
- Save shortlisted properties
- Manage move-in checklist, agreement, inventory, extension, and move-out request
- Raise support tickets and review properties after visits
- View payment records and live notifications

### Owner

- Create and manage own property listings
- View visit enquiries on owned properties
- Receive notifications when listing status changes

### Admin

- View platform statistics
- Review, publish, and manage listings
- Manage visit requests and schedules
- Resolve support tickets
- Manage move-out and extension decisions
- Create and confirm payment records

## Tech Stack

- Frontend: React 18, Vite, Tailwind CSS, React Router, Axios, Socket.IO Client
- Backend: Node.js, Express, Mongoose, JWT, bcryptjs, Multer, Cloudinary, Socket.IO
- Database: MongoDB Atlas / MongoDB
- Deployment: Vercel for frontend, Render for backend

## Architecture

```text
React SPA (client)
  -> Axios / Socket.IO
Express API + Socket.IO server (server)
  -> Mongoose models
MongoDB

Cloudinary
  <- image and document uploads
```

## Improvements Added

The project was upgraded to be stronger for evaluation and viva:

- Added missing schema fields such as `avatar`, `bedrooms`, `bathrooms`, `area`, and `moveInDate`
- Added reusable backend request validation with `express-validator`
- Added real-time notifications using Socket.IO instead of polling only
- Added deployment-ready configuration files for Render and Vercel
- Added proper environment templates for both frontend and backend
- Rewrote documentation and added a college-project report with diagrams

## Project Structure

```text
rental-platform/
├── client/
│   ├── src/
│   │   ├── api/
│   │   ├── components/
│   │   ├── context/
│   │   └── pages/
│   ├── .env.example
│   └── vercel.json
├── server/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── seed/
│   ├── services/
│   ├── utils/
│   ├── validators/
│   └── .env.example
├── docs/
├── render.yaml
└── package.json
```

## Local Setup

### 1. Install Dependencies

```bash
npm install
npm install --prefix server
npm install --prefix client
```

### 2. Configure Environment Variables

Backend: create `server/.env`

```env
MONGO_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/rentease
JWT_SECRET=replace_with_a_long_random_secret
PORT=5000
CLIENT_URL=http://localhost:5173
CORS_ORIGINS=http://localhost:5173
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

Frontend: create `client/.env`

```env
VITE_API_URL=http://localhost:5000
VITE_SOCKET_URL=http://localhost:5000
```

### 3. Seed Demo Data

```bash
npm run seed
```

### 4. Run The Project

```bash
npm run dev
```

This starts:

- backend on `http://localhost:5000`
- frontend on `http://localhost:5173`

## Demo Credentials

These come from `server/seed/seed.js`.

- Admin: `nawazish@gmail.com` / `admin@macbook`
- Tenant: `tenant@demo.com` / `demo123`
- Tenant 2: `tenant2@demo.com` / `demo123`

## API Highlights

- `POST /api/auth/register` and `POST /api/auth/login`
- `GET /api/properties` and `GET /api/properties/compare`
- `POST /api/visits`
- `POST /api/movein`
- `POST /api/support`
- `GET /api/notifications/my`
- `POST /api/payments`
- `GET /api/admin/stats`

## Real-Time Notifications

Notifications now work in two ways:

- REST endpoints for initial load and read/unread state
- Socket.IO events for instant notification delivery after backend actions

Examples of real-time updates:

- visit status changed by admin
- support reply posted by admin
- payment created or marked paid
- extension or move-out request processed
- property listing status changed

## Deployment

### Backend on Render

The repository now includes `render.yaml`. You can deploy the API from the repo root or by selecting the `server` directory.

Required environment variables:

- `MONGO_URI`
- `JWT_SECRET`
- `CLIENT_URL`
- `CORS_ORIGINS`
- `CLOUDINARY_CLOUD_NAME`
- `CLOUDINARY_API_KEY`
- `CLOUDINARY_API_SECRET`

### Frontend on Vercel

Set the project root to `client` and add:

- `VITE_API_URL=https://your-render-backend-url`
- `VITE_SOCKET_URL=https://your-render-backend-url`

The included `client/vercel.json` handles SPA route rewrites.

## Suggested Screenshots For Submission

Add screenshots to your report for:

- Landing page
- Browse properties page
- Property detail page
- Tenant dashboard
- Owner dashboard
- Admin dashboard
- Move-in workflow
- Support tickets
- Notification dropdown

## Viva / Presentation Highlights

When presenting, emphasize:

- role-based authentication
- REST API + real-time socket communication
- cloud file upload integration
- schema design with multiple related collections
- modular backend with middleware, validators, and service layer
- deployment readiness for real-world use

## Next Step For Final Submission

The codebase is now project-ready, but you should still do one final thing before viva:

- deploy the frontend and backend using your own Vercel and Render accounts
- capture screenshots from the live system
- export the report in PDF after adding your name, roll number, and guide details
