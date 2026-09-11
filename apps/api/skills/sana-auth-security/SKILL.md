---
name: sana-auth-security
description: >
  Sana auth model and security conventions: login -> access + refresh tokens,
  rotating refresh flow, JWTProtected middleware, bcrypt, secrets in .env, and a
  checklist to avoid leaking data through JSON or MongoDB.
  Trigger: auth, JWT, login, refresh token, sessions, token security, password
  storage, security review of a route/model/endpoint, "seguridad", "token".
license: Apache-2.0
metadata:
  author: gentleman-programming
  version: "1.0"
---

## When to Use

Use this skill when:
- Changing authentication: login, `/me`, refresh token, sessions
- Handling JWT generation/validation or secrets
- Adding a new endpoint that touches user data or needs protection
- Reviewing a route/model for security (data leaks, auth bypasses)
- Ongoing: EVERY new endpoint must be JWT-protected unless it is login / refresh / logout

## Auth Flow (as implemented)

```
POST /login   (body: email, password, remember_me?)
  services.Login:
    1. Find user by email
    2. user.CheckPassword(plain)  -> bcrypt compare (never plaintext)
    3. Generate access token  (utils.GenerateJWT, 24h, signed with JWT_SECRET)
    4. Generate refresh token (utils.GenerateRefreshJWT, remember_me -> 30d, else 24h, JWT_REFRESH_SECRET)
    5. Persist audit Session{UserId, UserEmail, ClientIp, UserAgent, RememberMe,
       RefreshToken, ExpiresAt} in snSessions
  -> sets HttpOnly cookie `refresh_token` (Path /api/v1) and returns { token }

GET /me            <- middlewares.JWTProtected() then Me
  parsed JWT is at ctx.Locals("user"); read claims["email"]

POST /refreshToken  (no body - reads the `refresh_token` cookie)
  services.RefreshToken:
    1. ValidateRefreshToken (refresh key + expiry + HS256)
    2. ExtractEmailFromRefreshToken
    3. Load session by refresh_token + is_blocked:false; reject if session.ExpiresAt passed
    4. Load user, mint NEW access + refresh tokens (ROTATION, keeps the session lifetime)
    5. UpdateOne on the session (old token -> new token, refresh_count +1, last_used_at)
  -> ROTATES the cookie and returns new { token }

POST /logout
  services.Logout: marks the session is_blocked:true (reason "logout")
  -> clears the `refresh_token` cookie
```

## Critical Patterns

- **Two secrets, two keys.** Access tokens use `EnvData.SkKey` (`JWT_SECRET`);
  refresh tokens use `EnvData.SkRefreshKey` (`JWT_REFRESH_SECRET`). A token signed
  with one key MUST NOT validate under the other. Never hardcode keys — read from
  `.env`; `.env` is gitignored but `.env.example` is committed.
- **Refresh must rotate.** `RefreshToken` replaces the stored token, bumps
  `refresh_count`/`last_used_at`, and rejects blocked sessions (`MatchedCount == 0` ->
  error). Never echo the received token back.
- **Refresh token travels in an HttpOnly cookie**, never in a JSON body: name
  `refresh_token`, `Path: /api/v1`, `SameSite: Lax`, `HTTPOnly: true`,
  `Secure: utils.EnvData.CookieSecure`. `remember_me: true` on login -> 30-day cookie
  + token; false -> 24h session cookie. The cookie is ROTATED on every refresh and
  cleared on logout. Endpoints reading it are public (no `JWTProtected()`): /login,
  /refreshToken, /logout.
- **`ValidateToken` / `ValidateRefreshToken` return an ERROR when the token is bad** —
  the logic must be `if err != nil { return false }` style. Do NOT invert it (this
  was a real historical bug in this repo).
- **Signing method check**: always verify `token.Method.(*jwt.SigningMethodHMAC)`
  in the keyfunc to block `alg=none` / key-confusion attacks.
- **`me` leaks everything**: `GET /me` returns the raw `models.User` struct.
  Fields without `json:"-"` are exposed. `Password` and `RefreshToken` MUST keep
  `json:"-"`.
- **bcrypt**: store only `[]byte` hashes from `HashPassword`; compare with
  `CheckPassword`. Cost is 5 in this repo (acceptable for dev).
- **JWT middleware** (`middlewares/auth.middleware.go`):
  - `SigningKey` = access secret, `SigningMethod: "HS256"`.
  - On success, gofiber/jwt stores the parsed token at `ctx.Locals("user")`
    (default `ContextKey`). Handlers read `ctx.Locals("user").(*jwt.Token)`.
  - Public routes: `POST /login`, `POST /refreshToken`, `POST /logout` (cookie-based).
    Everything else gets `JWTProtected()`.

## Do / Don't

- DO put `json:"-"` on `Password` and `RefreshToken` in `models/users.model.go`.
- DO export every persisted field with a `bson:"..."` tag — unexported fields are
  silently dropped by the Mongo driver. `isActive` missing from DB broke `/me`-style
  queries historically in this repo.
- DON'T return `Password`, `RefreshToken`, or `DEF_PASS` in any JSON response.
- DON'T store plaintext passwords; DON'T log passwords or tokens.
- DON'T accept an access token on `/refreshToken` — it must be a refresh token.
- DON'T hardcode JWT secrets; generate with
  `openssl rand -base64 48` and put them in `.env` only.

## Security Review Checklist

- [ ] New endpoint wrapped in `middlewares.JWTProtected()` (unless it is login)
- [ ] No `Password` / `RefreshToken` back in JSON (`json:"-"`)
- [ ] All persisted struct fields exported + explicit `bson:"..."`
- [ ] Token functions return errors on invalid input (not `nil`)
- [ ] Secrets come from env, not literals
- [ ] Session writes use the rotated refresh token (no echo)
- [ ] `go build ./...` and `go vet ./...` clean

## Commands

```bash
go build ./... && go vet ./...
openssl rand -base64 48         # generate a JWT secret
go run .                        # smoke test /login, /me, /refreshToken
```

## Resources

- **Routes**: `routes/auth.routes.go` (Login / Me / RefreshToken).
- **Service**: `services/auth.services.go` (Login / RefreshToken / Me).
- **Tokens**: `utils/token.utils.go` (GenerateJWT, GenerateRefreshJWT, Validate*, ExtractEmail*).
- **Middleware**: `middlewares/auth.middleware.go`.
- **Model**: `models/users.model.go`, `models/sessions.model.go`.