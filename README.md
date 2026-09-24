# AI Crop Advisory Assistant

AI Crop Advisory Assistant is a responsive farmer-focused web app for turning structured field observations into cautious, actionable crop-management guidance.

## Features

- Clerk-powered sign-in and sign-up
- Farmer profile with location, farm type, size, and language preferences
- Structured advisory intake for crop, soil, irrigation, weather, symptoms, pests, and concerns
- Server-side Gemini generation with strict JSON and Zod validation
- Persistent advisory history with pagination, search, risk filters, and deletion
- Dashboard metrics for analyzed crops, total advisories, and higher-risk cases
- Responsive field-notebook interface for mobile, tablet, and desktop
- Ownership checks on every profile and advisory query
- Helmet security headers, CORS, body-size limits, rate limiting, and structured logs

## Architecture

```text
React + Vite
  -> generated React Query client
  -> Express REST API
  -> Clerk session middleware + Zod validation
  -> PostgreSQL through Drizzle ORM
  -> Gemini server SDK (@google/genai)
  -> strict AI response validation
  -> PostgreSQL persistence
```

The browser never calls Gemini directly. Clerk owns browser sessions, and the API derives the authenticated user from the Clerk session cookie.

## Prerequisites

- Node.js 20+
- pnpm
- A Replit PostgreSQL database (provided automatically in Replit)
- A Gemini API key with access to a supported text model
- Clerk configured through the Replit Auth pane

## Environment

Copy `.env.example` as a reference. In Replit, use Secrets for:

- `GEMINI_API_KEY`
- `CLERK_SECRET_KEY`
- `CLERK_PUBLISHABLE_KEY`
- `VITE_CLERK_PUBLISHABLE_KEY`

The database connection is provided through `DATABASE_URL`. `GEMINI_MODEL` defaults to `gemini-2.5-flash`.

## Database setup

The Drizzle schema lives in `lib/db/src/schema/`. Push the development schema with:

```bash
pnpm --filter @workspace/db run push
```

Tables include `users`, `farmer_profiles`, and `crop_advisories`, with foreign keys and indexes for user, creation time, status, and risk level.

## Development commands

Start the API:

```bash
pnpm --filter @workspace/api-server run dev
```

Start the web app:

```bash
pnpm --filter @workspace/crop-advisory run dev
```

Regenerate API hooks and server Zod schemas after editing the OpenAPI contract:

```bash
pnpm --filter @workspace/api-spec run codegen
```

## Validation

```bash
pnpm run typecheck
pnpm --filter @workspace/api-server run build
PORT=19577 BASE_PATH=/ pnpm --filter @workspace/crop-advisory run build
```

## Security notes

- Gemini requests run only in `artifacts/api-server/src/lib/ai.ts`.
- User-entered notes are treated as untrusted structured data and cannot override the AI safety instruction.
- Gemini responses are parsed and rejected if they do not match the expected advisory shape.
- A failed generation is stored as `FAILED` rather than being presented as a successful advisory.
- All protected queries filter by the authenticated Clerk user ID.
- Passwords are managed by Clerk and are never stored by this app.
- API errors returned to normal users do not include stack traces, SQL errors, file paths, or provider details.

## Troubleshooting

- If the browser shows a signed-out state, confirm Clerk development keys are present and use `/sign-in`.
- If advisory generation fails, verify `GEMINI_API_KEY`, the configured model, and the API server logs.
- If the database is unavailable, verify the Replit database is provisioned and `DATABASE_URL` is present.