import { SECTION_TYPES } from '@/lib/website/sections';

/**
 * Reading progress out of a response that is still being written.
 *
 * Generation is one long model call. Showing a spinner for forty seconds says
 * nothing, and a timed fake progress bar says something untrue - it would still
 * be creeping forward after the request had failed.
 *
 * So progress is derived from the response itself. As JSON streams in, this
 * recognises structure that has definitely arrived and reports it once. Every
 * event corresponds to something the model actually wrote.
 *
 * This is deliberately not a JSON parser. Partial JSON cannot be parsed, and a
 * parser that tolerated it would be a large thing to get wrong for a progress
 * indicator. Scanning for landmarks in a shape we control is enough: if a
 * landmark is missed the display is quieter than reality, which is a far better
 * failure than a bar that lies.
 */

export type GenerationProgress =
  | { stage: 'starting' }
  /** The model settled on a brand name, which is the first thing it writes. */
  | { stage: 'brand'; brand: string }
  | { stage: 'page'; name: string; index: number }
  | { stage: 'section'; sectionType: string; page: string | null; total: number }
  | { stage: 'validating' }
  | { stage: 'saving' }
  | { stage: 'template'; reason?: string }
  | { stage: 'done'; projectId: string; name: string; source: 'ai' | 'template'; warning?: string | null }
  | { stage: 'error'; message: string };

/** `"type": "hero"` - only section types, so a match is not a coincidence. */
const SECTION_MARKER = new RegExp(String.raw`"type"\s*:\s*"(${SECTION_TYPES.join('|')})"`, 'g');
/** Each page object has exactly one of these, so they count pages. */
const PAGE_MARKER = /"sections"\s*:\s*\[/g;
const BRAND = /"brand"\s*:\s*"([^"]{1,80})"/;
/** The nearest preceding name is the page's own. */
const NAME = /"name"\s*:\s*"([^"]{1,80})"/g;

export class ProgressReader {
  private buffer = '';
  private brandSent = false;
  private pages = 0;
  private sections = 0;
  private currentPage: string | null = null;

  /**
   * Feeds a chunk in and returns whatever became true because of it.
   *
   * Scans the whole buffer each time rather than only the new chunk: a landmark
   * can be split across chunk boundaries, and re-scanning is trivially cheap
   * next to the model call it is reporting on. Counters make each landmark
   * report once.
   */
  push(chunk: string): GenerationProgress[] {
    this.buffer += chunk;
    const events: GenerationProgress[] = [];

    if (!this.brandSent) {
      const brand = BRAND.exec(this.buffer);
      if (brand?.[1]) {
        this.brandSent = true;
        events.push({ stage: 'brand', brand: brand[1] });
      }
    }

    PAGE_MARKER.lastIndex = 0;
    let pageCount = 0;
    let match: RegExpExecArray | null;
    while ((match = PAGE_MARKER.exec(this.buffer)) !== null) {
      pageCount += 1;
      if (pageCount > this.pages) {
        this.pages = pageCount;
        this.currentPage = this.nameBefore(match.index);
        events.push({ stage: 'page', name: this.currentPage ?? `Page ${pageCount}`, index: pageCount });
      }
    }

    SECTION_MARKER.lastIndex = 0;
    let sectionCount = 0;
    while ((match = SECTION_MARKER.exec(this.buffer)) !== null) {
      sectionCount += 1;
      if (sectionCount > this.sections) {
        this.sections = sectionCount;
        events.push({
          stage: 'section',
          sectionType: match[1],
          page: this.nameBefore(match.index),
          total: sectionCount,
        });
      }
    }

    return events;
  }

  /**
   * The page name a landmark belongs to.
   *
   * Sections carry `name` fields of their own - a team member, a pricing plan -
   * so the search starts from the last `"sections":[` before the landmark. The
   * name immediately before that opening bracket is the page's.
   */
  private nameBefore(index: number): string | null {
    const head = this.buffer.slice(0, index);
    const pageStart = head.lastIndexOf('"sections"');
    const region = pageStart === -1 ? head : head.slice(0, pageStart);

    NAME.lastIndex = 0;
    let last: string | null = null;
    let match: RegExpExecArray | null;
    while ((match = NAME.exec(region)) !== null) last = match[1];
    return last;
  }

  /** Everything received so far, for the caller to parse once the stream ends. */
  text(): string {
    return this.buffer;
  }
}

/** Wording for the UI, kept next to the events so the two cannot drift. */
export function describeProgress(event: GenerationProgress): string {
  switch (event.stage) {
    case 'starting':
      return 'Reading your brief';
    case 'brand':
      return `Designing for ${event.brand}`;
    case 'page':
      return `Building the ${event.name} page`;
    case 'section':
      return `Writing the ${SECTION_LABELS[event.sectionType] ?? event.sectionType} section`;
    case 'validating':
      return 'Checking every section';
    case 'saving':
      return 'Saving your website';
    case 'template':
      return 'Using a starter template';
    case 'done':
      return 'Opening the editor';
    case 'error':
      return event.message;
  }
}

/** Human name for a section type, as the progress UI shows it. */
export function sectionLabel(type: string): string {
  return SECTION_LABELS[type] ?? type;
}

const SECTION_LABELS: Record<string, string> = {
  header: 'navigation',
  hero: 'hero',
  features: 'features',
  gallery: 'gallery',
  testimonials: 'testimonials',
  textMedia: 'about',
  stats: 'stats',
  logos: 'logo cloud',
  pricing: 'pricing',
  team: 'team',
  faq: 'FAQ',
  contact: 'contact',
  cta: 'call to action',
  footer: 'footer',
};
