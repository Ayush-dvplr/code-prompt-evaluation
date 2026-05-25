# Todo App — Golden Response

## What Is This Project?

This project started as an experiment in AI model evaluation. A detailed, production-level prompt was written to build a full-stack Todo application using the MERN stack (MongoDB, Express, React, Node.js). The same prompt was given to two different AI models — Gemini and ChatGPT — and both generated complete codebases.

Those two codebases were then evaluated side by side using a structured RLHF (Reinforcement Learning from Human Feedback) framework across 7 quality dimensions. After scoring both responses, a third codebase was built from scratch — this one — taking the best ideas from both, fixing every bug that was found, and correctly implementing every single requirement from the original prompt.

This folder contains that final, corrected, fully runnable codebase. Think of it as what the perfect response to that prompt should have looked like.

---

## Tech Stack

**Backend** — Node.js 18+, Express 4, MongoDB with Mongoose, JWT authentication, Nodemailer, Joi validation, bcryptjs

**Frontend** — React 18, Vite, React Router v6, Axios, Tailwind CSS, React Hot Toast

---

## Repository Structure

```
golden response/
│
├── server/                        Backend API
│   ├── Server.js                  Entry point — connects DB then starts HTTP server
│   ├── App.js                     Express app setup, middleware, route mounting
│   ├── .env.example               All environment variables with descriptions
│   ├── package.json
│   └── src/
│       ├── config/
│       │   └── cors.config.js     CORS allowed origins
│       ├── db/
│       │   └── connectDB.js       MongoDB connection with exponential backoff retry
│       ├── models/
│       │   ├── User.model.js      User schema, bcrypt pre-save hook, comparePassword
│       │   ├── Task.model.js      Task schema with compound index
│       │   └── Token.model.js     Refresh and reset tokens with TTL auto-expiry
│       ├── controllers/
│       │   ├── auth.controller.js Register, login, refresh, logout, forgot/reset password
│       │   ├── task.controller.js Full CRUD with pagination, filters, user isolation
│       │   └── user.controller.js Get profile, update profile, change password
│       ├── middlewares/
│       │   ├── auth.middleware.js  Verifies JWT, attaches full user to req.user
│       │   ├── validation.middleware.js  Joi schema validator factory
│       │   └── error.middleware.js  Central error handler
│       ├── validators/
│       │   ├── auth.validator.js
│       │   ├── task.validator.js
│       │   └── user.validator.js
│       ├── routes/
│       │   ├── auth.routes.js
│       │   ├── task.routes.js
│       │   ├── user.routes.js
│       │   └── routeConfig.js     Mounts all three route groups
│       └── utils/
│           ├── hashToken.js       SHA256 hashing for DB-stored tokens
│           ├── generateTokens.js  Create, store, and rotate JWT pairs
│           └── sendEmail.js       Nodemailer email sender
│
├── client/                        React frontend
│   ├── index.html
│   ├── vite.config.js
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   ├── .env.example
│   ├── package.json
│   └── src/
│       ├── App.jsx                All routes, lazy loading, ProtectedRoute wiring
│       ├── main.jsx
│       ├── index.css              Tailwind base styles + custom primary color
│       ├── api/
│       │   ├── axios.js           Single Axios instance, token interceptor, auto-refresh
│       │   ├── auth.api.js
│       │   ├── task.api.js
│       │   └── user.api.js
│       ├── hooks/
│       │   ├── useAuth.js         Login, register, logout with localStorage persistence
│       │   ├── useTasks.js        Fetch, create, update, delete with caching + pagination
│       │   ├── useDebounce.js     300ms debounce for search input
│       │   └── useLocalStorage.js Synced state that survives page refresh
│       ├── components/
│       │   ├── ProtectedRoute.jsx  Redirects to /login if no access token
│       │   ├── OfflineBanner.jsx   Fixed banner when internet is lost
│       │   ├── TaskCard.jsx        Task display with priority badge and actions
│       │   ├── TaskSkeleton.jsx    Animated placeholder while tasks load
│       │   ├── Modal.jsx           Accessible modal with Escape key support
│       │   └── Spinner.jsx         Loading indicator in three sizes
│       ├── pages/
│       │   ├── LoginPage.jsx
│       │   ├── RegisterPage.jsx
│       │   ├── ForgotPasswordPage.jsx
│       │   ├── ResetPasswordPage.jsx
│       │   ├── TaskPage.jsx        Main dashboard with search, filters, pagination
│       │   ├── ProfilePage.jsx     View and edit profile, change password
│       │   └── NotFoundPage.jsx    404 page
│       └── utils/
│           ├── offlineQueue.js     Queues operations while offline, flushes on reconnect
│           └── formatDate.js       Human-readable date formatting
│
└── docs/
    └── API.md                     Full API reference with all 14 endpoints
```

---

## How to Run

You need **Node.js 18 or higher** and **MongoDB** installed before you start. You can check your Node version by running `node -v` in a terminal.

### Step 1 — Set up the server

Open a terminal and go to the server folder:

```
cd "C:\code prompt\golden response\server"
```

Install all dependencies:

```
npm install
```

Create your environment file by copying the example:

```
copy .env.example .env
```

Now open the `.env` file and fill in the values. The only ones you must change are:

```
MONGO_URL=mongodb://localhost:27017/todo-mern
JWT_ACCESS_SECRET=paste-any-long-random-string-here
JWT_REFRESH_SECRET=paste-a-different-long-random-string-here
```

Everything else can stay as-is for local development. SMTP fields can be left as placeholders — email failures are non-blocking and won't stop the app from running.

Start the dev server:

```
npm run dev
```

You should see the server running on `http://localhost:5000`

---

### Step 2 — Set up the client

Open a second terminal and go to the client folder:

```
cd "C:\code prompt\golden response\client"
```

Install all dependencies:

```
npm install
```

Create your environment file:

```
copy .env.example .env
```

The only variable in the client `.env` that matters locally is already set to the right value:

```
VITE_API_BASE_URL=http://localhost:5000/api/v2
```

You can leave the Firebase variables as placeholders — they are not wired up to anything in this codebase.

Start the dev server:

```
npm run dev
```

Open your browser at `http://localhost:5173` and the app is live.

---

### Step 3 — Test it manually

Here is a quick checklist to verify everything works end to end:

1. Go to `/register` and create an account. You should land on the task dashboard.
2. Create a task using the "+ New task" button. Try setting a due date in the past — you should see a warning toast but the task still gets created.
3. Use the search box and wait a moment. Filtering should kick in after 300ms without pressing enter.
4. Filter by status or priority using the dropdowns.
5. Click on a task to toggle its status to completed.
6. Delete a task. The count should update immediately without a page reload.
7. Go to `/profile`, change your display name, and save.
8. Sign out and try the forgot password flow. If SMTP is configured, check your inbox (or Mailtrap).
9. Open DevTools, go to Network tab, throttle to Offline. The yellow offline banner should appear at the top.
10. Sign back in — your tasks should load instantly from the local cache before the server responds.

---

## Evaluation Methodology

### The Setup

The original prompt asked for a production-ready MERN Todo app with a long list of specific technical requirements — JWT refresh token rotation, Joi validation, offline support, optimistic UI updates, debounced search, skeleton loaders, and more. That same prompt was sent to Gemini (Response A) and ChatGPT (Response B) without any modifications.

### The Framework

Both codebases were evaluated using **7 RLHF dimensions** — the same dimensions used in human preference studies for AI output quality:

| # | Dimension | What it measures |
|---|---|---|
| 1 | Correctness | Does the code actually work? Are there bugs? |
| 2 | Completeness | Did it implement everything the prompt asked for? |
| 3 | Coherence | Does the codebase hold together as one consistent system? |
| 4 | Relevance | Is everything written for this specific app or is it generic boilerplate? |
| 5 | Helpfulness | Would a developer actually learn something useful from reading this code? |
| 6 | Creativity | Did it go beyond the minimum with thoughtful extras? |
| 7 | Style | Is the code clean, readable, and consistently formatted? |

Each dimension was scored and then a final **Likert Scale score from 1 to 7** was given, where 1 means Gemini was much better, 4 is neutral, and 7 means ChatGPT was much better.

### What Was Found

**Gemini** wrote cleaner, more coherent code with better structure and comments. Its biggest failure was implementation gaps — it referenced files and modules that simply did not exist, meaning the server could not start at all.

**ChatGPT** was more complete in terms of volume and covered more of the prompt's checklist. But it had several deep bugs: it mixed ES Modules and CommonJS causing fatal startup errors, used bcrypt to hash tokens stored in the database (which breaks logout because bcrypt is non-deterministic), attached an incomplete user object to `req.user` causing authenticated routes to silently fail, and left the user routes unregistered.

### What the Golden Response Fixed

Every bug from both codebases was identified and corrected. The golden response adds `joi` to `package.json` (missing in Gemini), uses CommonJS consistently (unlike ChatGPT), uses SHA256 for token hashing (architecturally correct), fetches the full User document in the auth middleware so `req.user._id` works everywhere, and registers all three route groups. Beyond fixes, every feature from the original prompt was implemented correctly and completely.
