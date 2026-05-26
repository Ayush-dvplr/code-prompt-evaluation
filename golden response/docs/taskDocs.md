# Task API Documentation

All task routes require `Authorization: Bearer <accessToken>`. Base: `/api/v1/tasks`.

---

## GET /api/v1/tasks

Returns a paginated list of the authenticated user's tasks (soft-deleted excluded).

**Query params:**

| Param | Type | Default | Notes |
|---|---|---|---|
| `page` | number | 1 | — |
| `limit` | number | 20 | max 100 |
| `status` | string | — | `pending` \| `in-progress` \| `completed` |
| `priority` | string | — | `low` \| `medium` \| `high` |
| `search` | string | — | regex match on `title` (case-insensitive) |
| `sortBy` | string | `createdAt` | `createdAt` \| `dueDate` |
| `sortOrder` | string | `desc` | `asc` \| `desc` |

**Success 200:**
```json
{
  "success": true,
  "data": [{ "_id": "...", "title": "Buy milk", "status": "pending", "priority": "medium", ... }],
  "meta": { "page": 1, "limit": 20, "total": 42, "totalPages": 3 }
}
```

---

## GET /api/v1/tasks/:id

**Success 200:**
```json
{ "success": true, "data": { "_id": "...", "title": "Buy milk", ... } }
```

**Errors:** `404 NOT_FOUND`

---

## POST /api/v1/tasks

**Request body:**
```json
{
  "title": "Buy milk",
  "description": "2% milk, 2 litres",
  "status": "pending",
  "priority": "low",
  "dueDate": "2025-12-31"
}
```

Only `title` is required. Past `dueDate` is accepted but a `warning` is returned.

**Success 201:**
```json
{
  "success": true,
  "data": { "_id": "...", "title": "Buy milk", ... },
  "warning": "Due date is in the past"
}
```

**Errors:** `400 VALIDATION_ERROR`

---

## PATCH /api/v1/tasks/:id

Partial update — send only the fields to change. At least one field required.
Verifies `userId` matches authenticated user before updating.

**Request body:**
```json
{ "status": "completed" }
```

**Success 200:**
```json
{ "success": true, "data": { "_id": "...", "status": "completed", ... } }
```

**Errors:** `403 FORBIDDEN` | `404 NOT_FOUND` | `400 VALIDATION_ERROR`

---

## DELETE /api/v1/tasks/:id

Soft delete only — sets `isDeleted: true` and `deletedAt: <now>`. The record remains in the database but is hidden from all queries via a pre-find hook.

**Success 200:**
```json
{ "success": true, "data": { "message": "Task deleted successfully" } }
```

**Errors:** `403 FORBIDDEN` | `404 NOT_FOUND`
