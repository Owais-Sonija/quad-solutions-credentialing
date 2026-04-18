# Quad Solutions — Medical Credentialing Management System

## Live Demo
- Frontend: [To be added after deployment]
- Backend API: [To be added after deployment]

### Demo Credentials
| Account | Email | Password |
|---|---|---|
| Demo User | demo@quadsolutions.com | Demo@1234 |
| Demo Admin | demoadmin@quadsolutions.com | DemoAdmin@1234 |
| Real Admin | admin@quadsolutions.com | Admin@1234 |

> Demo accounts have limited functionality. 
> Passwords cannot be changed on demo accounts.
> Demo user data auto-resets after 20 requests.

## Project Overview
Quad Solutions Medical Credentialing Management System is a 
full-stack web application built for managing medical 
credentialing operations and client onboarding. Built as part 
of the DevelopersHub Corporation Full-Stack Development 
Internship Task (3 Weeks).

## Tech Stack

### Frontend
- React 18 + TypeScript
- Vite
- Tailwind CSS v3
- Zustand (state management)
- Axios (HTTP client)
- React Router v6
- Recharts (analytics charts)

### Backend
- Node.js + Express + TypeScript
- PostgreSQL (database)
- JWT (authentication)
- Multer (file uploads, max 1MB)
- bcrypt (password hashing)
- express-validator (input validation)
- express-rate-limit (rate limiting)

### Infrastructure
- Frontend: Vercel
- Backend: Render
- Database: Railway (PostgreSQL)

## Features

### User Side
- Client registration and secure login
- Multi-step credentialing request submission
- Document upload (PDF, JPG, PNG — max 1MB, 2 files per request)
- Real-time application status tracking with polling (15s)
- Status history timeline with admin notes
- User profile management
- Contact support page
- Live updates indicator with pause/resume

### Admin Panel
- Secure admin authentication (separate from users)
- Dashboard with analytics and real-time stats (60s polling)
- Advanced analytics with charts (Recharts)
  - Requests by specialty (bar chart)
  - Status distribution (pie chart)
  - Requests over time (area chart)
  - Document type breakdown
- View and manage all client applications (30s polling)
- Update application status with notes and audit trail
- Document management (view, download, delete)
- User management with detailed profiles and request history
- Admin profile management

### Security
- JWT authentication with 7-day expiry
- Role-based access control (Admin/User)
- bcrypt password hashing (10 rounds)
- Input validation and sanitization
- NSFW/profanity content filtering
- File type and extension validation
- Double extension attack prevention
- Rate limiting (global: 200/15min, auth: 15/15min)
- Request body size limit (1MB)
- Request timeout (30s)
- Demo accounts cannot change passwords
- English-only name validation

## Project Structure
quad-solutions/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   └── db.ts              # PostgreSQL pool config
│   │   ├── controllers/
│   │   │   ├── auth.controller.ts
│   │   │   ├── request.controller.ts
│   │   │   ├── document.controller.ts
│   │   │   └── admin.controller.ts
│   │   ├── middleware/
│   │   │   ├── auth.middleware.ts
│   │   │   ├── upload.middleware.ts
│   │   │   ├── validate.middleware.ts
│   │   │   └── contentFilter.middleware.ts
│   │   ├── routes/
│   │   │   ├── auth.routes.ts
│   │   │   ├── user.routes.ts
│   │   │   └── admin.routes.ts
│   │   ├── types/
│   │   │   └── index.ts
│   │   └── server.ts
│   ├── uploads/              # Uploaded files (gitignored)
│   ├── schema.sql            # Database schema
│   ├── .env.example
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── api/
│   │   │   └── axios.ts          # Axios instance
│   │   ├── components/
│   │   │   ├── layout/
│   │   │   │   ├── Navbar.tsx
│   │   │   │   ├── PublicNavbar.tsx
│   │   │   │   ├── PublicFooter.tsx
│   │   │   │   └── ProtectedRoute.tsx
│   │   │   └── ui/
│   │   │       ├── Toast.tsx
│   │   │       ├── LoadingSpinner.tsx
│   │   │       ├── ConfirmDialog.tsx
│   │   │       └── LiveIndicator.tsx
│   │   ├── data/
│   │   │   └── constants.ts      # US states, specialties etc
│   │   ├── hooks/
│   │   │   ├── useToast.ts
│   │   │   └── usePolling.ts
│   │   ├── pages/
│   │   │   ├── Landing.tsx
│   │   │   ├── Login.tsx
│   │   │   ├── Register.tsx
│   │   │   ├── Dashboard.tsx
│   │   │   ├── SubmitRequest.tsx
│   │   │   ├── RequestDetail.tsx
│   │   │   ├── Profile.tsx
│   │   │   ├── ContactSupport.tsx
│   │   │   ├── NotFound.tsx
│   │   │   └── admin/
│   │   │       ├── AdminLogin.tsx
│   │   │       ├── AdminDashboard.tsx
│   │   │       ├── AdminAnalytics.tsx
│   │   │       ├── AdminRequests.tsx
│   │   │       ├── AdminRequestDetail.tsx
│   │   │       ├── AdminDocuments.tsx
│   │   │       ├── AdminUsers.tsx
│   │   │       └── AdminProfile.tsx
│   │   ├── store/
│   │   │   └── authStore.ts
│   │   ├── types/
│   │   │   └── index.ts
│   │   └── App.tsx
│   ├── .env.example
│   └── package.json
└── README.md

## Prerequisites
- Node.js v18 or higher
- PostgreSQL 16
- npm

## Local Setup

### 1. Clone the repository
git clone https://github.com/Owais-Sonija/quad-solutions-credentialing.git
cd quad-solutions-credentialing

### 2. Backend Setup
cd backend
npm install
cp .env.example .env

### 3. Configure backend .env
DATABASE_URL=postgresql://user:password@host:port/dbname
JWT_SECRET=your-secret-key-minimum-32-characters
PORT=3000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173

### 4. Setup Database
Run schema.sql against your PostgreSQL database:
psql "your-database-url" -f schema.sql

Default credentials after setup:
- Admin: admin@quadsolutions.com / Admin@1234
- Demo User: auto-created on first server start
- Demo Admin: auto-created on first server start

### 5. Start Backend
npm run dev
Backend: http://localhost:3000

### 6. Frontend Setup
cd ../frontend
npm install
cp .env.example .env

### 7. Configure frontend .env
VITE_API_URL=http://localhost:3000/api

### 8. Start Frontend
npm run dev
Frontend: http://localhost:5173

## API Documentation

### Base URL
Development: http://localhost:3000/api
Production: https://your-render-url.onrender.com/api

### Authentication
POST /api/auth/register
  Body: { name, email, password, phone? }
  Returns: { token, user }

POST /api/auth/login
  Body: { email, password }
  Returns: { token, user }

POST /api/auth/admin/login
  Body: { email, password }
  Returns: { token, admin }

### User Endpoints (Bearer token required)
GET    /api/user/requests
GET    /api/user/requests/:id
POST   /api/user/requests
POST   /api/user/requests/:id/documents
GET    /api/user/requests/:id/documents
GET    /api/user/profile
PATCH  /api/user/profile
PATCH  /api/user/profile/change-password

### Admin Endpoints (Admin Bearer token required)
GET    /api/admin/stats
GET    /api/admin/analytics
GET    /api/admin/requests
GET    /api/admin/requests/:id
PATCH  /api/admin/requests/:id/status
GET    /api/admin/documents
DELETE /api/admin/documents/:id
GET    /api/admin/users
GET    /api/admin/users/:id
GET    /api/admin/profile
PATCH  /api/admin/profile
PATCH  /api/admin/profile/change-password

### Health Check
GET /api/health
Returns: { status: 'ok', timestamp }

## Environment Variables

### Backend
| Variable | Description | Required |
|---|---|---|
| DATABASE_URL | PostgreSQL connection string | Yes |
| JWT_SECRET | JWT signing secret (min 32 chars) | Yes |
| PORT | Server port | No (default 3000) |
| NODE_ENV | development or production | Yes |
| FRONTEND_URL | Frontend URL for CORS | Yes |

### Frontend
| Variable | Description | Required |
|---|---|---|
| VITE_API_URL | Backend API base URL | Yes |

## Rate Limits
| Route | Limit |
|---|---|
| All routes | 200 requests per 15 minutes |
| Auth routes | 15 requests per 15 minutes |
| File uploads | 20 uploads per hour |

## File Upload Restrictions
- Allowed types: PDF, JPG, PNG only
- Maximum file size: 1MB per file
- Maximum files per request: 2
- Double extensions blocked
- Malicious filenames sanitized

## Database Schema
5 tables:
- users: Healthcare provider accounts
- admins: System administrator accounts
- credentialing_requests: Submitted applications
- documents: Uploaded files linked to requests
- status_history: Full audit trail of status changes

## Evaluation Criteria Coverage
| Criteria | Implementation |
|---|---|
| System Architecture | RESTful API, MVC pattern, separated concerns |
| Functionality | All required features + advanced enhancements |
| API Design | Documented REST endpoints, proper HTTP codes |
| UI/UX | Responsive Tailwind design, loading states, toasts |
| Code Quality | TypeScript strict mode, constants file, reusable components |
| Deployment | Vercel + Render + Railway |

## Advanced Enhancements Implemented
- Role-based dashboards (User + Admin with different views)
- Real-time updates via polling (15s/30s/60s intervals)
- Advanced analytics dashboard with Recharts
- Live indicator with pause/resume functionality
- Demo accounts with auto-cleanup

## Developer
Name: Dr Owais Sonija
Internship: DevelopersHub Corporation
Project: Quad Solutions Medical Credentialing System
Duration: 3 Weeks
Deadline: April 28, 2026
