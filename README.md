# TicketSys

A full-stack internal support ticketing system with role-based access control, audit logging, and a modern UI. Built with React, TypeScript, Express.js, PostgreSQL, and Prisma.

![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=flat&logo=typescript&logoColor=white)
![React](https://img.shields.io/badge/React-20232A?style=flat&logo=react&logoColor=61DAFB)
![Node.js](https://img.shields.io/badge/Node.js-339933?style=flat&logo=nodedotjs&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=flat&logo=postgresql&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-2D3748?style=flat&logo=prisma&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=flat&logo=tailwind-css&logoColor=white)

---

## Roles

| Role | Access |
|------|--------|
| Employee | Create and manage own tickets |
| Support | View, update, and resolve all tickets |
| Admin | Full access + user management + audit logs |

---

## Tech Stack

**Frontend**
- React 18 + TypeScript
- Vite
- Tailwind CSS + shadcn/ui
- React Router v6
- Axios
- React Hook Form + Zod
- Sonner (toasts)
- date-fns

**Backend**
- Node.js + Express.js + TypeScript
- Prisma ORM
- PostgreSQL
- JWT authentication
- bcrypt

---

## Demo Accounts

Run `npx prisma db seed` to populate the database with demo accounts and sample data.

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@ticketsys.com | Demo123! |
| Support | support@ticketsys.com | Demo123! |
| Employee | employee@ticketsys.com | Demo123! |

---

## Getting Started

### Option A — Docker (recommended)

> Requires Docker and Docker Compose installed.

```bash
git clone <your-repo-url>
cd ticketing-system

cp .env.example .env
# Edit .env with your values

docker compose up --build
```

| Service | URL |
|---------|-----|
| Frontend | http://localhost:3000 |
| Backend | http://localhost:8080 |
| PostgreSQL | localhost:5432 |

The seed script runs automatically on first boot.

---

### Option B — Manual setup

#### Prerequisites
- Node.js v18+
- PostgreSQL running locally

#### 1. Clone the repository

```bash
git clone <your-repo-url>
cd ticketing-system
```

#### 2. Backend

```bash
cd backend
npm install
cp .env.example .env
```

Edit `backend/.env`:

```env
DATABASE_URL=postgresql://postgres:yourpassword@localhost:5432/ticketsys
JWT_SECRET=your_jwt_secret_here
PORT=8080
```

```bash
npx prisma migrate dev --name init
npx prisma db seed
npm run dev
```

Backend runs on `http://localhost:8080`

#### 3. Frontend

```bash
cd ../frontend
npm install
cp .env.example .env
```

Edit `frontend/.env`:

```env
VITE_API_URL=http://localhost:8080
```

```bash
npm run dev
```

Frontend runs on `http://localhost:5173`

---

## API Endpoints

### Auth
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | /api/auth/register | Register new employee | Public |
| POST | /api/auth/login | Login | Public |

### Tickets
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | /api/tickets | List tickets (scoped by role) | Employee+ |
| GET | /api/tickets/stats/dashboard | Dashboard stats | Employee+ |
| GET | /api/tickets/:id | Get ticket detail | Employee+ |
| POST | /api/tickets | Create ticket | Employee+ |
| PATCH | /api/tickets/:id | Update ticket | Employee+ |
| DELETE | /api/tickets/:id | Delete ticket | Employee+ |

### Users
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | /api/users | List all users | Admin |
| POST | /api/users/support | Create support account | Admin |
| PATCH | /api/users/:id/role | Update user role | Admin |

### Audit Logs
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | /api/audit-logs | Get paginated audit logs | Admin |

---

## Project Structure

ticketing-system/

├── docker-compose.yml

├── .env.example

├── frontend/

│   ├── Dockerfile

│   ├── nginx.conf

│   └── src/

│       ├── components/

│       │   ├── layout/        # Sidebar, Header, DashboardLayout

│       │   ├── tickets/       # CreateTicketDrawer

│       │   └── ui/            # ConfirmModal, ThemeToggle

│       ├── context/           # AuthContext, ThemeContext

│       ├── pages/             # Dashboard, Tickets, TicketDetail, Users, AuditLogs

│       ├── routes/            # AppRoutes, ProtectedRoute, RoleRoute

│       └── services/          # auth.service.ts

└── backend/

├── Dockerfile

├── prisma/

│   ├── schema.prisma

│   └── seed.ts

└── src/

├── controllers/       # auth, ticket, user, auditLog, dashboard

├── middlewares/       # auth, role

├── routes/            # auth, ticket, user, auditLog

├── services/          # audit.service

└── utils/             # createAuditLog

---

## Features

- JWT authentication with role-based access control
- Ticket management with priority and status tracking
- Role-scoped ticket visibility (employees see only their own)
- Status-based ticket sections (Active / Resolved & Closed)
- Sliding drawer for create and edit ticket flows
- Confirmation modal for destructive actions
- Real-time dashboard stats
- Admin user management with role assignment
- Paginated audit log with action filtering
- Collapsible sidebar with role-based navigation
- Dark mode with persistent preference
- Seed script for instant demo setup

---

## Environment Variables

### Root `.env` (Docker only)

| Variable | Description |
|----------|-------------|
| POSTGRES_USER | PostgreSQL username |
| POSTGRES_PASSWORD | PostgreSQL password |
| POSTGRES_DB | Database name |
| JWT_SECRET | JWT signing secret |

### `backend/.env`

| Variable | Description |
|----------|-------------|
| DATABASE_URL | PostgreSQL connection string |
| JWT_SECRET | JWT signing secret |
| PORT | Server port (default: 8080) |

### `frontend/.env`

| Variable | Description |
|----------|-------------|
| VITE_API_URL | Backend base URL |

---

## Notes

- PostgreSQL was chosen over MySQL for native ENUM support and stronger data integrity
- All `.env` files are gitignored
- The seed script uses `upsert` so it's safe to run multiple times