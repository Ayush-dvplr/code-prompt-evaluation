# Prompt:

Act like an experienced **MERN** stack developer. You are building a production ready Todo list web
application from scratch using MERN stack. Below is detailed information that you must adhere
to and follow for this web application.

**Tech stack:**

**Frontend:**

- Use React 18 with Vite as the build tools – do not use Create React App instead that use
    Vite to generate boilerplate for frontend.
- React 18 + Vite: fast dev server, modern bundling, stable version.
- React Router v6: file-based route organization, lazy loading for heavy pages
- Axios: centralized instances in api/axios.js with request interceptor for JWT.
- React-hot-toast: success/error/warning message on top right corner.
- Tailwind css: proper setup in the config file and avoid overlapping classes.

**Backend:**

- Node.js: use node 18.x.x stable version methods and implementations.
- Express 4: for routing, validation and middlewares
- cors + express-rate-limitter: security headers, origin control, rate limiting without reddis
- Mongoose: schema creation, validation and CRUP operations
- Jsonwebtoken(JWT): access token (1 day expiry) + refresh token (7 days expiry)
- Bcryptjs: save hashed passport and add salt of minimum length of 10 char.
- Nodemailer: forget password emails and confirmation mails.
- Dotenv: environment config, never commit .env files, add proper commented instruction and
    variable name

**Folder structure:**

**frontend(client):**

Client/
Src/
Api/ : axios instance + one file per resource (auth.api.js, task.api.js, etc)


Components/: Reusable components (TaskCard, Modal, Spinner, etc)
pages/: routing level components (LoginPage, ForgetPasswordPage, TaskPage,
EditTaskPage, etc)
hooks/: useAuth(), useTasks(), useDebouce(), useLocalStorage(), etc
Utils/: for miscellaneous tasks like formatting date, helper functions, etc.
.env.example: template for environment variable with proper variable name and
commented title (like VITE_GOOGLE_CLIENT_ID: #google client authenciation token

Server/
src/
controllers/: main controller logic of each different routing files (like authController.js,
taskController.js, userController.js, etc)
middlewares/: authentication, validation and error handing
models: mongoose models (like User.model.js, Task.model.js, Token.model.js, etc)
routes/: separate routing files for each routes and a common routeConfig.js
file where all the routes will be import and the base url will be used like (“/api/v2/”,
auth.routes.js).
db/: connectDB.js contains connection to mongo DB and logical retry.
utils/: miscellaneous tasks and methods (like sendEmail, generateTokens, hashTokens,
etc)
Config/: configuration files for dotenv, cors, etc.
Validators/: for validations tasks, tasks validators, etc


App.js: express setup, cors, app setup and no app.listen
Server.js: starts server, connects DB
.env.example: template for environment variable with proper variable name and
commented title (like MONGO_URL: #mongo db connection url)

Documentation (in the root folder):

Create a root folder inside the root folder of the project. Use markdown files for creating
docs files. Below is detailed format for the documentation structure to follow that strictly.

Docs structure with example of authDocs.md follow this specific instruction for all routes:


```
API.md:
```
- Titile
- Description
- Base url
- Table for all routes containing title, routes url, authentication token, methods, required
    params, optional params, restrictions (if any in 150 max words and in bullet points if
    multiple)

Authentication:

1. Google auth: use goggle auth firebase methods to check if the user is already
    registered, send a new JWT if not registered, then register the user and send a new JWT
    token.
2. Email/password: verify email and password hash in the database if correct then return
    the JWT and if not then send 4 01 with proper message.

Token Strategy: use both JWT access token and refresh token. Access token will have a validity of 1 day and refresh token will have validity of 7 days. After successful login save the token in the local storage and then fetch and use for restricted requests from the local storage itself. If receives 401 token is expired, then remove the token from the local storage and redirect it to the login page.

Core features:

Task model:
fields: title(required, 1-200 char), description (optional, max 1000 words), status (enum, [pending,in-progress, completed], due date (optional, Date), priority(enum, [low, medium, high]),userId(reference of user document) createdAT, updatedAT.

CRUD edge case:
Create: due date is in the past warn client but accepts it
Pagination: add filters in the get url (like query? page=1&limit=20&status=pending)
Edit: user cannot edit another user’s task)

Profile page:
User can view their name, email, avatar (if not then a placeholder for that)
There must be options to change email, name and password.

**Request/Response format and status codes to be use:**
Request: body {email: “email”, password: “password”}
Response: 200 {accessToken, user: {id, email, displayName, avatar}}

Errors:
400: validation failed
401: invalid credentials
404: resource not found
500: Internal server error

Network and state edge cases:

- Offline: shows a banner that you are offline, save the tasks in the queue in the local storage and push when network is available.
- Double submit, disable the submit on one click and enable when any error response is received.
- Concurrent user edits: if the same users from different devices are editing the same task, then keep the last edit based on the timestamped request.

**Performance and scaling:**

Frontend performance:

- Route based code splitting
- Debounce search input by 300ms
- Memorize expensive task renders.
- Save some prefetch data of tasks in the state or local storage (like for page 1 and limit 20) and meanwhile fetch the updated content in the background, finally update the page when the success response received.

Backend performance:

- Mongo dB indexes: unique user email, task title.
- Compression: Enable express compression middleware for responses over 1kb.
- Do not directly trust any token from frontend to verify once again with the token saved in the database.

Additional things you also take care of:

- A 404 page so that the website does not looks broken
- Loader (a custom spinner as per the theme)
- If no task added yet, then a message on home screen “No task yet”
- Mobile responsiveness uses desktop first method.
- Lazy loading for heavy requests
- Skelton loader for tasks if currently fetching the tasks

Final Note:

Read this entire document before starting to work on the coding part. Then scaffold the folder's structure first (empty files with correct file names). When you are stuck between any two approaches, choose the legacy and stable one. Finally, still you have any questions, queries or doubts to ask me before proceeding. 