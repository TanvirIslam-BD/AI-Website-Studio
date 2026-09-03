# AI Website Studio

An AI-powered website builder: describe a business, get a real multi-page
website, refine it in a visual editor, and deploy it to Vercel.

```
Prompt -> AI generates a structured site -> Visual editor -> AI section edits -> Preview -> Deploy
```

Built for small businesses, freelancers, creators and agencies.

---

## Quick start

Run these one at a time. They work in bash, PowerShell and cmd - note that
Windows PowerShell 5.1 does not support `&&`, so do not chain them.

```
npm install
```

Copy the example environment file, then fill in `DATABASE_URL` and
`AUTH_SECRET` (see [Environment](#environment)):

```
cp .env.example .env
```

```
npm run db:push     # create the schema
npm run db:seed     # optional: a demo account with three websites
npm run dev
```

Open <http://localhost:3000>.

**The app runs with no API keys at all.** With no LLM key configured it uses a
deterministic template generator, and the copilot still handles colours, fonts,
spacing, layout variants and section operations. Add a key to get real AI
generation and copy editing; add a Vercel token to enable deployment.

### Environment

| Variable | Required | Purpose |
| --- | --- | --- |
| `DATABASE_URL` | yes | PostgreSQL connection string |
| `AUTH_SECRET` | yes | Auth.js session signing (see below) |
| `AI_PROVIDER` | no | `anthropic`, `openai` or `mock` (default: whichever key exists) |
| `ANTHROPIC_API_KEY` / `ANTHROPIC_MODEL` | no | Claude generation and copilot |
| `OPENAI_API_KEY` / `OPENAI_MODEL` | no | OpenAI alternative |
| `VERCEL_TOKEN` / `VERCEL_TEAM_ID` | no | One-click deployment |
| `UNSPLASH_ACCESS_KEY` | no | Unsplash image search (falls back to a built-in library) |
| `AUTH_GITHUB_ID` / `AUTH_GITHUB_SECRET` | no | Adds a "Continue with GitHub" button |

#### Generating `AUTH_SECRET`

macOS / Linux / Git Bash:

```
openssl rand -base64 32
```

PowerShell (no OpenSSL needed):

```
$b = New-Object byte[] 32; [Security.Cryptography.RandomNumberGenerator]::Create().GetBytes($b); [Convert]::ToBase64String($b)
```

#### Getting a PostgreSQL database

Any Postgres 14+ works. Pick whichever is easiest:

- **Hosted, nothing to install** - create a free database at
  [Neon](https://neon.tech) or [Supabase](https://supabase.com) and paste the
  connection string into `DATABASE_URL`. Append `?sslmode=require` if the
  provider asks for it.
- **Docker**:

  ```
  docker run --name aiws-pg -e POSTGRES_PASSWORD=postgres -p 5432:5432 -d postgres:16
  ```

- **Local install** - [postgresql.org/download](https://www.postgresql.org/download/),
  then create a database named `ai_website_studio`.

The default `DATABASE_URL` in `.env.example` assumes a local Postgres on port
5432 with user/password `postgres`.

The seed script creates `demo@aiwebsitestudio.test` / `demo1234`.

---

## Architecture

### A website is data, never HTML

The central decision: a generated site is a **structured document**, not a
string of markup.

```
Project
 |- Pages        Home, About, Services, Contact, ...
 |- Sections     typed records: header, hero, features, gallery, ...
 |- Theme        the brand kit (colours, fonts, radius, buttons, density)
 |- Assets       stock / Unsplash / uploads
```

Each section is `{ id, type, props }`, where `props` is validated by a Zod
schema in [`src/lib/website/sections.ts`](src/lib/website/sections.ts). `type`
selects a React component; the data itself never contains logic. Because of
that, generated sites are deterministic, hand-editable, diffable and safe to
render: AI output is parsed, unknown keys are dropped, unsafe URL schemes are
stripped, and no generated code is ever executed.

### One renderer, three consumers

[`src/components/website/`](src/components/website) holds the section
components. They are used, unchanged, by:

1. the **editor canvas** (in an iframe at the target device width),
2. the **preview route** (`/preview/[projectId]/[...slug]`, server-rendered),
3. the **static export** that gets deployed.

That is why the preview genuinely matches the deployed site. Layout comes from
Tailwind utilities; every colour, font, radius and spacing value comes from CSS
custom properties emitted by the theme engine
([`src/lib/website/theme.ts`](src/lib/website/theme.ts)), so a site can be
re-themed without touching a component.

### Every change is an operation

[`src/lib/website/operations.ts`](src/lib/website/operations.ts) is the only way
a document is ever mutated:

```
create_page        update_page       delete_page
add_section        update_section    update_content     delete_section
duplicate_section  reorder_sections  move_section       toggle_section
update_theme       add_asset         set_section_image
```

Each is a pure `(document, input) -> { document, summary }` function with a Zod
input schema. A click in the inspector, a reorder in the section list and a tool
call from the AI all go through the same function and the same validation. The
operations layer runs on **both** the client (instant edits, undo/redo) and the
server (AI edits, persistence).

### The AI is an agent over those operations

The model never writes markup and never rewrites the project. It receives a
compact view of the current document plus the tool catalogue - generated from
the same Zod schemas, so the prompt cannot drift from the validator - and
returns operations:

```json
{
  "message": "Rewrote the hero and warmed up the palette.",
  "operations": [
    { "name": "update_section", "input": { "sectionId": "sec_x", "props": { "heading": "..." } } },
    { "name": "update_theme", "input": { "primaryColor": "#b45309" } }
  ]
}
```

The server validates and applies them, snapshots the previous document to a
`Revision`, and records the tool calls on the chat message, so every AI change
is auditable. If an operation is rejected, the precise error is fed back and the
model gets exactly one corrective round - a bounded loop, not an open one.
Partial success is kept and reported honestly rather than rolled back.

Providers sit behind a thin interface
([`src/lib/ai/types.ts`](src/lib/ai/types.ts)); adding one is a single file plus
a line in the registry. Claude and OpenAI are both implemented, and a
deterministic offline path covers the no-key case.

### Deployment is isolated

[`src/lib/deploy/`](src/lib/deploy) is the only code that talks to a host.

```
document -> generate static files -> POST to Vercel -> poll build -> production URL
```

The export is plain HTML plus one precompiled stylesheet: no framework, no build
step, no server code, and the only JavaScript is a fixed 15-line helper that
turns the contact form into a `mailto:` compose. Swapping in another host means
implementing one interface
([`src/lib/deploy/vercel.ts`](src/lib/deploy/vercel.ts)).

The website stylesheet is compiled once by `npm run build:site-css` (wired into
`npm run build`) from [`styles/website.css`](styles/website.css) into a TS module
that the deploy route bundles. One 13 kB stylesheet serves every site the
product produces, because all per-site variation lives in CSS variables.

### Multi-tenant from the start

Every tenant row hangs off a `Workspace`; users join through `Membership`. All
project reads and writes funnel through
[`src/lib/tenancy.ts`](src/lib/tenancy.ts), which scopes the query to workspaces
the caller belongs to - a project in another workspace reports as missing, so
ids cannot be probed. Team workspaces, seat billing and white-labelling are
additive from here.

---

## Editor layout

```
+------------------------------------------------------------+
| Logo | Project | device | undo/redo | Preview | Deploy      |
+------------+-----------------------------+-----------------+
| Pages      |                             | AI              |
| Sections   |      Website canvas         | Copilot         |
| Assets     |      (iframe, scaled)       |                 |
| Theme      |                             | chat            |
+------------+-----------------------------+-----------------+
```

Selecting a section swaps the left column for a **schema-driven inspector**: the
form is generated from that section's Zod schema, so all 14 section types get a
complete editor - nested objects, repeatable lists, image pickers, enums - with
no per-type UI code, and a new section type becomes editable the moment its
schema exists.

The canvas renders into an iframe on purpose. CSS media queries resolve against
the layout viewport, so a scaled `div` would show the desktop layout inside a
390px "mobile" preview. An iframe sized to the device width makes each
breakpoint real.

Below the `lg` breakpoint the three panes do not fit side by side, so a tab
strip shows one at a time.

---

## Project structure

```
prisma/schema.prisma       data model (workspaces, projects, pages, sections, theme, deployments)
src/lib/website/           the document: schemas, theme engine, operations, persistence
src/lib/ai/                provider abstraction, prompts, tools, generation, copilot, offline paths
src/lib/deploy/            static codegen, Vercel client, orchestration
src/lib/assets/            image providers (Unsplash, built-in library)
src/components/website/    section component library (shared by canvas, preview and export)
src/components/editor/     editor shell, canvas, inspector, panels, copilot, deploy dialog
src/app/                   routes: landing, auth, dashboard, editor, preview, API
```

## Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Development server |
| `npm run build` | Prisma generate, website CSS, Next build |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run db:push` | Sync the schema to the database |
| `npm run db:migrate` | Create a migration |
| `npm run db:seed` | Demo account and three websites |
| `npm run db:studio` | Prisma Studio |

## Deploying the studio itself

It is a standard Next.js app. Set the environment variables above (a hosted
Postgres such as Neon or Supabase works well); `npm run build` handles Prisma
generation and the website stylesheet.

## Known limits

Deliberate MVP boundaries, each with an obvious next step:

- **Contact forms** compose a `mailto:` link rather than posting to a backend.
- **Deployment status** is polled rather than webhook-driven, so there is no
  inbound URL to configure.
- **Assets** are referenced by URL; uploads need a blob store, and the provider
  interface is already in place for it.
- **No billing, custom domains, template gallery, analytics or SEO tooling** yet.
  The workspace/plan model and the deploy interface are the seams for those.
