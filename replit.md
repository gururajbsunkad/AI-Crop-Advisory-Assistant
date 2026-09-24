# AI Crop Advisory Assistant

A responsive farmer-focused web app that turns crop and field observations into cautious, actionable advisory guidance.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 5000)
- `pnpm --filter @workspace/crop-advisory run dev` — run the web app
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL`, `GEMINI_API_KEY`, and Clerk-managed auth keys

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- API: Express 5
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)
- Auth: Replit-managed Clerk with browser cookie sessions
- AI: server-side `@google/genai`

## Where things live

- `artifacts/crop-advisory` — React/Vite web app, routes, field-notebook visual system
- `artifacts/api-server` — Express routes, Clerk middleware, Gemini service
- `lib/api-spec/openapi.yaml` — REST API source of truth
- `lib/db/src/schema` — Drizzle/PostgreSQL source of truth

## Architecture decisions

- Clerk owns browser authentication; the API uses the Clerk session cookie and does not implement local passwords or bearer-token handling for web.
- Clerk user IDs are stored as text keys so identity remains stable across profile and advisory ownership checks.
- Gemini output is generated as snake_case JSON, validated strictly, then normalized to the app's camelCase response shape before persistence.
- Advisory generation is synchronous from the user's perspective but persisted as `PROCESSING`, `COMPLETED`, or `FAILED` for safe failure handling.

## Product

- Farmers can sign in, maintain a profile, submit crop observations, receive AI guidance, review history, and delete their own advisories.

## User preferences

- Use plain language and prioritize clear next actions for farmers.

## Gotchas

- After editing `lib/api-spec/openapi.yaml`, run API codegen before checking the server or frontend.
- The frontend build requires `PORT` and `BASE_PATH` when run directly; managed workflows provide them automatically.

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
