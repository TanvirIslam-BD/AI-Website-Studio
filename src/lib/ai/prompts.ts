import { BRAND } from '@/lib/brand';
import { FONT_NAMES, THEME_PRESETS } from '@/lib/website/theme';
import { TOPIC_KEYS } from '@/lib/website/stock';
import { sectionCatalogText, sectionPropsText, toolCatalogText, type ToolSpec } from './tools';
import type { WebsiteDocument } from '@/lib/website/document';

/**
 * Prompt construction.
 *
 * Two jobs, two prompts:
 *  - GENERATION: brief -> a complete structured website document.
 *  - COPILOT: an instruction plus the current document -> a list of operations.
 *
 * Neither prompt ever asks for HTML, CSS or code. The model only ever emits
 * data that the operations layer validates, which is what keeps generated
 * sites deterministic and safe to render.
 */

const SHARED_RULES = `
Hard rules:
- Output JSON only. No prose outside the JSON, no markdown fences.
- Never output HTML, CSS, JavaScript, or any code. Only structured content.
- Only use section types and prop names from the reference below. Unknown keys are discarded.
- Copy must be specific to the business. Never write lorem ipsum or "Your text here".
- Headlines: 3-9 words, concrete and benefit-led. Body copy: 1-2 sentences.
- Every href is either an internal path ("/", "/about"), an in-page anchor ("#work"), or mailto:/tel:.
- Image URLs must be absolute https URLs. Use the provided stock URLs; never invent image URLs.
`.trim();

export function websiteGenerationPrompt(): string {
  return `You are the website architect inside ${BRAND.name}. You turn a short business brief into a complete, well-structured marketing website.

${SHARED_RULES}

Return exactly this shape:
{
  "brand": "Business name (invent a good one if the brief has none)",
  "topic": "one of: ${TOPIC_KEYS.join(', ')}",
  "description": "One sentence describing the business",
  "theme": { "primaryColor": "#hex", "secondaryColor": "#hex", "background": "#hex", "surface": "#hex", "textColor": "#hex", "mutedColor": "#hex", "borderColor": "#hex", "headingFont": "font", "bodyFont": "font", "radius": "none|sm|md|lg|full", "buttonStyle": "solid|outline|soft|pill", "density": "compact|comfortable|spacious", "mode": "light|dark" },
  "pages": [
    { "name": "Home", "slug": "", "seoTitle": "...", "seoDesc": "...", "sections": [ { "type": "header", ... }, ... ] }
  ]
}

Fonts available: ${FONT_NAMES.join(', ')}.
Reference brand kits for inspiration: ${THEME_PRESETS.map((p) => `${p.name} (${p.patch.primaryColor})`).join(', ')}.

Design direction:
- Pick a palette that fits the industry, not a generic blue. Ensure text on background has strong contrast.
- Choose a heading font with real personality (serif for editorial/luxury, geometric sans for tech, rounded sans for friendly consumer brands).
- Home page structure: header, hero, then 4-6 body sections chosen for this specific business, then a cta, then footer.
- Also generate an "About", "Services" and "Contact" page, each with header, 2-4 body sections, and footer.
- Header links and footer links must match the pages you actually create.

Section types:
${sectionCatalogText()}

Section props (only these keys are read):
${sectionPropsText()}`;
}

export function generationUserMessage(brief: string, stockUrls: string[]): string {
  return `Business brief:
"""
${brief}
"""

Use these image URLs for every image in the site (reuse them as needed, pick the ones that suit each slot):
${stockUrls.map((url, i) => `${i + 1}. ${url}`).join('\n')}

Generate the complete website now.`;
}

// --- copilot ---------------------------------------------------------------

export function copilotSystemPrompt(tools: ToolSpec[]): string {
  return `You are the AI copilot inside ${BRAND.name}. You edit a website by calling operations on its structured document. You never rewrite the whole site.

${SHARED_RULES}

Return exactly this shape:
{
  "message": "One or two sentences to the user, in plain language, describing what you changed.",
  "operations": [ { "name": "operation_name", "input": { ... } } ]
}

Operating rules:
- Prefer the smallest set of operations that fully satisfies the request. Usually 1-4.
- When the user has a section selected, edit THAT section unless they clearly mean the whole site.
- update_section is a partial patch: pass only the props you are changing. Never re-send unchanged props.
- Rewriting copy is update_section (or update_content for a single field), not delete + add.
- "Make it more premium/modern/bold" usually means: tighter copy, a variant change, more whitespace (paddingY/density), and a theme refinement - not new sections.
- Colour, font, radius and light/dark requests are update_theme, never per-section styling.
- To reference a page use its slug ("" or "home" for the home page). To reference a section use its exact id from the document.
- If a request is ambiguous or you need information you do not have, return an empty operations array and ask for the missing detail in "message".
- If a request cannot be satisfied by these operations, say so in "message" rather than inventing an operation.

Available operations:
${toolCatalogText(tools)}

Section types:
${sectionCatalogText()}

Section props (only these keys are read):
${sectionPropsText()}`;
}

/**
 * The document view given to the copilot.
 *
 * Sends ids, types, variants and the text content the model needs to reason
 * about, but trims long bodies and image URLs - they inflate the context
 * without helping it decide which operation to call.
 */
export function documentContext(document: WebsiteDocument, selectedSectionId?: string, activePageId?: string): string {
  const theme = document.theme;
  const lines: string[] = [
    'Current website:',
    `theme: primary=${theme.primaryColor} secondary=${theme.secondaryColor} bg=${theme.background} text=${theme.textColor} heading="${theme.headingFont}" body="${theme.bodyFont}" radius=${theme.radius} buttons=${theme.buttonStyle} density=${theme.density} mode=${theme.mode}`,
    '',
  ];

  for (const page of document.pages) {
    const marker = page.id === activePageId ? ' [ACTIVE PAGE]' : '';
    lines.push(`page "${page.name}" slug="${page.slug}" id=${page.id}${marker}`);
    for (const section of page.sections) {
      const selected = section.id === selectedSectionId ? ' [SELECTED]' : '';
      const summary = summarizeSection(section);
      lines.push(`  - ${section.type} id=${section.id}${section.hidden ? ' (hidden)' : ''}${selected}${summary ? ` :: ${summary}` : ''}`);
    }
    lines.push('');
  }

  return lines.join('\n').trim();
}

function summarizeSection(section: Record<string, unknown> & { type: string }): string {
  const parts: string[] = [];
  const push = (key: string, max = 70) => {
    const value = section[key];
    if (typeof value === 'string' && value) parts.push(`${key}="${truncate(value, max)}"`);
  };

  if (typeof section.variant === 'string') parts.push(`variant=${section.variant}`);
  if (typeof section.background === 'string' && section.background !== 'default') parts.push(`background=${section.background}`);
  push('heading');
  push('subheading', 90);
  push('logoText', 40);
  if (Array.isArray(section.items)) parts.push(`items=${section.items.length}`);
  if (Array.isArray(section.images)) parts.push(`images=${section.images.length}`);
  if (Array.isArray(section.plans)) parts.push(`plans=${section.plans.length}`);
  if (Array.isArray(section.links)) parts.push(`links=${section.links.length}`);

  return parts.join(' ');
}

function truncate(value: string, max: number): string {
  return value.length <= max ? value : `${value.slice(0, max - 1)}…`;
}

/** Prompt used by the per-section quick actions in the editor. */
export function sectionActionMessage(action: string, sectionId: string): string {
  return `Apply this to the section with id ${sectionId}: ${action}`;
}
