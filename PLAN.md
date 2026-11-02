# VisualDSA: Build Plan

VisualDSA teaches DSA, system design and competitive programming the way you would teach a child:
**analogy first, visuals second, code last**. It also prepares learners for tech interviews.

Source of truth for content: [`docs/CURRICULUM.md`](docs/CURRICULUM.md).

---

## 1. Architecture

```
Browser ──► Next.js 15 App Router (React 19, RSC)
             │
             ├─ Server Components: pages, lesson MDX rendering, data reads
             ├─ Client Components: visualizers, quizzes, editor, canvas, theme
             ├─ Server Actions: sign-up, profile updates, progress writes, waitlist
             ├─ Route Handlers: /api/auth/[...nextauth], /api/health
             └─ Middleware: protects /dashboard, /profile (session check, edge-safe config)
                    │
                    ▼
             Prisma ORM ──► PostgreSQL
                    │
             /content (MDX lessons, problem JSON, quiz JSON) read from disk at build/request time
```

### Key decisions

| Concern           | Choice                                                                               | Why                                                                                            |
| ----------------- | ------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------- |
| Framework         | Next.js 15 App Router, TypeScript `strict`                                           | RSC for fast lesson pages, server actions for writes                                           |
| Styling           | Tailwind CSS v4 + shadcn/ui (Radix primitives)                                       | Accessible primitives, design tokens as CSS variables                                          |
| Motion            | Framer Motion (`motion`) with `prefers-reduced-motion` respected                     | Smooth visualizers without breaking a11y                                                       |
| State             | Zustand for persisted user preferences; pure reducers for visualizer playback        | Playback logic stays pure and unit-testable                                                    |
| Content           | MDX in `/content`, compiled with `next-mdx-remote/rsc`, frontmatter validated by Zod | Authors write Markdown; components are reusable                                                |
| Code highlighting | Shiki (server side, dual light/dark theme)                                           | Zero client JS for static code                                                                 |
| Auth              | NextAuth v5 (Auth.js) + Prisma adapter, JWT sessions                                 | Credentials work with no external keys; GitHub/Google enable automatically when env vars exist |
| DB                | PostgreSQL + Prisma 6                                                                | Relational progress data, migrations, typed client                                             |
| Validation        | Zod everywhere: env, frontmatter, problem/quiz JSON, forms, server actions           | One validation library across the stack                                                        |
| Editor (later)    | Monaco, code runs in a Web Worker (JS) / Pyodide (Python)                            | No server-side code execution needed                                                           |
| Canvas (later)    | React Flow                                                                           | System design studio                                                                           |
| AI (later)        | `AIProvider` interface + `DisabledProvider`, gated by `FEATURE_AI_MOCK=false`        | Ships with no API key; Claude can be swapped in via one file                                   |
| Tests             | Vitest + Testing Library (unit/component), Playwright + axe (e2e, a11y)              | Fast unit loop, real-browser checks                                                            |
| CI                | GitHub Actions with a Postgres service                                               | Lint, typecheck, unit, migrate, build, e2e on every PR                                         |

### Visualizer architecture

Every visualizer is split in two:

1. **Engine** (`src/lib/visualizers/<type>/engine.ts`): a pure function `buildFrames(initial, ops) => Frame[]`.
   Each frame is an immutable snapshot: data state, highlighted pseudocode line, a plain-English caption,
   and the element(s) to highlight. Fully unit tested.
2. **Player** (`src/components/visualizers/player/*`): generic, type-agnostic playback over frames.
   Play, pause, step forward, step back, reset, speed control, scrubber, keyboard shortcuts,
   `aria-live` narration, and a highlighted pseudocode panel. Each visualizer only supplies a
   `renderFrame(frame)` view.

Adding a new visualizer = one engine + one view + registration in `src/components/visualizers/registry.tsx`.

### Lesson engine

- `content/<track>/<module>/<chapter>.mdx` files, frontmatter validated by `lessonFrontmatterSchema`.
- `src/lib/content/lessons.ts` discovers, parses and caches lessons; builds the track/module tree.
- `src/components/lesson/*` implements the template components:
  `Analogy`, `Visualizer`, `Trace`, `CodeTabs`, `Complexity`, `Checkpoint`, `Quiz`, `Problems`, `Recap`, `InterviewTip`.
- `Quiz` loads `content/quizzes/<id>.json`; `Problems` loads `content/problems/<id>.json` (both Zod validated).
- Lesson route: `/learn/[slug]`. Index: `/learn`.

---

## 2. Database schema (Prisma)

```
User            id, name, email (unique), emailVerified, image, passwordHash?, username? (unique),
                bio?, role (LEARNER|ADMIN), dailyGoalXp (default 30), timezone, createdAt, updatedAt
Account         NextAuth OAuth accounts (provider, providerAccountId unique)
Session         NextAuth sessions (kept for adapter compatibility)
VerificationToken NextAuth email tokens

LessonProgress  userId + lessonSlug (unique), status (STARTED|COMPLETED), startedAt, completedAt
XpEvent         userId, amount, reason (LESSON|PROBLEM|QUIZ|STREAK_BONUS|REVIEW), refId,
                unique(userId, reason, refId) for idempotent awards
DailyActivity   userId + date (unique), xp, lessonsCompleted, problemsSolved  -> daily goals and streaks
Streak          userId (unique), current, longest, lastActiveDate
ReviewItem      userId + itemType + itemId (unique), stage (0..4 -> 1/3/7/21 days), dueAt, lastReviewedAt
QuizAttempt     userId, quizId, score, total, answers (Json), createdAt
ProblemSubmission userId, problemId, language, code, passed, passedCount, totalCount, createdAt
UserBadge       userId + badgeId (unique), awardedAt
DesignBoard     userId, caseStudyId, title, graph (Json: React Flow nodes/edges), checklist (Json), updatedAt
WaitlistEntry   email (unique), feature (default "ai-mock-interview"), createdAt
```

Indexes: `XpEvent(userId, createdAt)`, `ReviewItem(userId, dueAt)`, `ProblemSubmission(userId, problemId)`.

---

## 3. Folder structure

```
.
├── .github/workflows/ci.yml
├── content/
│   ├── <track>/<module>/<chapter>.mdx
│   ├── problems/<id>.json
│   └── quizzes/<id>.json
├── docs/CURRICULUM.md
├── prisma/
│   ├── schema.prisma
│   ├── migrations/
│   └── seed.ts
├── src/
│   ├── app/
│   │   ├── (auth)/signin, (auth)/signup
│   │   ├── learn/            index + [slug]
│   │   ├── visualizers/      playgrounds (stack first)
│   │   ├── profile/
│   │   ├── api/auth/[...nextauth], api/health
│   │   ├── error.tsx, global-error.tsx, not-found.tsx, loading.tsx
│   │   ├── sitemap.ts, robots.ts, manifest.ts
│   │   └── layout.tsx, page.tsx, globals.css
│   ├── components/
│   │   ├── ui/               shadcn/ui primitives
│   │   ├── layout/           header, footer, nav, theme toggle, user menu
│   │   ├── lesson/           template components
│   │   └── visualizers/      player + per-type views + registry
│   ├── lib/
│   │   ├── auth/             password hashing, sign-up action, schemas
│   │   ├── content/          schemas, loaders, MDX compiler
│   │   ├── visualizers/      pure engines
│   │   ├── progress/         XP + lesson completion actions
│   │   ├── db.ts, utils.ts, site.ts
│   ├── stores/               Zustand stores
│   ├── auth.ts, auth.config.ts, middleware.ts, env.ts
├── tests/e2e/                Playwright specs
├── PLAN.md, README.md
```

---

## 4. Phased checklist

Process per phase: implement, run `pnpm lint`, `pnpm typecheck`, `pnpm test` (and e2e where relevant), fix, tick, commit.

### Phase 0: Plan

- [x] Add curriculum to `docs/CURRICULUM.md`
- [x] Write `PLAN.md` (architecture, schema, folders, checklist)

### Phase 1: Project setup

- [x] Next.js 15 + React 19 + TypeScript strict (`noUncheckedIndexedAccess`)
- [x] Tailwind v4, ESLint (next + typescript), Prettier
- [x] Env validation with Zod (`src/env.ts`), `.env.example`
- [x] Vitest + Testing Library + jsdom
- [x] Playwright + axe-core
- [x] GitHub Actions CI (lint, typecheck, unit, migrate, build, e2e)

### Phase 2: Design system

- [x] shadcn/ui primitives (button, card, badge, input, label, textarea, skeleton, separator, progress, slider, tabs, dropdown menu, sheet)
- [x] Theme tokens (light/dark), `next-themes` toggle, focus rings, skip link
- [x] App shell: responsive header with mobile menu, footer
- [x] Error boundaries (`error.tsx`, `global-error.tsx`), `not-found.tsx`, loading skeletons
- [x] SEO: metadata template, Open Graph, `sitemap.ts`, `robots.ts`, `manifest.ts`
- [x] Landing page

### Phase 3: Database

- [x] Prisma schema (all models above) + initial migration
- [x] Prisma client singleton, seed script (demo user)
- [x] `/api/health` checks DB connectivity

### Phase 4: Auth and profiles

- [x] NextAuth v5 with Prisma adapter, JWT sessions, edge-safe `auth.config.ts`
- [x] Credentials sign-up/sign-in (async Node scrypt, Zod), GitHub/Google auto-enabled when env vars exist
- [x] Middleware protecting `/profile` and `/dashboard`
- [x] Header user menu, sign out
- [x] Profile page: edit name, username, bio, daily goal (server action + Zod)

### Phase 5: Lesson engine

- [x] Zod schemas: lesson frontmatter, problem JSON, quiz JSON
- [x] Content loader (discover, parse, validate, cache, tree by track/module)
- [x] MDX compiler with component map
- [x] Components: Analogy, Visualizer, Trace, CodeTabs, Complexity, Checkpoint, Quiz, Problems, Recap, InterviewTip
- [x] `/learn` index and `/learn/[slug]` lesson page with table of contents, prerequisites, prev/next
- [x] Reference chapter 5.1 Stack (status: ready) + quiz + 3 problems; draft stubs for 2.1 and 5.2
- [x] `pnpm content:check` validates frontmatter, folder layout, prerequisites, problem/quiz JSON and references
- [x] "Mark complete" server action awarding XP idempotently (signed-in users)

### Phase 6: Stack visualizer (reference visualizer)

- [x] Pure engine `buildStackFrames` with unit tests (push, pop, peek, empty-pop error frame)
- [x] Generic player: play, pause, step, back, reset, speed, scrubber
- [x] Keyboard: Space play/pause, ←/→ step, Home reset, End jump to last, +/- speed
- [x] Highlighted pseudocode line, `aria-live` captions, reduced-motion support
- [x] Stack view with Framer Motion; `/visualizers/stack` playground with custom ops input
- [x] Used inside the Stack lesson via `<Visualizer type='stack' />`

**Foundation stops here.**

### Phase 7: Content scaffolding and roadmap

- [ ] Generate `.mdx` stubs (status: draft) for every chapter in `docs/CURRICULUM.md`
- [ ] Fully write 7.1 Binary Search and 10.2 BFS
- [ ] Roadmap page: tracks, modules, prerequisites, lock/unlock, progress rings, Coming soon labels

### Phase 8: Remaining visualizers

- [ ] Queue, linked list, hash map, binary search, trees (traversals, BST), graphs (BFS/DFS), sorting (bubble, selection, insertion, merge, quick)

### Phase 9: Pattern practice

- [ ] 15 pattern pages with clue cards and template code
- [ ] Problem page with Monaco editor, test runner in a Web Worker (JS) and Pyodide (Python)
- [ ] Progressive hints, solution reveal, submissions saved

### Phase 10: System design studio

- [ ] Restaurant-analogy lessons (Track 3 Part A)
- [ ] React Flow canvas with component palette, saved boards
- [ ] Static checklists, self-review rubrics and model answers per case study

### Phase 11: AI Mock Interview (Coming Soon)

- [ ] `/mock-interview` page: Coming soon badge, sample chat, sample scorecard
- [ ] Waitlist form (server action + Zod) saved to `WaitlistEntry`
- [ ] `src/lib/ai/provider.ts`: `AIProvider` (askFollowUp, scoreAnswer, reviewDesign) + `DisabledProvider`, gated by `FEATURE_AI_MOCK`

### Phase 12: Progress and gamification

- [ ] XP rules (chapter 40, problems 20/40/80, quiz 15, streak bonus 10)
- [ ] Streaks, daily goals, badges
- [ ] Spaced repetition (1, 3, 7, 21 days) review queue
- [ ] Dashboard

### Phase 13: Quality hardening

- [ ] Lighthouse 90+ on key pages (CI budget), bundle analysis
- [ ] Full WCAG AA audit, screen reader pass on every visualizer
- [ ] Rate limiting on auth and waitlist actions

---

## 5. Accounts, sessions and progress (post-foundation)

Process: schema → auth → progress API → resume UI / guest merge → dashboard → tests. No paid API keys; mailer is `ConsoleMailer` in dev.

### Phase A: Schema and seed

- [x] Expand `LessonProgress` (IN_PROGRESS|COMPLETED, lastSection, scrollPosition, visualizerState, updatedAt)
- [x] `ProblemAttempt` + `CodeDraft`; keep submissions history; `QuizResult` (rename/alias of attempts)
- [x] `AuthToken` (email verify + password reset); `User.sessionVersion` for logout-everywhere
- [x] Seed demo user with sample lesson progress, XP, streak and a due review

### Phase B: Auth completeness

- [x] `/login` (alias of sign-in), `/signup`, `/forgot-password`, `/reset-password`, `/verify-email`, `/account`
- [x] Stronger password rules; scrypt hashing (async); optional Google/GitHub when env set
- [x] JWT httpOnly cookies, `updateAge` refresh, CSRF via Auth.js; logout everywhere bumps `sessionVersion`
- [x] Swappable `Mailer` (`ConsoleMailer` now; Resend when `RESEND_API_KEY` set)
- [x] Rate limit login/signup/reset; never reveal whether an email exists
- [x] Account: edit profile, change password, delete account + cascade data
- [x] Middleware: `/dashboard`, `/account`, `/profile` require login; `/learn` public

### Phase C: Progress API

- [x] Server-side XP, streak (user timezone) and spaced-repetition helpers with unit tests
- [x] Debounced auto-save (section, scroll, quiz answers, code drafts) via Zod server actions
- [x] Offline queue + retry; optimistic UI
- [x] Guest→user merge preferring newer `updatedAt` (unit tested)

### Phase D: Resume UI and dashboard

- [x] Continue-learning card in header + dashboard (deep-link to section)
- [x] Roadmap with completed / in-progress / locked + progress rings
- [x] Guest localStorage progress + “Sign up to save” banner
- [x] Dashboard: continue, daily goal, streak calendar, XP, weakest patterns, due reviews

### Phase E: Quality

- [x] Playwright: signup, login, save progress, logout, fresh browser resume
- [x] README security checklist (hashing, rate limits, cookies, deletion, no client secrets)
