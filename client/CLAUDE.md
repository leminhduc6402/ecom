# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Commands

```bash
npm run dev       # Start dev server (Vite, default port 5173)
npm run build     # Type-check then build for production
npm run preview   # Preview production build
npm run lint      # Run ESLint
```

No test runner is configured yet.

## Architecture

### Entry point & providers
`src/main.tsx` wraps the app with Ant Design `ConfigProvider` (primary color `#3525cd`), TanStack `QueryClientProvider`, and `BrowserRouter`. `src/App.tsx` defines all routes.

### Route structure
Two protected route wrappers live in `src/router/ProtectedRoutes.tsx`:
- `ClientRoute` — requires a valid access token in localStorage
- `AdminRoute` — additionally requires `user.role.name === 'ADMIN'`

Pages are split under `src/pages/admin/` and `src/pages/client/`.

### Auth & session management
`src/hooks/useAuth.ts` is the single source of truth for auth state. It reads/writes to localStorage (`accessToken`, `refreshToken`, `authUser`). Helper exports (`hasToken`, `getStoredUser`, `persistAuth`, `clearAuth`) are used directly in route guards.

After login, the hook fetches `/profile` to get full user data (including `role`) before redirecting.

### API layer
All API modules live in `src/api/`. Two HTTP utilities are defined in `auth.api.ts`:
- `publicRequest` — unauthenticated fetch (POST/GET)
- `fetchWithAuth` — authenticated fetch with automatic access-token refresh on 401 (via `POST /auth/refresh-token`)

`BASE_URL` is hardcoded to `http://localhost:3000` — the NestJS backend.

| Module | Purpose |
|---|---|
| `auth.api.ts` | Login, register, OTP, Google OAuth, 2FA, logout |
| `profile.api.ts` | `GET /profile`, update profile, change password |
| `user.api.ts` | Admin CRUD for users, role listing |
| `media.api.ts` | S3 presigned URL for avatar upload |

### Form validation pattern
Ant Design forms are validated with Zod schemas via the utility in `src/utils/zodForm.ts`. Call `validateWithZod(schema, values, form)` inside `onFinish` handlers — it sets field-level errors directly on the Ant Design form instance and returns the parsed data or `null`.

### Schemas
`src/schemas/auth.schema.ts` defines all auth-related Zod schemas and exports `*Input` types via `z.infer<>`.

### Types
`src/types/auth.ts` — `AuthUser`, `AuthResponse`, `TwoFactorSetupResponse`  
`src/types/user.ts` — `User`, `Profile`, `Role`, `PaginatedResponse<T>`

### Design system
Tailwind config (`tailwind.config.js`) defines a custom palette under semantic names (`surface`, `primary`, `on-surface`, etc.) matching Material Design 3 tokens. Use these tokens instead of raw colors. Font families: `font-headline` (Hanken Grotesk) and `font-body` (Inter).

### Media upload flow
Avatar uploads use a two-step presigned URL flow: call `mediaApi.getPresignedUrl()` to get a presigned S3 URL, then PUT the file directly to S3, and store the returned `url` in the user record.
