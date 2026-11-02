# VisualDSA

Analogy-first learning for DSA, system design, and interview prep. Visuals second, code last.

Foundation so far: auth, Postgres progress, MDX lesson engine, and a keyboard-friendly **stack visualizer** used as the reference for every later visualizer.

## Stack

- Next.js 15 (App Router) + React 19 + TypeScript strict
- Tailwind CSS v4 + shadcn/ui (Radix) + Framer Motion
- PostgreSQL + Prisma 6
- NextAuth v5 (credentials; GitHub/Google when env vars are set)
- Zod validation (env, forms, content)
- Vitest + Playwright (+ axe)

## Setup

Requirements: Node 20.18+, pnpm 10, PostgreSQL 16.

```bash
cp .env.example .env
# Edit DATABASE_URL and AUTH_SECRET (openssl rand -base64 32)

pnpm install
pnpm db:migrate
pnpm db:seed
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

### Demo account

- Email: `demo@visualdsa.dev`
- Password: `learn-dsa-123`

## Scripts

| Script               | Purpose                                    |
| -------------------- | ------------------------------------------ |
| `pnpm dev`           | Next.js dev server                         |
| `pnpm build`         | Production build                           |
| `pnpm start`         | Serve the production build                 |
| `pnpm lint`          | ESLint (zero warnings)                     |
| `pnpm typecheck`     | `tsc --noEmit`                             |
| `pnpm format`        | Prettier write                             |
| `pnpm format:check`  | Prettier check                             |
| `pnpm test`          | Vitest unit/component tests                |
| `pnpm test:e2e`      | Playwright (use `CI=1` after `pnpm build`) |
| `pnpm content:check` | Validate MDX / problem / quiz content      |
| `pnpm db:migrate`    | Create/apply Prisma migrations (dev)       |
| `pnpm db:deploy`     | Apply migrations (CI/prod)                 |
| `pnpm db:seed`       | Seed demo user                             |

## Layout

```
content/          MDX lessons, problem JSON, quiz JSON
docs/CURRICULUM.md
PLAN.md           Architecture + phased checklist
prisma/           Schema, migrations, seed
src/app/          Routes (learn, visualizers, auth, profile)
src/components/   UI, lesson templates, visualizer player
src/lib/          Auth, content loaders, visualizer engines, progress
tests/e2e/        Playwright specs
```

## Notable routes

- `/learn` — curriculum index
- `/learn/stack-basics` — reference chapter with embedded stack visualizer
- `/visualizers/stack` — playground (custom ops + presets)
- `/signin`, `/signup`, `/profile`

## AI mock interview

Coming soon. `FEATURE_AI_MOCK` defaults to `false`. No AI API key is required for this foundation.

## Testing and CI

```bash
pnpm lint && pnpm typecheck && pnpm test && pnpm content:check
pnpm build && CI=1 pnpm test:e2e
```

GitHub Actions (`.github/workflows/ci.yml`) runs format, lint, typecheck, content check, unit tests, migrate, build, and Playwright against a Postgres service.
