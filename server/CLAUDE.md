# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Development
npm run dev            # start with hot reload (alias: start:dev)
npm run build          # compile to dist/
npm run start:prod     # run compiled output

# Linting & formatting
npm run lint           # eslint with auto-fix
npm run format         # prettier

# Tests
npm run test           # jest unit tests
npm run test:watch     # watch mode
npm run test:cov       # coverage report
npm run test:e2e       # e2e tests (test/jest-e2e.json)

# Single test file
npx jest src/routes/auth/auth.service.spec.ts

# Database
npx prisma migrate dev    # run migrations
npx prisma generate       # regenerate client (src/generated/prisma/)
npx prisma studio         # visual DB browser

# Seed / init scripts
npm run initSeedData      # seed initial data
npm run initPermissions   # create default permissions

# Email templates (react-email)
npm run email:dev         # preview server
npm run email:build       # build templates
```

## Required Environment Variables

Validated at startup via Zod in `src/shared/config.ts` — the server exits if any are missing:

`DATABASE_URL`, `ACCESS_TOKEN_SECRET`, `ACCESS_TOKEN_EXPIRES_IN`, `REFRESH_TOKEN_SECRET`, `REFRESH_TOKEN_EXPIRES_IN`, `PAYMENT_API_KEY`, `ADMIN_NAME`, `ADMIN_PASSWORD`, `ADMIN_EMAIL`, `ADMIN_PHONE`, `OTP_EXPIRES_IN`, `RESEND_API_KEY`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_REDIRECT_URI`, `GOOGLE_CLIENT_REDIRECT_URI`, `APP_NAME`, `PREFIX_STATIC_ENDPOINT`, `S3_REGION`, `S3_ACCESS_KEY`, `S3_SECRET_KEY`, `S3_BUCKET_NAME`, `REDIS_URL`

## Architecture Overview

### NestJS + Prisma E-commerce Backend

Stack: NestJS 11, Prisma 7 (PostgreSQL), BullMQ (Redis), Socket.io WebSockets, nestjs-zod, AWS S3, Resend email, nestjs-i18n.

**Prisma client** is generated into `src/generated/prisma/` (not the default `node_modules`). Import from `src/generated/prisma/client`.

### Module Structure

Each route module under `src/routes/<domain>/` follows a strict layered pattern:

```
<domain>.module.ts       — NestJS module wiring
<domain>.controller.ts   — HTTP handlers, uses DTOs and decorators
<domain>.service.ts      — Business logic
<domain>.repo.ts         — All Prisma queries (database layer)
<domain>.model.ts        — Zod schemas and inferred TypeScript types
<domain>.dto.ts          — NestJS DTOs created with createZodDto()
<domain>.error.ts        — Pre-instantiated exception objects
```

Some complex domains split further (e.g., `product/` has `manage-product.controller.ts` + `manage-product.service.ts` for admin operations separate from public ones).

### Global SharedModule (`src/shared/shared.module.ts`)

Marked `@Global()`, providing everywhere without import:
- `PrismaService` — database access
- `TokenService` — JWT access/refresh token operations
- `HashingService` — bcrypt password hashing
- `EmailService` — Resend-based email (`.tsx` template files in `src/shared/email-templates/`)
- `TwoFactorAuthService` — TOTP and email OTP
- `S3Service` — AWS S3 file upload/presigned URLs
- `SharedUserRepository`, `SharedRoleRepository`, `SharedPaymentRepo` — cross-module data access
- `AccessTokenGuard`, `PaymentApiKeyGuard`

### Authentication & Authorization

**Default behavior**: All routes require a valid Bearer JWT. The `AuthenticationGuard` is registered globally via `APP_GUARD`.

**Decorators to override:**
- `@IsPublic()` — skip authentication entirely
- `@Auth([AuthType.Bearer, AuthType.PaymentAPIKey], { condition: ConditionGuard.Or })` — custom auth combinations

**Permission check**: `AccessTokenGuard` automatically verifies the user's role has a permission matching the exact HTTP method + path. Permissions are stored in the DB per role.

**Extracting request data:**
- `@ActiveUser()` — decoded JWT payload (userId, roleId, etc.)
- `@ActiveRolePermissions()` — the role's permissions attached to the request
- `@IP()` / `@UserAgent()` — request metadata

### Validation & Serialization (nestjs-zod)

1. Define schemas in `<domain>.model.ts` using Zod
2. Create DTOs in `<domain>.dto.ts` via `createZodDto(SchemaName)`
3. Use DTOs as `@Body()` types in controllers
4. Add `@ZodSerializerDto(ResponseDtoClass)` on controller methods to serialize responses

The global `CustomZodValidationPipe` (registered via `APP_PIPE`) maps Zod errors to `422 UnprocessableEntityException` with `{ message, path }` objects.

### Error Handling Pattern

Errors are pre-instantiated as module-level constants in `.error.ts` files — throw them directly:

```typescript
// auth.error.ts
export const EmailAlreadyExistsException = new UnprocessableEntityException([
  { message: 'Error.EmailAlreadyExists', path: 'email' },
]);

// usage in service
throw EmailAlreadyExistsException;
```

Error message strings reference i18n keys resolved from `src/i18n/{lang}/error.json`.

### BullMQ Queue

Queue name: `PAYMENT_QUEUE_NAME = 'payment'` (from `src/shared/constants/queue.constant.ts`).

Pattern: modules that enqueue jobs have a `<domain>.producer.ts` injecting `@InjectQueue(PAYMENT_QUEUE_NAME)`. The single consumer is `src/queues/payment.consumer.ts`, registered globally in `AppModule`.

### WebSockets

`WebsocketModule` provides Socket.io gateways (`ChatGateway`, `PaymentGateway`). A custom `WebSocketAdapter` wraps the NestJS socket.io adapter, initialized in `main.ts`.

### i18n

Language files in `src/i18n/{en,vi}/error.json`. Language is resolved from `?lang=` query param or `Accept-Language` header. Types are auto-generated into `src/generated/i18n.generated.ts` on startup.

### Roles

Three built-in roles: `ADMIN`, `CLIENT`, `SELLER` (see `src/shared/constants/role.constant.ts`). Role-based permission filtering happens at the `AccessTokenGuard` level.
