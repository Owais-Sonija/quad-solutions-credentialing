# Quad Solutions — Medical Credentialing Management System

## Project Overview
Quad Solutions is a comprehensive, full-stack web application designed for managing medical credentialing operations intuitively and securely. The platform efficiently bridges the gap between healthcare providers submitting credentialing requests and administrators managing complex verification workflows. This system guarantees streamlined communication, centralized document management, and dynamic status tracking, built explicitly as part of a DevelopersHub internship task.

## Tech Stack
### Frontend
- React 18 + TypeScript
- Vite
- Tailwind CSS
- Zustand (state management)
- Axios (HTTP client)
- React Router v6

### Backend
- Node.js + Express + TypeScript
- PostgreSQL (database)
- JWT (authentication)
- Multer (file uploads)
- bcrypt (password hashing)
- express-validator (input validation)

### Deployment
- Frontend: Vercel
- Backend: Render
- Database: Railway (PostgreSQL)

## Features
### User Side
- Client registration and secure login
- Multi-step credentialing request submission
- Document upload (PDF, JPG, PNG)
- Real-time application status tracking
- Status history timeline
- User profile management
- Contact support page

### Admin Panel
- Secure admin authentication
- Dashboard with analytics (total, pending, approved, rejected)
- View and manage all client applications
- Update application status with notes
- Document management (view, download, delete)
- User management with detailed profiles
- Admin profile management

## Project Structure
```text
quad-solutions/
├── backend/
│   ├── src/
│   │   ├── config/         # Database configuration
│   │   ├── controllers/    # Route handlers
│   │   ├── middleware/     # Auth, upload middleware
│   │   ├── routes/         # API routes
│   │   ├── types/          # TypeScript interfaces
│   │   └── server.ts       # Entry point
│   ├── uploads/            # Uploaded files
│   ├── schema.sql          # Database schema
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── api/            # Axios configuration
│   │   ├── components/     # Reusable components
│   │   ├── data/           # Constants and static data
│   │   ├── hooks/          # Custom React hooks
│   │   ├── pages/          # Page components
│   │   ├── store/          # Zustand auth store
│   │   ├── types/          # TypeScript interfaces
│   │   └── App.tsx         # Routes configuration
│   └── package.json
└── README.md
```

## Prerequisites
- Node.js v18 or higher
- PostgreSQL 16
- npm or yarn

## Local Setup Instructions

### 1. Clone the repository
```bash
git clone https://github.com/Owais-Sonija/quad-solutions-credentialing.git
cd quad-solutions-credentialing
```

### 2. Backend Setup
```bash
cd backend
npm install
cp .env.example .env
```

Fill in your `.env` file:
```env
DATABASE_URL=postgresql://user:password@host:port/dbname
JWT_SECRET=your-secret-key-minimum-32-characters
PORT=3000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
```

### 3. Database Setup
Run `schema.sql` against your PostgreSQL database:
```bash
psql "your-database-url" -f schema.sql
```

Or paste contents into your Railway/Supabase query editor.

**Default admin credentials:**
- Email: admin@quadsolutions.com
- Password: Admin@1234

### 4. Start Backend
```bash
npm run dev
```
Backend runs on: `http://localhost:3000`

### 5. Frontend Setup
```bash
cd ../frontend
npm install
cp .env.example .env
```

Fill in your `.env`:
```env
VITE_API_URL=http://localhost:3000/api
```

### 6. Start Frontend
```bash
npm run dev
```
Frontend runs on: `http://localhost:5173`

## API Documentation

### Authentication
- `POST /api/auth/register`
  - Body: `{ name, email, password, phone? }`
  - Returns: `{ token, user }`
- `POST /api/auth/login`
  - Body: `{ email, password }`
  - Returns: `{ token, user }`
- `POST /api/auth/admin/login`
  - Body: `{ email, password }`
  - Returns: `{ token, admin }`

### User Endpoints (require Bearer token, role: user)
- `GET    /api/user/requests` - Returns: Array of user's credentialing requests with doc count
- `POST   /api/user/requests` - Body: `{ specialty, npi_number, license_state, request_type, notes? }` - Returns: Created request
- `GET    /api/user/requests/:id` - Returns: Request + documents + status history
- `POST   /api/user/requests/:id/documents` - Body: `FormData { file, doc_type }` - Returns: Created document record
- `GET    /api/user/requests/:id/documents` - Returns: Array of documents
- `GET    /api/user/profile` - Returns: User info + request stats
- `PATCH  /api/user/profile` - Body: `{ name, phone? }` - Returns: Updated user
- `PATCH  /api/user/profile/change-password` - Body: `{ currentPassword, newPassword }` - Returns: `{ message }`

### Admin Endpoints (require Bearer token, role: admin)
- `GET    /api/admin/stats` - Returns: `{ total, pending, in_review, approved, rejected, recent_requests }`
- `GET    /api/admin/requests` - Query params: `status?, page?, limit?` - Returns: Paginated requests with user info
- `GET    /api/admin/requests/:id` - Returns: Full request + user + documents + status history
- `PATCH  /api/admin/requests/:id/status` - Body: `{ status, note? }` - Returns: Updated request
- `GET    /api/admin/documents` - Query params: `doc_type?, request_status?` - Returns: All documents with user and request info
- `DELETE /api/admin/documents/:id` - Returns: `{ message }`
- `GET    /api/admin/users` - Query params: `search?` - Returns: All users with request counts
- `GET    /api/admin/users/:id` - Returns: User + requests + stats
- `GET    /api/admin/profile` - Returns: Admin info + system stats
- `PATCH  /api/admin/profile` - Body: `{ name }` - Returns: Updated admin
- `PATCH  /api/admin/profile/change-password` - Body: `{ currentPassword, newPassword }` - Returns: `{ message }`

## Environment Variables

### Backend (.env)
| Variable | Description | Example |
|---|---|---|
| DATABASE_URL | PostgreSQL connection string | postgresql://... |
| JWT_SECRET | Secret for JWT signing | min 32 chars |
| PORT | Server port | 3000 |
| NODE_ENV | Environment | development |
| FRONTEND_URL | Frontend URL for CORS | http://localhost:5173 |

### Frontend (.env)
| Variable | Description | Example |
|---|---|---|
| VITE_API_URL | Backend API URL | http://localhost:3000/api |

## Default Credentials
**Admin Login:**
- Email: admin@quadsolutions.com
- Password: Admin@1234

## Database Schema
5 tables:
- `users`: Registered healthcare providers
- `admins`: System administrators  
- `credentialing_requests`: Submitted credentialing applications
- `documents`: Uploaded files linked to requests
- `status_history`: Audit trail of all status changes

## Evaluation Criteria Met
- System Architecture and Design ✓
- Functionality and Feature Implementation ✓
- API Design and Integration ✓
- UI/UX and Responsiveness ✓
- Code Quality and Structure ✓
- Deployment and Completeness ✓

## Developer
- **Built by:** Dr Owais Sonija
- **Internship:** DevelopersHub Corporation
- **Duration:** 3 Weeks
- **Deadline:** April 28, 2026
