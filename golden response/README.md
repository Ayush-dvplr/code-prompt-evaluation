# Todo App — MERN Stack

A production-ready full-stack Todo application built with MongoDB, Express 4, React 18, and Node.js 18.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18 + Vite, React Router v6, Tailwind CSS (green palette), Axios, React Hot Toast |
| State | React Context + useReducer (AuthContext, TaskContext) |
| Auth | JWT (access 1d, refresh 7d) + Google OAuth via Firebase |
| Backend | Node.js 18, Express 4, Mongoose 8 |
| Database | MongoDB with soft delete, compound indexes |
| Security | Helmet, express-mongo-sanitize, CORS, rate limiting (100 req/15 min), DOMPurify |

---

## Prerequisites

- **Node.js** 18.x
- **MongoDB** running locally or a connection string (MongoDB Atlas)
- **Firebase project** with Google sign-in enabled (for OAuth)

---

## Setup

```bash
# 1. Clone the repo
git clone <repo-url>
cd <repo-folder>

# 2. Install server dependencies
cd server
npm install

# 3. Configure server environment
cp .env.example .env
# Edit .env — fill in MONGO_URI, JWT secrets, Firebase credentials, CORS_ORIGIN

# 4. Install client dependencies
cd ../client
npm install

# 5. Configure client environment
cp .env.example .env
# Edit .env — fill in VITE_API_BASE_URL and Firebase config

# 6. Start both servers (in separate terminals)
cd server && npm run dev   # runs on http://localhost:5000
cd client && npm run dev   # runs on http://localhost:5173
```

---

## Environment Variables

### server/.env

| Variable | Description |
|---|---|
| `PORT` | Server port (default: 5000) |
| `NODE_ENV` | `development` or `production` |
| `MONGO_URI` | MongoDB connection string |
| `JWT_ACCESS_SECRET` | Secret for signing access tokens |
| `JWT_REFRESH_SECRET` | Secret for signing refresh tokens |
| `JWT_ACCESS_EXPIRY` | Access token lifetime (default: `1d`) |
| `JWT_REFRESH_EXPIRY` | Refresh token lifetime (default: `7d`) |
| `BCRYPT_SALT_ROUNDS` | bcrypt cost factor (default: `12`) |
| `FIREBASE_PROJECT_ID` | Firebase Admin SDK project ID |
| `FIREBASE_CLIENT_EMAIL` | Firebase Admin SDK client email |
| `FIREBASE_PRIVATE_KEY` | Firebase Admin SDK private key |
| `CORS_ORIGIN` | Frontend origin allowed by CORS |

### client/.env

| Variable | Description |
|---|---|
| `VITE_API_BASE_URL` | Backend API base URL (e.g. `http://localhost:5000/api/v1`) |
| `VITE_FIREBASE_API_KEY` | Firebase web app API key |
| `VITE_FIREBASE_AUTH_DOMAIN` | Firebase auth domain |
| `VITE_FIREBASE_PROJECT_ID` | Firebase project ID |
| `VITE_FIREBASE_APP_ID` | Firebase app ID |

---

## Available Scripts

### Server (`server/`)

| Script | Command | Description |
|---|---|---|
| Development | `npm run dev` | Start with nodemon (auto-restart) |
| Production | `npm start` | Start with node |

### Client (`client/`)

| Script | Command | Description |
|---|---|---|
| Development | `npm run dev` | Start Vite dev server |
| Build | `npm run build` | Production build to `dist/` |
| Preview | `npm run preview` | Preview production build |

---

## API Reference

See [docs/API.md](docs/API.md) for the full route table.

- [Auth routes](docs/authDocs.md) — register, login, Google OAuth, refresh, logout, forgot/reset password
- [Task routes](docs/taskDocs.md) — CRUD, pagination, filters, soft delete
- [User routes](docs/userDocs.md) — profile view, update, email/password change

---

## Key Design Decisions

- **Soft delete** — tasks are never hard-deleted; `isDeleted: true` + pre-find hook hide them
- **No silent refresh** — a 401 always clears tokens and redirects to `/login`
- **Token safety** — refresh tokens are stored as SHA256 hashes in the DB; raw token is only in localStorage
- **Offline queue** — creates/updates made offline are queued in localStorage and synced on reconnect
- **Email** — Nodemailer is scaffolded but commented out; wire up when the SMTP provider is chosen
