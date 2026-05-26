Act like an experienced MERN stack developer. You are building a production ready Todo list web application from scratch using MERN stack. Read this entire document before writing any code. Scaffold the folder structure with empty files first. If two approaches seem equally valid, go with the older more battle tested one. If something here is confusing or contradicts something else, just ask before writing any code.

---

## Tech Stack

### Frontend

React 18 with Vite as the build tool. Do not use Create React App.

React Router v6 for routing with lazy loading for heavy pages. Axios for all API calls with a centralized instance in api/axios.js and a request interceptor that attaches the JWT from localStorage to every header. React hot toast for success, error and warning messages in the top right corner.

Tailwind CSS with proper config setup. Primary palette is shades of green defined as custom colors in the Tailwind config so the agent stays consistent across files. Font is Inter, base border radius is 8px, breakpoints are sm 640px, md 768px, lg 1024px, xl 1280px.

React Context plus useReducer for state management. One context per domain: AuthContext for auth state, TaskContext for task state. No Zustand or other libraries. Keep all contexts in src/context/ and export a custom hook per context like useAuth() and useTasks().

### Backend

Node.js 18.x.x stable only. Express 4 for routing, validation and middleware. Mongoose for schemas, validation and all CRUD. Jsonwebtoken for access token (1 day) and refresh token (7 days). Bcryptjs for password hashing with salt length of at least 10.

cors plus express-rate-limiter for origin control and rate limiting without Redis. Helmet.js as the first middleware in app.js for HTTP security headers. express-mongo-sanitize right after helmet to block NoSQL injection. compression middleware for responses over 1kb, added in app.js before routes.

Nodemailer is scaffolded but not wired up yet. Create the folder, the utility file and the .env variables but comment everything out with the note "wire up when email provider is decided". Include a templates/ folder inside utils/email/ for future HTML templates.

Dotenv for environment config. Never commit .env files. Always add commented instructions in .env.example files.

---

## Folder Structure

### Frontend (client/)

```
client/
  src/
    api/
      axios.js           # centralized axios instance with JWT interceptor
      auth.api.js        
      task.api.js
      user.api.js
    components/
      TaskCard.jsx
      Modal.jsx
      Spinner.jsx
      SkeletonCard.jsx
      OfflineBanner.jsx
    pages/
      LoginPage.jsx
      RegisterPage.jsx
      ForgotPasswordPage.jsx
      ResetPasswordPage.jsx
      TaskPage.jsx
      EditTaskPage.jsx
      ProfilePage.jsx
      NotFoundPage.jsx
    context/
      AuthContext.jsx    # AuthContext + useAuth hook
      TaskContext.jsx    # TaskContext + useTasks hook
    hooks/
      useDebounce.js
      useLocalStorage.js
      useOnlineStatus.js
    utils/
      formatDate.js
      constants.js
    App.jsx
    main.jsx
  .env.example
```

### Backend (server/)

```
server/
  src/
    config/
      corsConfig.js
      dotenvConfig.js
    controllers/
      authController.js
      taskController.js
      userController.js
    db/
      connectDB.js       # MongoDB connection with retry logic
    middlewares/
      authMiddleware.js
      errorMiddleware.js
      validationMiddleware.js
    models/
      User.model.js
      Task.model.js
      Token.model.js
    routes/
      auth.routes.js
      task.routes.js
      user.routes.js
      routeConfig.js     # all routes imported here, base URL /api/v1/
    utils/
      generateTokens.js
      hashTokens.js
      AppError.js
      email/
        sendEmail.js     # commented out, wire up when provider is decided
        templates/
    validators/
      auth.validator.js
      task.validator.js
    app.js               # express setup, cors, middleware, no app.listen
    server.js            # starts server and connects DB
  .env.example
```

### Docs (docs/ in root)

```
docs/
  API.md
  authDocs.md
  taskDocs.md
  userDocs.md
README.md
```

---

## Naming and Code Conventions

camelCase for JS variables and functions. PascalCase for React components and Mongoose models. Lowercase with hyphens for folder names. camelCase for MongoDB field names. Route files follow resource.routes.js, model files follow Resource.model.js.

For linting and formatting go with ESLint using the React recommended preset and Prettier configured with single quotes, 2 space indentation and no semicolons. Drop a .eslintrc and a .prettierrc file into both the client and server root folders.

---

## API Design

All routes live under /api/v1/. Locked to v1 for this build, do not use v2 anywhere.

Every response follows this envelope:

```json
{ "success": true, "data": {}, "meta": { "page": 1, "limit": 20, "total": 100 } }
```

meta is only on list endpoints. Single object responses just return success and data.

```json
{ "success": false, "message": "human readable", "code": "VALIDATION_ERROR", "errors": [] }
```

errors holds field level detail for 400 responses. code is always SCREAMING_SNAKE_CASE. Use PATCH for partial updates, all task updates in this app are PATCH.

---

## Authentication

### Google OAuth

Use Firebase SDK v9 modular syntax. On the frontend call signInWithPopup with GoogleAuthProvider. Once the popup closes grab the ID token by calling getIdToken() on the user object. POST that token to /api/v1/auth/google. The backend passes it to firebase-admin's auth().verifyIdToken() to validate it. If the email is not in the database create a new user. Then generate your own access and refresh tokens and send them back. Firebase only handles identity, your backend controls the session.

### Email and Password

Check email and password hash in the database. If correct return both tokens. If not send 401 with a message. Never tell the user which field was wrong.

### Token Strategy

Save both tokens in localStorage after login. Attach the access token to every protected request. When any request returns 401 clear both tokens from localStorage and redirect to the login page. No silent refresh in this version. On the backend never trust a token blindly. Always check the refresh token against the hashed version in the Token collection. If they do not match, reject it.

Login success response:
```json
{ "success": true, "data": { "accessToken": "", "refreshToken": "", "user": { "id": "", "email": "", "displayName": "", "avatar": "" } } }
```

---

## Error Handling

Make an AppError class inside utils/AppError.js. It extends native Error and takes message, statusCode and a code string. Every controller throws this instead of random error objects. Wire up a globalErrorHandler in middlewares/errorMiddleware.js as the very last middleware in app.js. Handle Mongoose validation errors, duplicate key errors (11000) and JWT errors inside it so controllers stay clean.

Status codes: 400 validation failed, 401 invalid credentials, 403 forbidden, 404 not found, 409 conflict, 422 semantic error, 500 server error.

---

## Task Model

Fields: title (required, max 200 chars), description (optional, max 1000 chars), status (enum: pending, in-progress, completed), dueDate (optional Date), priority (enum: low, medium, high), userId (ref to User), isDeleted (Boolean, default false), deletedAt (Date, default null). Add timestamps: true and Mongoose handles createdAt and updatedAt.

Write a pre-find hook so every query skips documents where isDeleted is true. Indexes: unique on User email, index on Task title, compound index on userId plus status.

### CRUD Edge Cases

Create: if dueDate is in the past accept it but include a warning field in the response. Read list GET /api/v1/tasks accepts: page (default 1), limit (default 20, max 100), status, priority, search (regex on title), sortBy (createdAt or dueDate), sortOrder (asc or desc). Update: verify the task's userId matches the logged in user before doing anything, send 403 if not. Delete: soft delete only, set isDeleted true and deletedAt to now.

---

## Profile Page

The profile page shows name, email and avatar. No avatar means a circle with the user's initials. Users can update display name, email and password from here. Email change needs the current password. Password change needs current password plus the new one.

---

## Offline and Network Edge Cases

When the user goes offline put a banner at the top of the screen. The useOnlineStatus hook handles this by subscribing to the browser's native online and offline window events. Offline task creates or updates go into a localStorage queue and push automatically when the network returns. If a queued action fails on sync rollback the local state, remove it from the queue and show a toast error. Disable the submit button on first click and re-enable only if an error comes back. For concurrent edits from the same user on different devices, the later updatedAt timestamp wins.

---

## Performance

Frontend: route based code splitting with React.lazy and Suspense on every page. Debounce search input 300ms via useDebounce. Memoize task list renders with useMemo and React.memo on TaskCard. On first load prefetch page 1 limit 20 into TaskContext, show it immediately and refresh in the background. Show SkeletonCard while fetching and a "No tasks yet" message when the list is empty.

Backend: compression middleware before routes for responses over 1kb. MongoDB indexes as described in the Task model section.

---

## Security

Middleware order in app.js, this order matters:

1. helmet()
2. express-mongo-sanitize()
3. cors with corsConfig.js
4. express.json() body limit 10kb
5. express-rate-limiter (100 req per 15 min per IP, no Redis)
6. routes
7. globalErrorHandler (must be last)

On the frontend install DOMPurify and sanitize any user generated content before rendering as HTML.

---

## UI and UX Details

Add NotFoundPage.jsx so the app never looks broken on unknown routes. Add a custom Spinner matching the green theme. App is mobile responsive using desktop first approach, large screen styles first then Tailwind responsive prefixes for smaller screens. Use SkeletonCard for task list loading states.

---

## Documentation

Add a docs/ folder at the project root with API.md, authDocs.md, taskDocs.md and userDocs.md. Also create README.md at the very root covering: project overview, tech stack, prerequisites (Node 18, MongoDB, Firebase project), setup steps (clone, npm install in both folders, copy .env.example to .env, npm run dev), environment variables reference and available scripts.

API.md has a route table with columns: Route name, URL, Method, Auth required, Required params, Optional params, Restrictions. Each resource doc file covers every route with: full URL, method, request body, success response and possible error codes.

---

## Environment Variables

client/.env.example:
```
VITE_API_BASE_URL=http://localhost:5000/api/v1
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_APP_ID=
```

server/.env.example:
```
PORT=5000
NODE_ENV=development
MONGO_URI=
JWT_ACCESS_SECRET=
JWT_REFRESH_SECRET=
JWT_ACCESS_EXPIRY=1d
JWT_REFRESH_EXPIRY=7d
FIREBASE_PROJECT_ID=
FIREBASE_CLIENT_EMAIL=
FIREBASE_PRIVATE_KEY=
CORS_ORIGIN=http://localhost:5173
# SMTP_HOST=
# SMTP_PORT=
# SMTP_USER=
# SMTP_PASS=
# EMAIL_FROM=
```

---

## Build Order

Phase 1: scaffold all empty files, package.json for both sides, Tailwind, ESLint, Prettier, both .env.example files.
Phase 2: DB connection, all Mongoose models, AppError class, globalErrorHandler.
Phase 3: all auth routes and controllers (register, login, logout, refresh, forgot/reset password, Google OAuth). Email calls are commented stubs.
Phase 4: full task CRUD with pagination, user profile endpoints, compression, indexes.
Phase 5: axios instance, all API files, AuthContext, TaskContext, router with lazy loading, 404 page, Spinner, toast config.
Phase 6: LoginPage, RegisterPage, ForgotPasswordPage, ResetPasswordPage with form validation and toasts.
Phase 7: TaskPage with skeletons, empty state, offline banner, TaskCard, Modal, EditTaskPage, filters, debounced search.
Phase 8: ProfilePage, offline queue with rollback, optimistic UI, background prefetch on page 1.
Phase 9: all markdown docs and root README.md.

---

## Final Notes

If two approaches seem equally valid, go with the older more battle tested one. Do not install a library if what is already listed can do the job. Keep code readable over clever. Every function does one thing. Comment anything not immediately obvious. If something here contradicts something else, ask before proceeding.