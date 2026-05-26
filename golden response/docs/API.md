# API Documentation — Todo App

A RESTful JSON API built with Node.js 18, Express 4, and MongoDB.

**Base URL:** `http://localhost:5000/api/v1`

**Authentication:** Pass the access token in every protected request:
```
Authorization: Bearer <accessToken>
```

---

## Route Table

| Name | URL | Method | Auth | Required Body | Optional Body / Params | Notes |
|---|---|---|---|---|---|---|
| Register | `/auth/register` | POST | No | `email`, `password`, `displayName` | — | Returns token pair + user |
| Login | `/auth/login` | POST | No | `email`, `password` | — | Returns token pair + user |
| Google OAuth | `/auth/google` | POST | No | `idToken` | — | Firebase ID token from popup |
| Refresh Token | `/auth/refresh` | POST | No | `refreshToken` | — | Rotates token; hashed copy validated in DB |
| Logout | `/auth/logout` | POST | No | `refreshToken` | — | Deletes hashed token from DB |
| Forgot Password | `/auth/forgot-password` | POST | No | `email` | — | Always returns same message (anti-enum) |
| Reset Password | `/auth/reset-password` | POST | No | `token`, `newPassword` | — | One-time use token |
| Get Profile | `/user/profile` | GET | Yes | — | — | Returns authenticated user |
| Update Profile | `/user/profile` | PUT | Yes | at least one field | `displayName`, `email`+`currentPassword`, `avatar` | Email change requires `currentPassword` |
| Change Password | `/user/password` | PATCH | Yes | `currentPassword`, `newPassword` | — | min 8 chars |
| List Tasks | `/tasks` | GET | Yes | — | `page`, `limit`, `status`, `priority`, `search`, `sortBy`, `sortOrder` | Paginated, soft-deleted excluded |
| Get Task | `/tasks/:id` | GET | Yes | — | — | Own tasks only |
| Create Task | `/tasks` | POST | Yes | `title` | `description`, `status`, `priority`, `dueDate` | Warns if `dueDate` in past |
| Update Task | `/tasks/:id` | PATCH | Yes | at least one task field | — | Own tasks only; 403 on mismatch |
| Delete Task | `/tasks/:id` | DELETE | Yes | — | — | Soft delete only |

---

## Standard Response Envelope

**Success (single object):**
```json
{ "success": true, "data": {} }
```

**Success (list):**
```json
{
  "success": true,
  "data": [],
  "meta": { "page": 1, "limit": 20, "total": 42, "totalPages": 3 }
}
```

**Error:**
```json
{
  "success": false,
  "message": "Human readable message",
  "code": "SCREAMING_SNAKE_CASE",
  "errors": [{ "field": "email", "message": "is required" }]
}
```

---

## HTTP Status Codes

| Code | Meaning |
|---|---|
| 200 | OK |
| 201 | Created |
| 400 | Validation failed |
| 401 | Invalid credentials / expired token |
| 403 | Forbidden (wrong owner) |
| 404 | Not found |
| 409 | Conflict (duplicate key) |
| 422 | Semantic error |
| 429 | Too many requests (rate limit) |
| 500 | Internal server error |
