

# Ratings & Evaluations:

**Response A (Gemini):**

Dimension 1: Correctness - 2.5/5 

The code that Gemini did write is solid, the bcrypt hook in the User model is used correctly with an isModified('password') guard so passwords do not get hashed, the token is using SHA256 properly, and the axios refresh interceptor logic is clean and accurate. But the app simply cannot run. The server crashes immediately because App.js tries to load a routes file that does not exist. The frontend crashes on load because it imports a Spinner component and other pages that also do not exist in codebase. Also, the validation middleware uses JOI which is not even listed in package.json, so any route using validation would throw a "module not found" error. What's written is correct, but the app is broken before you even get to test it. 

  

Dimension 2: Relevance - 3/5 

Gemini read the prompt carefully in terms of format and naming. App.js and Server.js are capitalized exactly as the prompt asks. JWT is set up with 1 day access and 7 day refresh tokens. bcrypt is using salt rounds of 12. Rate limiting without Redis is in place. The .env.example is present on both the client and server side with every variable commented. Lazy loading is applied to all 7 routes as required. It does not add TypeScript or any tool that was not asked in the prompt. However, it gets less points because routes, controllers, validators, hooks, a docs folder and a Config folder are all explicitly listed in the prompt and none of them are there. 

  

Dimension 3: Completeness - 1.5/5 

There are no controllers, which means there are no working API endpoints at all: no login, no register, no task creation, nothing. There are no route files, so even if controllers existed, nothing would be reachable. No validators, no frontend pages, no hooks, no components, no offline handling, no skeleton loaders, no docs folder. The prompt asks for a full production-ready app and what is delivered is a well built but its incomplete. 

  

Dimension 4: Style & Presentation - 3.5/5 

The code is clean and consistent. CommonJS is used throughout the entire codebase, with no mix ups. File names exactly match what the prompt specifies. The .env.example files are nicely commented, so a developer knows what each variable is for. The auth middleware and token utilities have clear block comments explaining what each function does. No unnecessary files, no duplicates. 

  

Dimension 5: Coherence - 3.5/5 

The design logic holds together well. The JWT expiry set in .env.example matches what token.utils.js uses. The SHA256 hash in token.utils.js is used correctly again in auth.middleware.js to look up the same token in the database. The axios interceptor on the frontend knows to call /auth/refresh which aligns with what the backend is supposed to expose. bcrypt lives only in the User model as a pre save hook, one place, one responsibility. The only coherence breaks come from referenced files that don't exist (routes, pages, Spinner), which break the chain at runtime. 

  

Dimension 6: Helpfulness - 2.5/5 

The Gemini's code did deliver are really useful: the connectDB.js with retry logic is production ready out of the box, the token utilities are a complete drop-in with generate, verify, and hash all in one place, the auth middleware with DB token verification is properly secure, and the axios interceptor is one of the better implementations. The .env.example files save real setup time. But since there are no controllers, no routes, no validators, no pages, and no hooks a developer picking this up still has to write all of the hardest and most time taking parts from scratch. 

  

Dimension 7: Creativity - 3.5/5 

A few genuinely smart decisions stand out. Using SHA256 (crypto.createHash) for token hashing is the correct cryptographic choice, it is fast and reliable, meaning the same token always produces the same hash so you can look it up in the database reliably. The axios interceptor uses a request queue pattern where all concurrent requests that get a 401 are queued up and retried together once the refresh succeeds.The exponential backoff in connectDB (attempts * 2000ms) is proper retry math. The isModified('password') check in the bcrypt pre save hook is a subtle but important detail that prevents rehashing on unrelated updates. The Token model includes a type field (access/refresh) which makes it more extensible than a simple token store.

**Response B (ChatGPT):**

Dimension 1: Correctness - 1.5/5 

The server will not start at all because the package.json is missing "type": "module" and half the files use ES6 import/export syntax, Node.js will throw a SyntaxError before anything runs. Even if that is fixed, the authenticated endpoints are all broken because authMiddleware.js sets req.user = { id: ... } but every single controller then uses req.user._id, which is undefined. The userController calls user.comparePassword() but that method is never defined in the User model. The logout function hashes the refresh token with bcrypt, which produces a different hash each time due to random salt and then tries to delete the token using that new hash, so the stored token is never found and logout never actually clears the session. Three route files also try to import middleware files using the wrong filenames, so they will also crash as soon we run the command npm run dev. 

  

Dimension 2: Relevance - 2/5 

The prompt explicitly names the files App.js and Server.js with capital letters which is exactly asked for. The prompt says "never commit .env files, add proper commented instruction and variable name", there is no .env.example on the client or server side. The prompt does not mention TypeScript anywhere, still it introduced it on the frontend. The prompt asks for one api/axios.js file still it has two (axios.js and axios.ts), one of with incomplete code and an empty 401 handler. The auth middleware ignores the prompt's explicit instruction to "verify once again with the token saved in the database" and only checks the JWT signature. 

  

Dimension 3: Completeness - 3.5/5 

This is where ChatGPT earns its score. The full auth flow is there - register, login, logout, forgot password, reset password, refresh token, and even a Google login stub. Task CRUD is written with pagination, status/priority/search filters, a past-due-date warning in the response, and user isolation so one user can't touch another's tasks. Profile management - view, update name/email, change password - is all there. Validators are written for auth, tasks, and users. The email utility is wired up. Token rotation (issue new pair on refresh) is implemented. These are the hardest and most time-consuming parts of the prompt, and they're present. Frontend pages are mostly stubs though, hooks are missing entirely, there's no offline handling, no skeleton loaders, and no docs folder. 

  

Dimension 4: Style & Presentation - 2/5 

All three controllers have proper inline comments and the code inside them reads clearly. The custom Tailwind theme with semantic HSL color names (primary, accent, surface, background) in a nice design flow, But the codebase has a serious consistency problem as some files use import/export (app.js, authController, generateTokens, models) while others in the exact same folders use require/exports (taskController, userController, sendEmail, all validators, all route files). There are also two error handler files doing the same thing (error.middleware.js and errorHandler.js), two axios files with conflicting behavior, and Tailwind CSS placed in dependencies instead of devDependencies which disturbs the production build. 

  

Dimension 5: Coherence - 1.5/5 

The internal contradictions in the code are the biggest problem. The middleware and the controllers disagree on the same property name (req.user.id vs req.user._id) and this breaks every protected endpoint. The User model and the controller that uses it disagree on where password hashing happens, the model has no pre save hook but userController calls user.comparePassword() which does not exist. The route files in the routes folder import middleware files using names that do not match the actual paths, in the middlewares folder. The user routes file (user.routes.js) exists and is complete but is never imported in routeConfig.js, making all profile endpoints permanently unreachable. The Layout component in the frontend uses <Outlet /> which is meant for nested routes, but the routing structure passes pages as children that is why the page content never renders. 

  

Dimension 6: Helpfulness - 3/5 

Despite all the bugs, ChatGPT gives a developer a lot to work with. The auth flow, task CRUD with real edge cases, profile management, validators, and the email utility are all written out, a developer can read the controller code, understand the intended logic, fix the bugs, and ship something. The token rotation pattern in generateTokens.js shows how refresh should work. The task controller shows exactly how pagination and filtering should be implemented. These pieces save meaningful development time even in their broken state. The big hit is no .env.example, as developer has no idea what environment variables to configure without digging through the source code. Frontend is barely helpful (two stub pages, no hooks, no resource API files). 

  

Dimension 7: Creativity - 2.5/5 

A few good ideas: the compound MongoDB index on { userId, status } is smarter than a simple title index because it directly speeds up the most common query (fetch this user's pending tasks). The rotateRefreshToken function deletes the old token and issues a fresh pair, a proper security pattern. The toast.error('Session expired') before redirecting to login is a small but thoughtful UX detail. The HSL based Tailwind color system is easy to retheme. However, the decision to use bcrypt to hash refresh tokens is a meaningful mistake as bcrypt is designed for passwords precisely because it's slow and uses random salt, which means the same token hashes differently every time. This makes it impossible to look up a token by hash directly in the database, which is exactly why the logout function is broken. SHA256 is the right tool here, deterministic and fast.

# Evaluation:

Likert Score: 3

Final Verdict

Response A is better than Response B. Both codebases crash on startup, but for very different reasons and those differences matter a lot. Response A crashes because it tries to load a routes file that simply does not exist yet, which is an easy fix: create the file and the server runs. Response B crashes because it mixes two incompatible JavaScript module systems (import/export and require/exports) across the same codebase without ever declaring "type": "module" in package.json for this the Node.js throws a SyntaxError before a single line of business logic executes, and fixing it means auditing and converting every file in the project. Even after that is fixed, every single protected endpoint in Response B is silently broken because authMiddleware.js sets req.user = { id: payload.sub } while taskController.js and userController.js both read req.user._id,  which is always undefined which means task creation, task editing, profile updates, and password changes all fail quietly at runtime with no obvious error. Response B's logout is also permanently broken: it uses bcrypt.hash() to hash the refresh token before deleting it, but bcrypt uses a random salt every time, so the hash it produces never matches the one stored in the database but users can never actually be logged out. Response A doesn't have these logical contradictions inside its existing code. What it does have is the token utilities, the auth middleware with proper database verification, the axios refresh interceptor, the bcrypt model hook and that is all correct and would work the moment the missing pieces are added. Response B writes more code, covers more features, and gets closer to the full prompt on the surface, but the code it delivers actively breaks itself in ways that are harder to find, harder to trust, and riskier to build.


