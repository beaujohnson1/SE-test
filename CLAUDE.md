# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Next.js 15 SaaS starter kit designed for building photo restoration services (MemoryRevive). The application uses a modern tech stack with Better Auth for authentication, Polar.sh for subscriptions, OpenAI for AI features, Cloudflare R2 for file storage, and Neon PostgreSQL with Drizzle ORM.

## Common Development Commands

### Development
```bash
npm run dev          # Start development server with Turbopack
```

### Database Operations
```bash
npx drizzle-kit generate    # Generate migrations from schema changes
npx drizzle-kit push        # Push migrations to database
```

### Build & Deploy
```bash
npm run build       # Build production bundle
npm start           # Start production server
npm run lint        # Run ESLint
```

## Architecture Overview

### Authentication Flow
The application uses **Better Auth v1.2.8** with a plugin-based architecture:
- Better Auth handles user sessions, OAuth providers (Google), and account management
- The `@polar-sh/better-auth` plugin integrates subscription management directly into the auth system
- Session management uses database persistence via Drizzle adapter
- Middleware (`middleware.ts`) protects `/dashboard` routes and redirects authenticated users from auth pages

**Key files:**
- `lib/auth.ts` - Better Auth configuration with Polar.sh integration
- `lib/auth-client.ts` - Client-side auth utilities
- `middleware.ts` - Route protection logic
- `auth-schema.ts` - Auth-related type definitions

### Subscription Management (Polar.sh)
Subscriptions are managed through Polar.sh with webhook-driven state synchronization:

**Architecture:**
1. Better Auth's Polar plugin handles checkout flows and customer creation
2. Webhooks from Polar.sh (`/api/auth/[...all]/route.ts`) update the local `subscription` table
3. `lib/subscription.ts` provides helper functions to check subscription status

**Important webhook events handled:**
- `subscription.created`, `subscription.active`, `subscription.canceled`, `subscription.revoked`, `subscription.uncanceled`, `subscription.updated`

**Subscription helpers in `lib/subscription.ts`:**
- `getSubscriptionDetails()` - Get full subscription info for current user
- `isUserSubscribed()` - Boolean check for active subscription
- `hasAccessToProduct(productId)` - Check access to specific tier
- `getUserSubscriptionStatus()` - Returns: `"active" | "canceled" | "expired" | "none"`

**Polar.sh configuration uses these environment variables:**
- `POLAR_ACCESS_TOKEN` - API access token
- `POLAR_WEBHOOK_SECRET` - Webhook signature verification
- `NEXT_PUBLIC_STARTER_TIER` - Product ID for starter tier
- `NEXT_PUBLIC_STARTER_SLUG` - Product slug for starter tier

### Database Schema (Drizzle ORM)

The schema is defined in `db/schema.ts` with two main categories:

**Better Auth tables** (managed by Better Auth):
- `user` - User accounts with email, name, image, email verification status
- `session` - Active sessions with expiry, IP address, user agent
- `account` - OAuth provider accounts linked to users (supports multiple providers per user)
- `verification` - Email verification tokens and other verification flows

**Application tables:**
- `subscription` - Polar.sh subscription data (synced via webhooks)
  - Links to `user.id` via `userId` field
  - Tracks status, billing periods, cancellation state, product/customer IDs

**Database connection:**
- Configuration: `drizzle.config.ts`
- Connection setup: `db/drizzle.ts`
- Migrations: `db/migrations/`

### File Upload System (Cloudflare R2)

Files are stored in Cloudflare R2 (S3-compatible) using AWS SDK v3:
- Upload API route: `app/api/upload-image/route.ts`
- Upload utilities: `lib/upload-image.ts`
- Upload UI: `app/dashboard/upload/` directory

**Configuration requires:**
- `CLOUDFLARE_ACCOUNT_ID`
- `R2_UPLOAD_IMAGE_ACCESS_KEY_ID`
- `R2_UPLOAD_IMAGE_SECRET_ACCESS_KEY`
- `R2_UPLOAD_IMAGE_BUCKET_NAME`

### AI Integration (OpenAI)

OpenAI chat is integrated via the Vercel AI SDK:
- API route: `app/api/chat/route.ts`
- Uses `@ai-sdk/openai` package with streaming responses
- Chat interface: `app/dashboard/chat/` directory
- Markdown rendering with `react-markdown`

### Project Structure

```
app/
├── (auth)/              # Authentication pages (grouped route)
├── dashboard/           # Protected dashboard area
│   ├── _components/     # Dashboard-specific components
│   ├── chat/           # AI chat interface
│   ├── upload/         # File upload with R2 integration
│   ├── payment/        # Subscription management
│   └── settings/       # User settings & billing portal
├── pricing/            # Public pricing page
├── api/                # API routes
│   ├── auth/[...all]/  # Better Auth catch-all route
│   ├── chat/           # OpenAI chat endpoint
│   ├── subscription/   # Subscription status API
│   └── upload-image/   # R2 file upload endpoint
└── (other routes)/     # Public pages

components/
├── ui/                 # shadcn/ui components (Radix UI primitives)
└── homepage/           # Landing page sections

lib/
├── auth.ts            # Better Auth server configuration
├── auth-client.ts     # Client-side auth utilities
├── subscription.ts    # Subscription helper functions
├── upload-image.ts    # R2 upload utilities
└── utils.ts           # General utilities (cn, etc.)

db/
├── schema.ts          # Drizzle ORM schema definitions
├── drizzle.ts         # Database connection
└── migrations/        # Database migration files
```

## Key Development Patterns

### Checking User Subscription Status

```typescript
import { getSubscriptionDetails } from "@/lib/subscription";

// In a server component or API route
const { hasSubscription, subscription, error } = await getSubscriptionDetails();

if (hasSubscription && subscription?.status === "active") {
  // User has active subscription
}
```

### Protecting Features by Subscription

Use the subscription helpers to gate premium features:
```typescript
import { isUserSubscribed, hasAccessToProduct } from "@/lib/subscription";

const isSubscribed = await isUserSubscribed();
const hasPro = await hasAccessToProduct(process.env.NEXT_PUBLIC_PRO_TIER!);
```

### Getting Current User Session

```typescript
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

const session = await auth.api.getSession({
  headers: await headers(),
});

if (session?.user) {
  // User is authenticated
}
```

### Database Queries with Drizzle

```typescript
import { db } from "@/db/drizzle";
import { subscription } from "@/db/schema";
import { eq } from "drizzle-orm";

const userSubs = await db
  .select()
  .from(subscription)
  .where(eq(subscription.userId, userId));
```

### API Route Pattern

API routes should use Better Auth's session management:
```typescript
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export async function GET(request: Request) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    return new Response("Unauthorized", { status: 401 });
  }

  // Handle authenticated request
}
```

## Important Technical Notes

### Better Auth Plugin System
The auth configuration in `lib/auth.ts` uses Better Auth plugins:
- `polar()` - Main Polar.sh integration
  - `checkout()` - Handles subscription checkout flows
  - `portal()` - Customer billing portal access
  - `usage()` - Usage tracking for metered billing
  - `webhooks()` - Processes subscription state changes
- `nextCookies()` - Next.js cookie management

### Webhook Processing
The webhook handler in `lib/auth.ts` (line 87-186) performs upserts to the `subscription` table using Drizzle's `onConflictDoUpdate`. This ensures subscription data stays synchronized with Polar.sh without duplicates.

### Middleware Configuration
The middleware protects these routes:
- `/dashboard/:path*` - Requires authentication
- `/sign-in` - Redirects to dashboard if authenticated
- `/sign-up` - Redirects to dashboard if authenticated
- Webhook endpoints (`/api/payments/webhooks`) are explicitly allowed without auth

### Environment Variables Required

**Database:**
- `DATABASE_URL` - Neon PostgreSQL connection string

**Authentication:**
- `BETTER_AUTH_SECRET` - Session encryption secret
- `GOOGLE_CLIENT_ID` - Google OAuth client ID
- `GOOGLE_CLIENT_SECRET` - Google OAuth client secret

**Subscriptions (Polar.sh):**
- `POLAR_ACCESS_TOKEN` - Polar API token
- `POLAR_WEBHOOK_SECRET` - Webhook signature secret
- `NEXT_PUBLIC_STARTER_TIER` - Starter product ID
- `NEXT_PUBLIC_STARTER_SLUG` - Starter product slug
- `POLAR_SUCCESS_URL` - Post-checkout redirect path

**AI (OpenAI):**
- `OPENAI_API_KEY` - OpenAI API key

**Storage (Cloudflare R2):**
- `CLOUDFLARE_ACCOUNT_ID` - Cloudflare account ID
- `R2_UPLOAD_IMAGE_ACCESS_KEY_ID` - R2 access key
- `R2_UPLOAD_IMAGE_SECRET_ACCESS_KEY` - R2 secret key
- `R2_UPLOAD_IMAGE_BUCKET_NAME` - R2 bucket name

**Application:**
- `NEXT_PUBLIC_APP_URL` - Application base URL

### Styling with Tailwind CSS v4
This project uses Tailwind CSS v4 with:
- `@tailwindcss/postcss` for PostCSS integration
- shadcn/ui components for pre-built accessible components
- `tailwindcss-animate` for animation utilities
- Theme configuration in `tailwind.config.ts`
- Global styles in `app/globals.css`

### Type Safety
The project uses TypeScript in strict mode (`tsconfig.json`). All database schema types are automatically inferred from Drizzle ORM definitions in `db/schema.ts`.

## Testing and Development

### Local Development Setup
1. Copy `.env` to `.env.local` and fill in all required environment variables
2. Run `npx drizzle-kit push` to sync database schema
3. Start dev server with `npm run dev`
4. Application runs at `http://localhost:3000`

### Database Schema Changes
When modifying `db/schema.ts`:
1. Run `npx drizzle-kit generate` to create migration files
2. Review generated migrations in `db/migrations/`
3. Run `npx drizzle-kit push` to apply changes to database

### Adding New shadcn/ui Components
Use the shadcn CLI to add pre-built components:
```bash
npx shadcn@latest add [component-name]
```
Components are added to `components/ui/` with configuration from `components.json`.

## Product Context

This starter kit is being adapted for **MemoryRevive**, a photo restoration SaaS platform. The product uses AI to restore old, damaged, or faded photographs. Key features being built:
- Photo upload and gallery management
- AI-powered restoration processing
- Two-tier pricing: Starter ($9.99/month) and Pro ($19.99/month)
- Batch processing capabilities
- Before/after comparison views

The existing starter kit provides the foundation for authentication, subscriptions, file storage, and billing—adapt these patterns for the photo restoration workflow.
