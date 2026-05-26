# User API Documentation

All user routes require `Authorization: Bearer <accessToken>`. Base: `/api/v1/user`.

---

## GET /api/v1/user/profile

**Success 200:**
```json
{
  "success": true,
  "data": {
    "id": "64abc...",
    "email": "jane@example.com",
    "displayName": "Jane Doe",
    "avatar": null
  }
}
```

**Errors:** `404 NOT_FOUND`

---

## PUT /api/v1/user/profile

Update display name, avatar, or email. At least one field required.
Changing `email` requires `currentPassword`.

**Request body (display name / avatar):**
```json
{ "displayName": "Jane Smith", "avatar": "https://example.com/pic.jpg" }
```

**Request body (email change):**
```json
{ "email": "newjane@example.com", "currentPassword": "secret123" }
```

**Success 200:**
```json
{
  "success": true,
  "data": { "id": "...", "email": "newjane@example.com", "displayName": "Jane Smith", "avatar": null }
}
```

**Errors:** `400 VALIDATION_ERROR` | `400 PASSWORD_REQUIRED` | `401 INVALID_CREDENTIALS` | `404 NOT_FOUND`

---

## PATCH /api/v1/user/password

**Request body:**
```json
{ "currentPassword": "oldSecret123", "newPassword": "newSecret456" }
```

**Success 200:**
```json
{ "success": true, "data": { "message": "Password changed successfully" } }
```

**Errors:** `401 INVALID_CREDENTIALS` | `400 VALIDATION_ERROR` | `404 NOT_FOUND`
