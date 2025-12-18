# JWT + Persistent Cookie Auto Login

This document describes the changes for JWT authentication with a persistent cookie (7 days) to support automatic login on subsequent visits.

## API changes

All responses use the unified `Result` envelope: `{ "code": 0|errorCode, "msg": "success|error", "data": ... }`.

### 1) POST /api/auth/login
- Behavior: On successful login, the server issues a JWT and also sets a persistent cookie.
- Cookie: `HOSPITAL_AUTH_TOKEN`, `HttpOnly`, `Path=/`, `Max-Age=604800`, `SameSite=Lax`
- Response payload:
```json
{ 
  "code": 0,
  "msg": "success",
  "data": {
    "token": "string",
    "username": "string",
    "role": "string"
  }
} 
```

### 2) GET /api/auth/me
- Behavior: Returns the current user info based on the JWT (Authorization header or cookie).
- Auth: Required.
- Response:
```json
{
  "code": 0,
  "msg": "success",
  "data": {
    "token": null,
    "username": "string",
    "role": "string"
  }
}
```

### 3) POST /api/auth/logout
- Behavior: Clears the persistent cookie (`Max-Age=0`).
- Auth: Required.
- Response:
```json
{
  "code": 0,
  "msg": "success",
  "data": "退出成功"
}
```

## Token validation sources

- Primary: `Authorization: Bearer <token>`
- Fallback: Cookie `HOSPITAL_AUTH_TOKEN`

## Config changes

- `jwt.expiration` is set to `604800` (seconds = 7 days).
- `jwt.secret` must be long enough for HS512 (>= 64 bytes).

## Database changes

- None.

## Notes for frontend

- If using cookies in browser requests, send credentials (`withCredentials: true`).
- If frontend and backend are on different sites and you need cross-site cookies, adjust `SameSite=None` and `Secure=true` accordingly.
