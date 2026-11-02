# VisualDSA

Analogy-first learning for DSA, system design, and interview prep. Visuals second, code last.

Accounts, sessions and progress saving are included: email auth, optional OAuth, guest→user merge, autosave, dashboard resume, XP and streaks (server-side).

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
- Seed includes sample in-progress lesson, XP, streak and a due review.

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
| `pnpm db:seed`       | Seed demo user + sample progress           |

## Notable routes

- `/learn` — roadmap with progress rings (public)
- `/learn/stack-basics` — reference chapter
- `/visualizers/stack` — stack playground
- `/login`, `/signup`, `/forgot-password`, `/reset-password`, `/verify-email`
- `/dashboard`, `/account` (auth required)
- `/signin` and `/profile` redirect to `/login` and `/account`

## Email

No paid API key required. Verification and password-reset links use a swappable `Mailer`:

- Default: `ConsoleMailer` (prints the full link in the server console)
- Optional: set `RESEND_API_KEY` (+ `MAIL_FROM`) to send via Resend

## Security checklist

- **Password hashing:** async Node `scrypt` (`scrypt$N$r$p$salt$hash`); never plaintext
- **Sessions:** Auth.js JWT in **httpOnly**, `Secure` (prod), `SameSite` cookies; CSRF via Auth.js; sliding refresh (`updateAge`); `sessionVersion` bump for sign-out-everywhere / password change
- **OAuth:** GitHub/Google only when both env vars are set; app runs fully without them
- **Rate limits:** login, signup, forgot/reset, verify (fixed window per IP)
- **Email enumeration:** signup / forgot-password return the same generic message whether or not the email exists
- **Authorization:** `/dashboard` and `/account` gated in middleware; lessons stay public for SEO
- **Data deletion:** account delete cascades user-owned rows (progress, tokens, submissions, …)
- **Secrets:** `AUTH_SECRET`, DB URL, OAuth and Resend keys are server-only (validated in `src/env.ts`); never exposed to the client bundle
- **XP / streaks:** calculated only on the server; clients cannot submit XP amounts

## AI mock interview

Coming soon. `FEATURE_AI_MOCK` defaults to `false`. No AI API key is required.

## Testing and CI

```bash
pnpm lint && pnpm typecheck && pnpm test && pnpm content:check
pnpm build && CI=1 pnpm test:e2e
```

GitHub Actions runs format, lint, typecheck, content check, unit tests, migrate, build, and Playwright against Postgres.
