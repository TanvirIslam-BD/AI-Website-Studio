# AI Website Studio

An AI-powered website builder: describe a business, get a real multi-page
website, refine it in a visual editor, and deploy it to Vercel.

```
Prompt -> AI generates a structured site -> Visual editor -> AI section edits -> Preview -> Deploy
```

Built for small businesses, freelancers, creators and agencies.

**Stack:** Next.js 15 · React 19 · TypeScript · Tailwind · Prisma on
**Turso** (libSQL) · Auth.js · **CometAPI** (or Claude/OpenAI direct) · Vercel
deployment API.

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
| `TURSO_DATABASE_URL` | yes* | Turso database URL (`libsql://...`) |
| `TURSO_AUTH_TOKEN` | yes* | Turso database token |
| `DATABASE_URL` | yes* | Local SQLite file used when `TURSO_DATABASE_URL` is unset, and by the Prisma CLI |
| `AUTH_SECRET` | yes | Auth.js session signing (see below) |
| `AI_PROVIDER` | no | `comet`, `anthropic`, `openai` or `mock` (default: first key found, CometAPI first) |
| `COMETAPI_API_KEY` / `COMETAPI_MODEL` | no | CometAPI gateway - one key, many upstream models |
| `ANTHROPIC_API_KEY` / `ANTHROPIC_MODEL` | no | Claude direct |
| `OPENAI_API_KEY` / `OPENAI_MODEL` | no | OpenAI direct (`OPENAI_BASE_URL` for other compatible gateways) |
| `ENCRYPTION_KEY` | yes | Encrypts each workspace's hosting credential at rest |
| `VERCEL_INTEGRATION_CLIENT_ID` / `_CLIENT_SECRET` / `_SLUG` | no | "Continue with Vercel" button, so users connect by clicking instead of pasting a token |
| `VERCEL_TOKEN` / `VERCEL_TEAM_ID` | no | Fallback deployment account, used only when a workspace has connected none of its own |
| `UNSPLASH_ACCESS_KEY` | no | Unsplash image search (falls back to a built-in library) |
| `AUTH_GITHUB_ID` / `AUTH_GITHUB_SECRET` | no | Adds a "Continue with GitHub" button |
| `AUTH_GOOGLE_ID` / `AUTH_GOOGLE_SECRET` | no | Adds a "Continue with Google" button |
| `OWNER_EMAILS` | no | Comma-separated emails that may open the owner console at `/admin` |
| `BILLING_PROVIDER` | no | Names the checkout upgrades are sent to; blank keeps plans grant-only from `/admin` |

\* Either the two `TURSO_*` variables (remote) or `DATABASE_URL` (local file).
Both go through the same libSQL driver adapter, so the code path is identical.

#### Sign-in providers

Email and password always work. GitHub and Google each appear on `/signin` only
when **both** of their variables are set, so a fork can ship with one, both or
neither and the page still reads as finished rather than showing a dead button.
Register the callback URLs as:

```
http://localhost:3000/api/auth/callback/github
http://localhost:3000/api/auth/callback/google
```

and the same two paths on your deployed domain.

#### Choosing a model

The default for CometAPI is `claude-haiku-4-5-20251001`. It was picked by
measurement rather than reputation - `npm run try:model` runs candidates through
the real generation prompt and the real section schemas, which is the only thing
that shows what a model is actually worth here.

The number that matters is how many sections survive validation. Anything the
model returns that fails a section schema is **dropped, not raised**, so a weak
model produces a thin site that looks like a success rather than an error.

Measured against the same brief, with the generation route's 120s limit and the
copilot route's 60s limit as hard gates:

| Model | Generation | Sections | Copilot | |
| --- | --- | --- | --- | --- |
| `claude-haiku-4-5-20251001` | 32-47s | 24-29 | 1.9-6.3s | chosen |
| `gemini-3.8-flash` | 43-54s | 27 | 4.5-**118.5s** | exceeds the copilot limit |
| `deepseek-v4-flash` | 28-**116s** | 26-28 | - | grazes the generation limit |
| `gpt-4o` | 22-31s | **20** | 1.5-3.3s, 3/4 | thin, and flaky on edits |
| `gpt-4.1-mini` | 58-61s | **18** | - | slow and thin |
| `glm-5.3-flash` | 54-**551s** | 26-28 | 5-15s | good output, unusable latency |

Two lessons worth keeping if you re-run this:

- **Take several samples.** One candidate measured 54s and 351s on identical
  requests. A single sample would have recommended it.
- **Reasoning models need their effort turned down.** Left unconstrained,
  `glm-5.3-flash` spent all 16,000 output tokens thinking and returned truncated
  JSON after nine minutes. It refuses to disable thinking entirely - it wants
  `low`, `high` or `max` - and `scripts/try-model.ts` passes `low` for it.

#### Generating `AUTH_SECRET`

macOS / Linux / Git Bash:

```
openssl rand -base64 32
```

PowerShell (no OpenSSL needed):

```
$b = New-Object byte[] 32; [Security.Cryptography.RandomNumberGenerator]::Create().GetBytes($b); [Convert]::ToBase64String($b)
```

#### Letting users deploy to their own Vercel account

A site belongs to the person who made it, so it deploys to *their* Vercel
account - that is the only way they can point a domain at it, read its
analytics, or keep it after leaving this product. The deploy dialog is where
they connect one.

Two ways in, and the difference matters to whoever is sitting in front of it:

- **Continue with Vercel** (register an integration once, as the operator).
  The user clicks, approves on vercel.com, and comes back connected. Nobody has
  to know what an access token is.
- **Paste an access token** (always available). The fallback for self-hosted
  installs with no integration registered.

To enable the button, create an integration at
<https://vercel.com/dashboard/integrations/console>:

| Field | Value |
| --- | --- |
| Redirect URL | `https://<your-domain>/api/integrations/vercel/callback` |
| Configuration URL | `https://<your-domain>/integrations/vercel/configure` |
| API Scopes | Deployments read+write, Projects read+write, Domains read+write, User read, Team read |

The Configuration URL is what the **Configure** button on an installed
integration opens. Vercel appends `?configurationId=...`, which is resolved
against the signed-in user's own workspaces - so the screen shows the install
they actually belong to, and a guessed id resolves to nothing. Leave the field
empty and Vercel shows a plain "Website" link instead, with nowhere to change
anything.

There is only one Redirect URL field, and it may point at `localhost`. So
register two integrations - one for production, one for local development
pointing at `http://localhost:3000/api/integrations/vercel/callback` - and give
each environment its own client id, secret and slug.

Then set `VERCEL_INTEGRATION_CLIENT_ID`, `VERCEL_INTEGRATION_CLIENT_SECRET` and
`VERCEL_INTEGRATION_SLUG` (the slug is the last segment of the integration's
own URL).

Use the **Integrations Console**, not Team Settings → Apps. The "Sign in with
Vercel" OAuth apps on that screen issue identity tokens only; their API
permissions are in private beta, so they cannot create a deployment.

Installs also arrive from the other direction - the **Install** button on the
Vercel Marketplace listing, which opens the Redirect URL in a popup. That
journey carries no `state` of ours, because Vercel started it, so the callback
does not connect anything on the spot: it banks the authorization code in a
short-lived httpOnly cookie and asks on `/integrations/vercel/setup` whether to
attach that account to this workspace. The confirmation is what authorises the
link, and it is also where sites are mapped onto projects. Finishing follows
Vercel's `next`, which is what closes the popup.

Either way the credential is encrypted with AES-256-GCM under `ENCRYPTION_KEY`
before it is stored, and is never returned to the browser - the UI gets a
four-character hint and the account name, nothing more. Generate the key the
same way as `AUTH_SECRET` above.

#### Setting up Turso

Install the [Turso CLI](https://docs.turso.tech/cli/installation), then:

```
turso db create ai-website-studio
```

```
turso db show ai-website-studio --url
```

```
turso db tokens create ai-website-studio
```

Put those two values in `.env` as `TURSO_DATABASE_URL` and `TURSO_AUTH_TOKEN`,
then create the tables:

```
npm run db:push
```

`prisma.config.ts` hands the Prisma CLI the same libSQL adapter the app uses,
so `db:push`, `migrate` and `studio` all act on whichever database is
configured - remote Turso when `TURSO_DATABASE_URL` is set, the local file
otherwise.

This relies on Prisma's JavaScript schema engine, which Prisma still labels
unstable. If a schema command misbehaves against Turso, emit the SQL and apply
it yourself. Note the shell differences - PowerShell needs `--silent` (so npm's
own banner does not end up inside the file), an explicit UTF-8 encoding, and a
pipe instead of `<`:

bash / zsh:

```
npm run --silent db:sql > schema.sql && turso db shell your-db-name < schema.sql
```

PowerShell:

```
npm run --silent db:sql | Out-File -Encoding utf8 schema.sql
```

```
Get-Content schema.sql | turso db shell your-db-name
```

A connection problem surfaces as a terse `Error describing the database` -
check the URL and token before looking anywhere else.

**Working offline:** leave `TURSO_DATABASE_URL` blank and everything runs
against the local SQLite file in `DATABASE_URL` (`prisma/dev.db` by default).

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
a line in the registry. Three are implemented: **CometAPI** (an
OpenAI-compatible gateway, so one key fronts Claude, GPT, Gemini and others),
Anthropic direct, and OpenAI direct. Because CometAPI shares OpenAI's wire
format it needs no transport code of its own - just a different base URL, which
is also how any other compatible gateway would be added. A deterministic
offline path covers the no-key case.

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

### Plans decide what a workspace may do, not what it may see

Limits live in one table,
[`src/lib/billing/plans.ts`](src/lib/billing/plans.ts):

| | Free | Pro | Agency |
| --- | --- | --- | --- |
| Websites | 1 | 25 | 250 |
| Credits / month | 1 | 300 | 2000 |
| AI edits and copilot | no | yes | yes |
| Publish to Vercel | no | yes | yes |

A free account generates one complete website and can look at all of it. What
it cannot do is generate a second, change the first, or publish - so the limit
is felt at the moment someone has decided they want the thing, which is the
only moment an upgrade prompt is useful rather than an obstacle.

Enforcement is one call,
[`requireAllowance`](src/lib/billing/entitlements.ts), made **before** any work
starts, in every route that generates, edits or deploys. It throws a
`PlanLimitError`, which the shared error mapper turns into **402 Payment
Required** carrying `reason` and `requiredPlan`, so the client can say what is
missing and where to go rather than showing a generic failure.

Usage is a **ledger**, not a counter: each chargeable action appends a
`UsageEvent`, and the balance is summed from the workspace's period start. A
counter can drift and cannot be audited; rows can be read back, and a period
reset is a date change rather than a mass update. Recording happens after the
work succeeds and deliberately swallows its own write failures - losing a
record is bad, failing a request the user has already paid for is worse.

### The owner console

`/admin` reports platform totals, plan mix, per-workspace usage and recent
activity, and carries the levers that matter when something is going wrong:

- **Generation mode** - `auto`, force **AI**, or force **templates**. Forcing
  templates makes the app skip the provider entirely (verified: a generation
  that took ~35s through the model returns in 0.2s with `source: "template"`),
  which is the switch to reach for when a provider is down, slow, or expensive.
- **Pause generation** and **pause signups**, platform-wide.
- **Grant a plan** to any workspace, optionally resetting its period.

Access is by `OWNER_EMAILS`, an environment variable, not a database column: no
request the app serves can write to it, so no bug in a signup or profile path
can escalate anyone into it. Non-owners get **404** rather than 403 - on the
page and on each API independently - so the console does not confirm its own
existence to someone probing for it.

---

## The marketing site

The public page at `/` is not a separate copy deck. Several of its sections
render straight from the product's own registries:

- the section library reads `SECTION_META`, so adding a section type adds a card
- the copilot section lists `OPERATION_NAMES`, so it cannot advertise a tool
  that does not exist
- the brand-kit gallery renders `THEME_PRESETS` with their real palettes and
  typefaces
- the examples gallery and the hero showcase call the actual generator, and the
  hero renders a real generated site through the same section components that
  build the deployed version

That means the marketing claims cannot drift from the product. There is also no
fabricated social proof: the numbers shown are product facts (section types,
operations, bytes shipped) rather than invented customer counts or testimonials.

Pricing mirrors the `WorkspacePlan` enum. Billing is not implemented, so paid
tiers are labelled "Coming soon" rather than implying a checkout - and the
prices themselves are placeholders to set before launch.

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
prisma.config.ts           gives the Prisma CLI the same libSQL adapter the app uses
src/lib/website/           the document: schemas, theme engine, operations, persistence
src/lib/ai/                provider abstraction, prompts, tools, generation, copilot, offline paths
src/lib/deploy/            static codegen, Vercel client, orchestration
src/lib/assets/            image providers (Unsplash, built-in library)
src/components/website/    section component library (shared by canvas, preview and export)
src/components/editor/     editor shell, canvas, inspector, panels, copilot, deploy dialog
src/components/marketing/  the public marketing site (renders from the registries above)
src/lib/brand.ts           product name and public copy, in one place
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
| `npm run db:sql` | Emit the schema as plain SQL (to apply with the Turso CLI) |
| `npm run try:model` | Compare models against the real generation path |
| `npm run db:seed` | Demo account and three websites |
| `npm run db:studio` | Prisma Studio |

## Deploying the studio itself

It is a standard Next.js app. Set the environment variables above - the same
`TURSO_*` values work from anywhere, since Turso is accessed over HTTP - and
`npm run build` handles Prisma generation and the website stylesheet.

`TURSO_DATABASE_URL` and `TURSO_AUTH_TOKEN` are required in production. Without
them the app refuses to run a query and says so, rather than silently opening an
empty SQLite file on an ephemeral filesystem and failing later with
`no such table: main.User`.

To set them with the Vercel CLI, link the project first - `vercel env add` fails
with "Your codebase isn't linked to a project" otherwise:

```
vercel link
```

```
vercel env add TURSO_DATABASE_URL production
```

```
vercel env add TURSO_AUTH_TOKEN production
```

Then redeploy, since environment variables are read at build and boot time. The
Vercel dashboard (Project → Settings → Environment Variables) does the same job
without the CLI.

### Checking a deployment

`GET /api/health` reports whether the app can actually run, and is the first
thing to read when something is wrong in production. It returns 200 when ready
and 503 when not, with a `hint` naming the next step.

The database check is the part worth understanding. It queries every table with
a statement that names every column the schema expects, so it catches three
different failures and tells them apart:

| `database` | Means |
| --- | --- |
| `ok` | Reachable, and every table has the columns the app expects |
| `unreachable` | No connection - usually missing `TURSO_*` variables |
| `schema-missing` | Connected, but the tables do not exist. Run `npm run db:push` |
| `schema-stale` | Tables exist but are short of columns, so a schema change shipped without a migration. `databaseTables` names them |

`schema-stale` is the one that catches a real deployment mistake. A schema change
deployed without migrating leaves reads that use an explicit `select` working
while anything loading a whole row fails, so the app looks half-alive: listing
projects succeeds, creating one returns "Something went wrong on our end". Only a
check that names every column sees it.

Note the trap when fixing it: `npm run db:push` falls back to the local SQLite
file when `TURSO_DATABASE_URL` is unset, and cheerfully reports "already in sync"
having never touched production. Confirm the output names your `libsql://` URL.

Two deployment notes:

- `next.config.mjs` lists the libSQL packages in `serverExternalPackages`. They
  load a native module and resolve some dependencies dynamically, which webpack
  cannot bundle, so they must stay external.
- The adapter's Node build is used, which runs fine on Vercel's Node runtime.
  For an edge or worker runtime, switch the import in
  [`src/lib/db.ts`](src/lib/db.ts) to `@prisma/adapter-libsql/web`: HTTP-only,
  no native module, but no local `file:` support either.

## Known limits

Deliberate MVP boundaries, each with an obvious next step:

- **Contact forms** compose a `mailto:` link rather than posting to a backend.
- **Deployment status** is polled rather than webhook-driven, so there is no
  inbound URL to configure.
- **Assets** are referenced by URL; uploads need a blob store, and the provider
  interface is already in place for it.
- **No billing, custom domains, template gallery, analytics or SEO tooling** yet.
  The workspace/plan model and the deploy interface are the seams for those.
