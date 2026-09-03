import type { WebsiteDocument } from '@/lib/website/document';
import { findSection } from '@/lib/website/document';
import { SECTION_TYPES, type SectionType } from '@/lib/website/sections';

/**
 * Offline copilot.
 *
 * When no LLM key is configured, the copilot still works for the common
 * intents by mapping natural language onto the very same operations the model
 * would call. It is honest about its limits: anything requiring real language
 * generation returns no operations and says so.
 */

export type HeuristicResult = {
  message: string;
  operations: Array<{ name: string; input: Record<string, unknown> }>;
};

const COLORS: Record<string, string> = {
  blue: '#2563eb', navy: '#1e3a8a', indigo: '#4f46e5', purple: '#7c3aed', violet: '#8b5cf6',
  pink: '#db2777', rose: '#e11d48', red: '#dc2626', orange: '#ea580c', amber: '#d97706',
  yellow: '#ca8a04', lime: '#65a30d', green: '#16a34a', emerald: '#059669', teal: '#0d9488',
  cyan: '#0891b2', sky: '#0284c7', slate: '#475569', gray: '#4b5563', grey: '#4b5563',
  black: '#111111', brown: '#92400e', gold: '#b7791f', maroon: '#7f1d1d',
};

/** Ordered variant cycles, so "change the layout" is a deterministic step. */
const VARIANT_CYCLES: Partial<Record<SectionType, string[]>> = {
  header: ['simple', 'split', 'centered'],
  hero: ['split', 'centered', 'imageBackground', 'minimal'],
  features: ['cards', 'plain', 'list', 'alternating'],
  gallery: ['grid', 'masonry', 'filmstrip'],
  testimonials: ['cards', 'single', 'compact'],
  textMedia: ['imageRight', 'imageLeft', 'stacked'],
  stats: ['row', 'cards'],
  pricing: ['cards', 'table'],
  faq: ['accordion', 'twoColumn'],
  contact: ['split', 'centered'],
  cta: ['boxed', 'banner', 'split'],
  footer: ['columns', 'simple', 'centered'],
};

export function heuristicCopilot(
  instruction: string,
  document: WebsiteDocument,
  selectedSectionId?: string,
): HeuristicResult {
  const text = instruction.toLowerCase();
  const operations: HeuristicResult['operations'] = [];
  const notes: string[] = [];
  const selected = selectedSectionId ? findSection(document, selectedSectionId) : undefined;
  const theme: Record<string, unknown> = {};

  // --- explicit structural commands ---------------------------------------
  if (selected) {
    if (/\b(delete|remove)\b/.test(text)) {
      return { message: `Deleted the ${selected.section.type} section.`, operations: [{ name: 'delete_section', input: { sectionId: selected.section.id } }] };
    }
    if (/\bduplicate\b|\bcopy this section\b/.test(text)) {
      return { message: `Duplicated the ${selected.section.type} section.`, operations: [{ name: 'duplicate_section', input: { sectionId: selected.section.id } }] };
    }
    if (/\bhide\b/.test(text)) {
      return { message: `Hid the ${selected.section.type} section.`, operations: [{ name: 'toggle_section', input: { sectionId: selected.section.id, hidden: true } }] };
    }
    if (/\bmove (it )?up\b/.test(text)) {
      return { message: 'Moved the section up.', operations: [{ name: 'move_section', input: { sectionId: selected.section.id, direction: 'up' } }] };
    }
    if (/\bmove (it )?down\b/.test(text)) {
      return { message: 'Moved the section down.', operations: [{ name: 'move_section', input: { sectionId: selected.section.id, direction: 'down' } }] };
    }
  }

  const addMatch = /\badd (?:a |an )?(\w+)\b/.exec(text);
  if (addMatch) {
    const requested = SECTION_TYPES.find((type) => type.toLowerCase() === addMatch[1] || type.toLowerCase().startsWith(addMatch[1]));
    if (requested) {
      const page = document.pages.find((p) => p.sections.some((s) => s.id === selectedSectionId)) ?? document.pages[0];
      return {
        message: `Added a ${requested} section to "${page.name}".`,
        operations: [{ name: 'add_section', input: { page: page.slug || 'home', type: requested } }],
      };
    }
  }

  // --- theme intents -------------------------------------------------------
  for (const [name, hex] of Object.entries(COLORS)) {
    if (new RegExp(`\b${name}\b`).test(text)) {
      theme.primaryColor = hex;
      notes.push(`primary colour to ${name}`);
      break;
    }
  }

  if (/\bdark(er)?\b|\bnight\b|\bmoody\b/.test(text)) {
    Object.assign(theme, { mode: 'dark', background: '#0d0f14', surface: '#171a22', textColor: '#f2f4f8', mutedColor: '#98a2b5', borderColor: '#262b38' });
    notes.push('a dark palette');
  } else if (/\blight(er)?\b|\bbright(er)?\b/.test(text)) {
    Object.assign(theme, { mode: 'light', background: '#ffffff', surface: '#f6f7f9', textColor: '#0d0f14', mutedColor: '#5b6478', borderColor: '#e6e8ee' });
    notes.push('a light palette');
  }

  if (/\bpremium\b|\bluxur\w*|\belegant\b|\bsophisticat\w*|\bupmarket\b|\bhigh.end\b/.test(text)) {
    Object.assign(theme, { headingFont: 'Playfair Display', bodyFont: 'Lora', radius: 'sm', density: 'spacious', buttonStyle: 'outline' });
    notes.push('a more premium type and spacing treatment');
  }
  if (/\bmodern\b|\bcontemporary\b|\bsleek\b/.test(text)) {
    Object.assign(theme, { headingFont: 'Space Grotesk', bodyFont: 'Inter', radius: 'lg' });
    notes.push('a more modern typeface');
  }
  if (/\bminimal\w*|\bclean\w*|\bsimpler\b|\bcalm\w*/.test(text)) {
    Object.assign(theme, { radius: 'sm', density: 'spacious', buttonStyle: 'solid' });
    notes.push('a more minimal treatment');
  }
  if (/\bbold\w*|\bvibrant\b|\benerget\w*|\bplayful\b|\bfun\b/.test(text)) {
    Object.assign(theme, { radius: 'full', buttonStyle: 'pill', density: 'comfortable' });
    notes.push('bolder shapes');
  }
  if (/\bround(ed|er)?\b|\bsoft(er)?\b/.test(text)) {
    theme.radius = 'lg';
    notes.push('rounder corners');
  }
  if (/\bsharp\w*|\bsquare\b|\bangular\b|\bboxy\b/.test(text)) {
    theme.radius = 'none';
    notes.push('sharp corners');
  }
  if (/\bcompact(er)?\b|\btight(er)?\b|\bdens(e|er)\b/.test(text)) {
    theme.density = 'compact';
    notes.push('tighter spacing');
  }
  if (/\bspacious\b|\bmore (white ?space|breathing)\b|\bairier\b/.test(text)) {
    theme.density = 'spacious';
    notes.push('more whitespace');
  }

  if (Object.keys(theme).length > 0) {
    operations.push({ name: 'update_theme', input: theme });
  }

  // --- section intents -----------------------------------------------------
  if (selected) {
    const { section } = selected;
    const props: Record<string, unknown> = {};

    if (/\blayout\b|\bdifferent (look|layout|style)\b|\brearrange\b|\bvariant\b/.test(text)) {
      const cycle = VARIANT_CYCLES[section.type];
      const current = (section as { variant?: string }).variant;
      if (cycle && current) {
        const next = cycle[(cycle.indexOf(current) + 1) % cycle.length];
        props.variant = next;
        notes.push(`the ${section.type} layout to "${next}"`);
      }
    }

    if (/\bmobile\b|\bphone\b|\bresponsive\b/.test(text)) {
      if ('columns' in section) {
        props.columns = 2;
        notes.push('fewer columns so it stacks better on phones');
      }
      props.paddingY = 'sm';
      notes.push('tighter vertical padding on small screens');
    }

    if (/\bconversion\b|\bconvert\b|\bsales\b|\bmore leads\b|\bcta\b/.test(text)) {
      if ('primaryCta' in section) {
        props.primaryCta = { label: 'Book a free call', href: '/contact' };
        notes.push('a sharper primary call to action');
      }
      if (section.type !== 'cta') {
        const page = selected.page;
        operations.push({ name: 'add_section', input: { page: page.slug || 'home', type: 'cta', position: selected.index + 1 } });
        notes.push('a dedicated call-to-action band below it');
      }
    }

    if (/\bmore whitespace\b|\bmore padding\b|\bbigger\b|\btaller\b/.test(text)) {
      props.paddingY = 'lg';
    }
    if (/\bless padding\b|\bshorter\b|\bsmaller\b/.test(text)) {
      props.paddingY = 'sm';
    }
    if (/\bhighlight\b|\bstand out\b|\bemphasi[sz]e\b/.test(text)) {
      props.background = 'surface';
      notes.push('a contrasting background so it stands out');
    }
    if (/\bdark background\b|\binvert\b/.test(text)) {
      props.background = 'inverse';
    }

    if (Object.keys(props).length > 0) {
      operations.push({ name: 'update_section', input: { sectionId: section.id, props } });
    }
  }

  // --- copy requests we honestly cannot serve offline ----------------------
  const wantsCopy = /\brewrite\b|\bcopy\b|\bwording\b|\bheadline\b|\btext\b|\bdescribe\b|\bproofread\b|\btone\b/.test(text);

  if (operations.length === 0) {
    if (wantsCopy) {
      return {
        message:
          'Rewriting copy needs a language model. Add ANTHROPIC_API_KEY or OPENAI_API_KEY to your environment and I will rewrite this properly. In the meantime you can edit any text directly in the canvas.',
        operations: [],
      };
    }
    return {
      message:
        'I could not map that to a change without a language model. Configure ANTHROPIC_API_KEY or OPENAI_API_KEY for full copilot editing. Offline I can still handle colours, fonts, corner radius, spacing, light/dark, layout variants, and adding, moving, duplicating, hiding or deleting sections.',
      operations: [],
    };
  }

  const message = notes.length > 0 ? `Applied ${joinList(notes)}.` : 'Applied your change.';
  return {
    message: wantsCopy ? `${message} Copy rewriting needs a language model, so I left the wording as it was.` : message,
    operations,
  };
}

function joinList(items: string[]): string {
  const unique = Array.from(new Set(items));
  if (unique.length === 1) return unique[0];
  return `${unique.slice(0, -1).join(', ')} and ${unique[unique.length - 1]}`;
}
