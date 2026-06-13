# Simple Ticketing System

An internal support ticketing system with role-based access control, built with React, Express.js, PostgreSQL, and Prisma.

## Roles

| Role | Access |
|------|--------|
| Employee | Create and manage own tickets |
| Support | View, update, filter, and close all tickets |
| Admin | Full control + user management + audit logs |

## Tech Stack

- **Frontend:** React.js, React Router, Axios, Vite
- **Backend:** Node.js, Express.js
- **Database:** PostgreSQL (via Prisma ORM)
- **Auth:** JWT (JSON Web Tokens)

> Note: The spec suggests MySQL — PostgreSQL was chosen for its native ENUM support and stronger data integrity features.

## Prerequisites

- Node.js v18+
- PostgreSQL running locally
- npm or yarn

## Setup Instructions

### 1. Clone the repository

```bash
git clone <your-repo-url>
cd ticketing-system
```

### 2. Backend setup

```bash
cd backend
npm install
cp .env.example .env
```

Edit `.env` and fill in your PostgreSQL credentials and JWT secret.

```bash
npx prisma migrate dev --name init
npx prisma generate
npm run dev
```

Backend runs on `http://localhost:5000`

### 3. Frontend setup

```bash
cd ../frontend
npm install
cp .env.example .env
npm run dev
```

Frontend runs on `http://localhost:5173`

## API Endpoints

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | /api/auth/register | Register employee | Public |
| POST | /api/auth/login | Login | Public |
| GET | /api/tickets | Get all tickets | Employee+ |
| GET | /api/tickets/:id | Get single ticket | Employee+ |
| POST | /api/tickets | Create ticket | Employee+ |
| PUT | /api/tickets/:id | Update ticket | Employee+ |
| DELETE | /api/tickets/:id | Delete ticket | Employee+ |
| GET | /api/users | Get all users | Admin |
| POST | /api/users/support | Create support account | Admin |
| PATCH | /api/users/:id/role | Update user role | Admin |
| GET | /api/audit-logs | Get audit logs | Admin |

## Project Structure

```
ticketing-system/
├── frontend/
│   └── src/
│       ├── components/     # Reusable UI components
│       ├── context/        # Auth context + global state
│       ├── features/       # Domain-specific logic
│       ├── hooks/          # Custom React hooks
│       ├── layouts/        # Page layout wrappers
│       ├── pages/          # Route-level pages
│       ├── services/       # Axios API calls
│       └── utils/          # Helper functions
└── backend/
    ├── prisma/
    │   └── schema.prisma   # Database schema + migrations
    └── src/
        ├── controllers/    # Request handlers
        ├── middlewares/    # Auth, role, validation
        ├── routes/         # Express route definitions
        ├── services/       # Business logic
        ├── validations/    # Input validation schemas
        └── utils/          # Shared utilities
```

## Environment Variables

See `backend/.env.example` and `frontend/.env.example` for required variables. Never commit `.env` files.

## Git

`.env` files are gitignored. No credentials are hardcoded anywhere in the codebase.
