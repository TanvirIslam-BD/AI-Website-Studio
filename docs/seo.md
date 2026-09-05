# SEO strategy

The goal: make search engines and answer engines resolve **Web Copilot AI Studio**
to a specific entity — *an AI website generator that turns a prompt into a
complete, editable, multi-page website and deploys it* — and compete for the
category queries that describe it.

No ranking is promised here. What is buildable is the foundation, the topical
coverage and the evidence; where a page ends up is decided elsewhere.

---

## 1. Final SEO title

```
AI Website Generator & Builder | Web Copilot AI Studio
```

57 characters. Category first, brand second. The previous title —
`Web Copilot AI Studio - Build Smarter · Launch Faster` — was matchable only by
the brand, which is the one query that needs no help.

## 2. Final meta description

> Build complete websites with AI from a single prompt. Web Copilot AI Studio
> generates multi-page sites, lets you edit them visually or with an AI copilot,
> and deploys them as fast, portable HTML to your own Vercel account.

Leads with the outcome, names the three differentiators (multi-page, editable,
portable), ends on ownership.

## 3. Final homepage H1

```
AI website generator
Build Smarter. Launch Faster.
```

The category line sits *inside* the `h1` as its first span. Pixel-identical to
before — the page still opens on the brand line — but the document's one heading
now says what the product is.

## 4. Homepage copy

Changed: the hero sub-line is now *"Describe your website in one sentence and get
a complete, production-ready site"* — it states the mechanism (prompt in, site
out) rather than gesturing at it.

Unchanged, because it was already right: the supporting paragraph already covered
multi-page generation, visual editing, AI editing and deployment in one sentence
of natural prose. Rewriting good copy to hit keywords would have cost more than
it earned.

Added: four FAQ entries that define the *category* before answering about the
product — "What is an AI website generator?", "Can I create a website from a
prompt?", "Can Web Copilot generate a multi-page website?", "Can I edit an
AI-generated website with AI?".

## 5. URL structure

```
/                            home — category + brand
/ai-website-generator        category page (shipped)
/pricing  /docs  /support    product + trust
/privacy  /terms  /eula      legal
```

Flat, lowercase, hyphenated, no trailing slash, no parameters. Kept out of the
index (`robots.txt` + sitemap omission): `/api/`, `/dashboard`, `/editor/`,
`/preview/`, `/admin`, `/signin`, `/integrations/`, `/showcase`.

`/showcase` matters — it is the example document the home page frames three
times. Indexed, it would read as duplicate content against the examples it
illustrates.

## 6. Keyword → page mapping

| Intent | Query | Page |
| --- | --- | --- |
| Transactional | AI website generator, generate website with AI | `/ai-website-generator` |
| Transactional | AI website builder, AI-powered website builder | `/` |
| Branded | Web Copilot AI, Web Copilot AI Studio | `/` |
| Commercial | AI website builder pricing, free AI website generator | `/pricing` |
| Informational | how does an AI website builder work | `/docs`, FAQ blocks |

One page per intent. The rule that matters: **no two pages target the same
query** — self-competition is the usual failure of programmatic SEO pages.

## 7. Internal linking

Shipped: home → `/ai-website-generator` (footer, Product); the category page →
home examples, `/docs`, `/pricing`, and the "two ways to build" section. Anchors
are descriptive — *"real websites this generator produced"*, not *"learn more"*.

## 8. Structured data

One `@graph` in the root layout, so every page inherits it:

- **Organization** — real legal entity (My Copilot AI LLC), address, support
  email, and `sameAs` pointing at the six real social profiles. `sameAs` is how
  a search engine confirms the site, the accounts and the name are one thing.
- **WebSite** and **SoftwareApplication** — category, feature list, and a Free
  `Offer` only.
- **WebPage + BreadcrumbList** per landing page; **FAQPage** generated from the
  same array the page renders.

Deliberately absent: `aggregateRating`, `review`, and any Offer for Pro or
Agency. Those read "Coming soon" because checkout is not connected — a price in
machine-read markup that nobody can pay is a false claim in the worst place.

## 9. Technical SEO

| Fixed | Was |
| --- | --- |
| `robots.txt` | 404 |
| `sitemap.xml` | 404 |
| Canonical URLs | absent site-wide |
| `metadataBase` | undefined, silently dropping every canonical and OG URL |
| Preview deployments | indexable, competing with production |
| Heading hierarchy | **97 `h2` + 75 `h3`** against 1 `h1` |

The heading number is the one worth dwelling on. The home page embeds real
generated websites — in the hero, the gallery and the width comparison — and
each carried its own `h2`s into the host page's outline. The page's real
structure was buried under ~170 headings about a hair salon, a restaurant and a
gym. Those sections are already `aria-hidden` and `inert`, so the headings
contributed nothing to a reader; they now render as paragraphs. Identical
pixels, and the outline is now **1 / 16 / 24**.

Already healthy, verified not assumed: HTTPS, mobile layout with no horizontal
overflow at 375, every one of 150 images carrying `alt`, WebP product imagery,
`next/font` self-hosting.

## 10. Content strategy

Not yet built. The honest sequencing, highest value first:

**P1 — category pages.** `/ai-website-builder`, `/ai-website-design`,
`/ai-website-editor`, `/website-generator-from-prompt`. Each needs its own
angle, not a find-and-replace of the one that shipped. Four good pages beat
eleven thin ones; thin variants of one page are what Google's helpful content
system was built to demote.

**P2 — explanatory articles.** *What is an AI website generator*, *How AI
website builders work*, *AI website builder vs traditional development*, *How to
deploy an AI-generated website*. Written to teach, linking to product pages only
where genuinely relevant.

**P3 — comparisons.** Only on factual, checkable differences: prompt-based
multi-page generation, structured sections, static HTML output, hosting on your
own account, no lock-in. No superiority claims about competitors' products.

## 11. AI search / GEO

Answer engines quote sentences, not pages. What was added for them:

- `BRAND.definition` — one sentence naming the category first, reused verbatim
  in schema and the category page's opening line.
- FAQ answers written as standalone definitions that survive being lifted out of
  context.
- The category page opens with a definition before any feature.

## 12. Authority

Legitimate mentions only. Realistic order: AI tool directories and SaaS
directories → a launch platform → the Vercel Marketplace listing (already live,
and now linked from the home page) → developer and web-design communities where
the static-HTML-output angle is genuinely interesting → tutorials.

The strongest asset is the product itself: every site it generates is a
demonstration, and sites deployed to users' own domains are real-world evidence.

---

## Priorities

| | Item | State |
| --- | --- | --- |
| **P0** | robots.txt, sitemap.xml, canonicals, `metadataBase` | done |
| **P0** | Title and H1 carrying the category | done |
| **P0** | Heading hierarchy repair | done |
| **P0** | Preview deployments non-indexable | done |
| **P1** | Organization / WebSite / SoftwareApplication / FAQ schema | done |
| **P1** | `/ai-website-generator` | done |
| **P1** | Remaining category pages | to do |
| **P2** | Article hub | to do |
| **P2** | Search Console + sitemap submission | needs account access |
| **P3** | Comparisons, directories, tutorials | to do |

## Maintaining this

`src/lib/seo.ts` holds the origin, the indexable page list and the disallow
list. A new public page needs an entry in `INDEXABLE_PAGES` — the sitemap is
deliberately not generated from the route tree, so adding a page to the app
cannot silently add it to the index.
