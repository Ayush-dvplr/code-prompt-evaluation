# Auth API Documentation

All auth routes are public (no token required) unless noted. Base: `/api/v1/auth`.

---

## POST /api/v1/auth/register

**Request body:**
```json
{ "email": "jane@example.com", "password": "secret123", "displayName": "Jane Doe" }
```

**Success 201:**
```json
{
  "success": true,
  "data": {
    "accessToken": "eyJ...",
    "refreshToken": "eyJ...",
    "user": { "id": "64abc", "email": "jane@example.com", "displayName": "Jane Doe", "avatar": null }
  }
}
```

**Errors:** `409 EMAIL_EXISTS` | `400 VALIDATION_ERROR`

---

## POST /api/v1/auth/login

**Request body:**
```json
{ "email": "jane@example.com", "password": "secret123" }
```

**Success 200:** Same shape as register.

**Errors:** `401 INVALID_CREDENTIALS` | `400 VALIDATION_ERROR`

---

## POST /api/v1/auth/google

Firebase ID token obtained from `signInWithPopup` on the frontend.

**Request body:**
```json
{ "idToken": "<firebase-id-token>" }
```

**Success 200:** Same shape as login. Creates user on first sign-in.

**Errors:** `400 MISSING_TOKEN` | `401 TOKEN_INVALID`

---

## POST /api/v1/auth/refresh

Rotates the refresh token. Old token is deleted from DB; new pair issued.

**Request body:**
```json
{ "refreshToken": "eyJ..." }
```

**Success 200:**
```json
{ "success": true, "data": { "accessToken": "eyJ...", "refreshToken": "eyJ..." } }
```

**Errors:** `401 TOKEN_INVALID` | `401 TOKEN_REUSED`

---

## POST /api/v1/auth/logout

Deletes the hashed refresh token from the DB.

**Request body:**
```json
{ "refreshToken": "eyJ..." }
```

**Success 200:**
```json
{ "success": true, "data": { "message": "Logged out successfully" } }
```

---

## POST /api/v1/auth/forgot-password

Always returns the same response regardless of whether the email exists (prevents enumeration).

**Request body:**
```json
{ "email": "jane@example.com" }
```

**Success 200:**
```json
{ "success": true, "data": { "message": "If that email exists, a reset link was sent." } }
```

---

## POST /api/v1/auth/reset-password

Token is single-use — deleted from DB after successful reset.

**Request body:**
```json
{ "token": "<reset-token>", "newPassword": "newSecret123" }
```

**Success 200:**
```json
{ "success": true, "data": { "message": "Password reset successfully. Please sign in." } }
```

**Errors:** `400 TOKEN_INVALID` | `400 TOKEN_REUSED` | `404 NOT_FOUND`
