# Todo App — API Documentation

A RESTful JSON API built with Node.js, Express 4, and MongoDB.

**Base URL:** `http://localhost:5000/api/v2`

---

## All Routes

| Name | URL | Method | Auth | Required Body | Optional Body | Notes |
|---|---|---|---|---|---|---|
| Register | `/auth/register` | POST | No | `email`, `password`, `displayName` | — | Sends welcome email |
| Login | `/auth/login` | POST | No | `email`, `password` | — | Returns tokens + user |
| Refresh Token | `/auth/refresh` | POST | No | `refreshToken` | — | Rotates refresh token |
| Logout | `/auth/logout` | POST | No | `refreshToken` | — | Deletes token from DB |
| Forgot Password | `/auth/forgot-password` | POST | No | `email` | — | Sends reset email |
| Reset Password | `/auth/reset-password` | POST | No | `token`, `newPassword` | — | One-time use token |
| Get Profile | `/user/profile` | GET | Yes | — | — | Returns user object |
| Update Profile | `/user/profile` | PUT | Yes | at least one of: `displayName`, `email`, `avatar` | — | Partial update |
| Change Password | `/user/password` | PATCH | Yes | `currentPassword`, `newPassword` | — | min 8 chars |
| Get Tasks | `/tasks` | GET | Yes | — | `page`, `limit`, `status`, `priority`, `search` | Paginated |
| Get Task | `/tasks/:id` | GET | Yes | — | — | Own tasks only |
| Create Task | `/tasks` | POST | Yes | `title` | `description`, `status`, `priority`, `dueDate` | Warns if dueDate in past |
| Update Task | `/tasks/:id` | PATCH | Yes | at least one task field | — | Own tasks only |
| Delete Task | `/tasks/:id` | DELETE | Yes | — | — | Own tasks only |

---

## Authentication

Pass the access token in the `Authorization` header:
```
Authorization: Bearer <accessToken>
```

---

## Standard Response Formats

**Successful login / register:**
```json
{
  "accessToken": "eyJ...",
  "refreshToken": "eyJ...",
  "user": {
    "id": "64abc...",
    "email": "jane@example.com",
    "displayName": "Jane Doe",
    "avatar": null
  }
}
```

**Task list response:**
```json
{
  "tasks": [...],
  "pagination": {
    "total": 42,
    "page": 1,
    "limit": 20,
    "totalPages": 3
  }
}
```

**Create task — past due date:**
```json
{
  "task": { ... },
  "warning": "Due date is in the past"
}
```

---

## HTTP Status Codes

| Code | Meaning |
|---|---|
| 200 | OK |
| 201 | Created |
| 400 | Validation failed |
| 401 | Invalid or expired token / wrong credentials |
| 404 | Resource not found |
| 429 | Too many requests (rate limit hit) |
| 500 | Internal server error |
