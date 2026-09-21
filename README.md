# TaskFlow — Full Stack Project & Task Management Application

TaskFlow is a modern, responsive full-stack project and task management application inspired by Trello and Jira. It empowers teams to organize projects, prioritize tasks, assign work, track deadlines, and visualize progress across interactive Kanban boards and data tables.

---

## 1. System Architecture

```
                    USER
                      │
                      ▼
             React/Vite Frontend
                   (Vercel)
                      │
                  HTTPS/REST
                      │
                      ▼
             Node.js + Express
                   (Render)
                      │
                      ▼
                 Prisma ORM
                      │
                      ▼
                PostgreSQL
                   (Neon)
```

---

## 2. Final Repository Structure

```
TaskFlow/
├── frontend/                     # React 19 + Vite frontend
│   ├── src/
│   │   ├── api/                  # Axios REST API service layer
│   │   │   ├── client.js         # Centralized Axios instance with Bearer JWT interceptor
│   │   │   ├── auth.js           # Auth service endpoints (login, register, me, logout)
│   │   │   ├── projects.js       # Projects service endpoints
│   │   │   ├── tasks.js          # Tasks service endpoints (query filtering & pagination)
│   │   │   └── users.js          # Users and profile service endpoints
│   │   ├── components/           # UI components, modals, Kanban board, tables
│   │   ├── context/              # AuthContext, AppContext, ThemeContext, ToastContext
│   │   ├── data/                 # Constants & fallback seed data
│   │   ├── pages/                # Dashboard, Projects, Tasks, Profile, Settings, etc.
│   │   └── utils/                # Date and formatting helpers
│   ├── public/                   # Static public assets
│   ├── package.json
│   ├── vite.config.js
│   ├── .env.example
│   └── .env
│
├── backend/                      # Node.js + Express REST API
│   ├── src/
│   │   ├── config/
│   │   │   ├── env.js            # Environment variable validation & defaults
│   │   │   └── prisma.js         # Singleton Prisma client instance
│   │   ├── controllers/
│   │   │   ├── authController.js
│   │   │   ├── projectController.js
│   │   │   ├── taskController.js
│   │   │   ├── userController.js
│   │   │   └── dashboardController.js # Dedicated dashboard analytics controller
│   │   ├── middleware/
│   │   │   ├── authMiddleware.js     # JWT Bearer token authentication
│   │   │   ├── errorMiddleware.js    # Centralized error handler (400, 401, 403, 404, 409, 422, 500)
│   │   │   └── notFoundMiddleware.js # Standard 404 JSON response
│   │   ├── routes/
│   │   │   ├── authRoutes.js
│   │   │   ├── projectRoutes.js
│   │   │   ├── taskRoutes.js
│   │   │   ├── userRoutes.js
│   │   │   └── dashboardRoutes.js    # GET /api/dashboard
│   │   ├── services/
│   │   │   ├── authService.js
│   │   │   ├── projectService.js
│   │   │   ├── taskService.js
│   │   │   ├── userService.js
│   │   │   └── dashboardService.js
│   │   ├── validators/
│   │   │   ├── validate.js           # Zod schema validation middleware (422 status)
│   │   │   ├── authValidator.js
│   │   │   ├── projectValidator.js
│   │   │   ├── taskValidator.js
│   │   │   └── userValidator.js
│   │   ├── utils/
│   │   │   ├── apiError.js       # ApiError class with HTTP status code helpers
│   │   │   └── jwt.js            # JWT signing and verification
│   │   ├── app.js                # Express app configuration & middleware
│   │   └── server.js             # Server startup & DB connectivity check
│   ├── prisma/
│   │   ├── schema.prisma         # Relational PostgreSQL schema (User, Project, Task)
│   │   └── seed.js               # Database seeder with bcrypt hashed passwords
│   ├── tests/
│   │   └── api.test.js           # Automated backend test suite (13 passing tests)
│   ├── package.json
│   ├── .env.example
│   ├── .env
│   └── .gitignore
│
├── package.json                  # Root scripts to manage workspace
└── README.md
```

---

## 3. Technology Stack

### Backend
- **Runtime**: Node.js (v20+)
- **Framework**: Express.js
- **Database & ORM**: PostgreSQL with Prisma ORM
- **Authentication**: JSON Web Tokens (`jsonwebtoken`)
- **Password Hashing**: `bcryptjs` (salt rounds: 10)
- **Validation**: `zod` (returning HTTP 422)
- **Security**: `helmet`, `cors`, `express-rate-limit`
- **Testing**: Node.js native test runner (`node:test`, `node:assert`)

### Frontend
- **Framework**: React 19 + Vite
- **Styling**: Tailwind CSS v4
- **Routing**: React Router v7
- **HTTP Client**: Axios with Bearer token interceptor
- **Icons**: Lucide React
- **Linter**: Oxlint

---

## 4. Local Setup & Getting Started

### 1. Install Dependencies
From the repository root:
```bash
npm run install:all
```
*(Or run `npm install` in `frontend/` and `backend/` independently)*

---

### 2. Configure Environment Variables

#### Backend (`backend/.env`)
Copy `backend/.env.example` to `backend/.env`:
```env
PORT=5000
NODE_ENV=development
DATABASE_URL="postgresql://[INSERT-CONNECTION-HERE]"
JWT_SECRET=supersecret_taskflow_jwt_key_development_only_change_in_prod
JWT_EXPIRES_IN=7d
FRONTEND_URL=http://localhost:5173
CORS_ORIGIN=http://localhost:5173
```
> Replace `[INSERT-CONNECTION-HERE]` with your Neon or PostgreSQL database connection string (e.g. `postgresql://user:password@ep-xyz.us-east-2.aws.neon.tech/taskflow?sslmode=require`).

#### Frontend (`frontend/.env`)
Copy `frontend/.env.example` to `frontend/.env`:
```env
VITE_API_URL=http://localhost:5000/api
VITE_API_BASE_URL=http://localhost:5000/api
```

---

### 3. Database Migration & Seed

Once your `DATABASE_URL` is configured in `backend/.env`:

1. **Apply Prisma schema to database**:
   ```bash
   npm run prisma:migrate
   # or
   npm run db:push --prefix backend
   ```

2. **Generate Prisma Client**:
   ```bash
   npm run prisma:generate
   ```

3. **Seed initial development data**:
   ```bash
   npm run prisma:seed
   ```

#### Default Seed Credentials:
- **Email**: `arya.ghosh@taskflow.app`
- **Password**: `password123`
*(Available via the "Quick fill" button on the login screen)*

---

### 4. Running Locally

#### Run Backend & Frontend:
```bash
# Terminal 1 - Backend (http://localhost:5000)
npm run dev:backend

# Terminal 2 - Frontend (http://localhost:5173)
npm run dev:frontend
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

---

### 5. Running Automated Tests
```bash
# Run backend test suite (from root)
npm test

# Or directly in backend
cd backend && npm test
```

---

## 5. Security Architecture & Decision

### JWT Storage Strategy
- **Client Storage**: The JWT is stored in `localStorage` under `taskflow_token`.
- **Transmission**: Automatically injected into the `Authorization: Bearer <token>` header on every API request via the Axios interceptor (`frontend/src/api/client.js`).
- **XSS Mitigation**: The application uses React's native JSX escaping (zero `dangerouslySetInnerHTML`), strict Helmet Content Security Policy (`CSP`), and does not accept unescaped HTML content.
- **Server Verification**: The backend validates signature, expiration, and user existence on every protected request. Frontend user IDs are never trusted blindly; the identity is strictly derived from the verified JWT payload.

### Ownership Authorization
- Projects can only be edited or deleted by the user who owns them (`ownerId === req.user.id`). Unauthorized attempts are rejected with `403 Forbidden`.
- Tasks can only be created or modified within projects the user has access to.

### Rate Limiting
- **Authentication**: Strict rate limiting (max 20 requests per 15 minutes) on `/api/auth/login` and `/api/auth/register`.
- **General API**: Max 500 requests per 15 minutes.

---

## 6. REST API Reference

### Consistency & Status Codes
- **Success**: `{ "success": true, "data": { ... } }`
- **Error**: `{ "success": false, "message": "..." }`
- `400` → Bad Request
- `401` → Unauthenticated
- `403` → Forbidden
- `404` → Not Found
- `409` → Conflict (e.g. duplicate email)
- `422` → Validation Error (Zod input validation)
- `500` → Internal Server Error (stack traces suppressed in production)

### Authentication (`/api/auth`)
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/api/auth/register` | No | Register new user account |
| `POST` | `/api/auth/login` | No | Log in and receive JWT token |
| `GET` | `/api/auth/me` | Bearer | Fetch currently authenticated user profile |
| `POST` | `/api/auth/logout` | Bearer | Invalidate client session |

### Projects (`/api/projects`)
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/api/projects` | Bearer | List projects accessible to user |
| `POST` | `/api/projects` | Bearer | Create project (ownership derived from JWT) |
| `GET` | `/api/projects/:id` | Bearer | Get project details with tasks and owner |
| `PUT / PATCH`| `/api/projects/:id` | Bearer | Update project (owner only, 403 otherwise) |
| `DELETE` | `/api/projects/:id` | Bearer | Delete project and cascade delete tasks (owner only) |

### Tasks (`/api/tasks`)
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/api/tasks` | Bearer | Filter & paginate tasks (`status`, `priority`, `projectId`, `assigneeId`, `search`) |
| `POST` | `/api/tasks` | Bearer | Create task in an accessible project |
| `GET` | `/api/tasks/:id` | Bearer | Get single task details |
| `PUT / PATCH`| `/api/tasks/:id` | Bearer | Update task details or board status |
| `DELETE` | `/api/tasks/:id` | Bearer | Delete task |

### Dashboard (`/api/dashboard`)
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/api/dashboard` | Bearer | Get aggregated KPI stats, recent projects, and recent tasks |

### Users (`/api/users`)
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/api/users/me` | Bearer | View user profile and productivity metrics |
| `PUT` | `/api/users/me` | Bearer | Update name and/or email |
| `GET` | `/api/users` | Bearer | List workspace users for task assignees |

### System (`/api/health`)
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/api/health` | No | Health check, uptime, and database status |

---

## 7. Live Deployment Guide

### Deploying Frontend to Vercel
1. Import this repository into Vercel.
2. Set **Root Directory** to `frontend`.
3. Set Environment Variable:
   - `VITE_API_URL` = `https://your-backend-service.onrender.com/api`
4. Deploy.

### Deploying Backend to Render
1. Create a new **Web Service** on Render importing this repository.
2. Set **Root Directory** to `backend`.
3. Set **Build Command**: `npm install && npx prisma generate`
4. Set **Start Command**: `npm start`
5. Configure Environment Variables in Render:
   - `NODE_ENV` = `production`
   - `PORT` = `5000`
   - `DATABASE_URL` = `postgresql://[your-neon-database-url]?sslmode=require`
   - `JWT_SECRET` = `[a-secure-random-secret]`
   - `FRONTEND_URL` = `https://your-frontend-domain.vercel.app`
   - `CORS_ORIGIN` = `https://your-frontend-domain.vercel.app`
6. Deploy.
