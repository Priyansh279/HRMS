# HRMS – Human Resource Management System

hello this is priyansh

A centralized, role-based MERN stack web application for managing employee lifecycle operations.

## Features

- **Employee (Customer) Portal** – Self-service: profile, leave requests, attendance (check-in/check-out).
- **Admin Portal** – HR/Admin: employee management, leave approval/rejection, attendance overview.
- **Authentication** – JWT-based login; role-based routing (employee vs admin).
- **Tech** – Backend: Node.js, Express, TypeScript, MongoDB (Mongoose). Frontend: React, TypeScript/TSX, Vite.

## Project structure

```
HRMS/
├── backend/          # Express API (TypeScript)
│   ├── src/
│   │   ├── config/
│   │   ├── middleware/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── types/
│   │   └── server.ts
│   ├── .env.example
│   ├── package.json
│   └── tsconfig.json
├── frontend/          # React app (TypeScript/TSX)
│   ├── src/
│   │   ├── api/
│   │   ├── components/
│   │   ├── context/
│   │   ├── pages/
│   │   │   ├── admin/
│   │   │   └── employee/
│   │   ├── types/
│   │   ├── App.tsx
│   │   ├── main.tsx
│   │   └── index.css
│   ├── index.html
│   ├── package.json
│   └── vite.config.ts
└── README.md
```

## Setup

### Prerequisites

- Node.js 18+
- MongoDB (local or Atlas)

### Backend

```bash
cd backend
cp .env.example .env
# Edit .env: set MONGODB_URI and JWT_SECRET
npm install
npm run dev
```

API runs at `http://localhost:5000`.

### Frontend

```bash
cd frontend
npm install
npm run dev
```

App runs at `http://localhost:5173`. Vite proxies `/api` to the backend.

### First-time usage

1. **Seed an admin user** (from `backend` folder):
   ```bash
   npm run seed:admin
   ```
   This creates `admin@hrms.com` / `Admin123!` (change password in production).

2. **Log in** at the app with that admin account. You will be redirected to the Admin portal.

3. **Add employees** via Admin → Employees → Add employee. Set email and initial password. Those users can then log in to the Employee portal.

Alternatively, register via API: `POST /api/auth/register` with `{ "email": "admin@company.com", "password": "yourpassword", "role": "admin" }`.

## API overview

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | /api/auth/register | - | Register (email, password, optional role) |
| POST | /api/auth/login | - | Login (email, password) |
| GET | /api/auth/me | Yes | Current user + employee profile |
| GET | /api/employees | Admin | List all employees |
| GET | /api/employees/me | Yes | Current user’s employee profile |
| GET | /api/employees/:id | Yes | Get employee (admin: any; employee: self) |
| POST | /api/employees | Admin | Create employee (+ user) |
| PUT | /api/employees/:id | Admin | Update employee |
| GET | /api/leave | Yes | List leave (admin: all; employee: own) |
| POST | /api/leave | Employee | Create leave request |
| PATCH | /api/leave/:id/approve | Admin | Approve leave |
| PATCH | /api/leave/:id/reject | Admin | Reject leave |
| GET | /api/attendance | Yes | List attendance (query: employeeId, from, to) |
| POST | /api/attendance/check-in | Employee | Check in |
| POST | /api/attendance/check-out | Employee | Check out |
| PUT | /api/attendance/:id | Admin | Update attendance record |

## All files in TypeScript/TSX

- Backend: `.ts` (no JS).
- Frontend: `.ts` for non-React code, `.tsx` for React components.
