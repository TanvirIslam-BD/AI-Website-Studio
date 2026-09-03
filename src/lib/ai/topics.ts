import { TOPIC_KEYS, type StockTopic } from '@/lib/website/stock';

/**
 * Keyword -> stock topic mapping.
 *
 * Runs before generation so the model can be handed a set of on-topic image
 * URLs (it must never invent them), and it is also what the offline template
 * generator uses to pick imagery and copy.
 */
const KEYWORDS: Record<StockTopic, string[]> = {
  photography: ['photograph', 'photo', 'portrait', 'wedding photo', 'studio shoot', 'videograph', 'film maker'],
  restaurant: ['restaurant', 'cafe', 'bistro', 'diner', 'catering', 'food', 'chef', 'menu', 'bakery', 'pizzeria', 'bar'],
  fitness: ['gym', 'fitness', 'personal train', 'crossfit', 'yoga', 'pilates', 'workout', 'coach', 'athlet'],
  salon: ['salon', 'barber', 'hair', 'nails', 'spa', 'beauty', 'lash', 'massage', 'aesthetic'],
  realestate: ['real estate', 'realtor', 'property', 'letting', 'estate agent', 'mortgage', 'apartment'],
  construction: ['construction', 'builder', 'contractor', 'roofing', 'plumb', 'electric', 'renovat', 'carpent', 'landscap'],
  tech: ['saas', 'software', 'app', 'startup', 'platform', 'api', 'developer', 'ai ', 'data', 'cyber', 'cloud'],
  agency: ['agency', 'marketing', 'branding', 'design studio', 'consult', 'freelance', 'creative', 'seo', 'copywrit'],
  health: ['clinic', 'dental', 'dentist', 'doctor', 'medical', 'therapy', 'therapist', 'health', 'physio', 'chiropract', 'veterinar'],
  education: ['school', 'course', 'tutor', 'academy', 'training', 'bootcamp', 'learn', 'university', 'workshop'],
  travel: ['travel', 'tour', 'hotel', 'hostel', 'airbnb', 'trip', 'adventure', 'safari', 'resort'],
  fashion: ['fashion', 'clothing', 'boutique', 'apparel', 'jewel', 'shoe', 'style', 'tailor'],
  coffee: ['coffee', 'roaster', 'espresso', 'tea house', 'brew'],
  pets: ['pet', 'dog', 'cat', 'groom', 'kennel', 'animal'],
  legal: ['law', 'lawyer', 'attorney', 'solicitor', 'legal', 'accountant', 'accounting', 'tax', 'notary', 'finance'],
  music: ['music', 'band', 'dj', 'record', 'producer', 'studio session', 'singer', 'podcast'],
  wedding: ['wedding', 'bridal', 'event planner', 'florist', 'celebrant'],
  interior: ['interior', 'architect', 'furniture', 'home decor', 'staging', 'kitchen design'],
  automotive: ['car', 'auto', 'garage', 'mechanic', 'detailing', 'dealership', 'motorcycle', 'tyre', 'tire'],
  abstract: [],
};

export function detectTopic(brief: string): StockTopic {
  const text = brief.toLowerCase();
  let best: { topic: StockTopic; score: number } = { topic: 'agency', score: 0 };

  for (const topic of TOPIC_KEYS) {
    let score = 0;
    for (const keyword of KEYWORDS[topic]) {
      if (text.includes(keyword)) score += keyword.length;
    }
    if (score > best.score) best = { topic, score };
  }

  return best.score > 0 ? best.topic : 'agency';
}

export function normalizeTopic(value: unknown, fallback: StockTopic): StockTopic {
  return typeof value === 'string' && (TOPIC_KEYS as string[]).includes(value) ? (value as StockTopic) : fallback;
}

/**
 * Best-effort business name extraction, used when the brief already names the
 * business ("a website for Bloom & Vine florists") and for the offline path.
 */
export function guessBrand(brief: string): string {
  const quoted = /["'“”']([A-Z][\w&'. -]{1,38})["'“”']/.exec(brief);
  if (quoted?.[1]) return quoted[1].trim();

  const named = /(?:called|named|for)\s+([A-Z][\w&'.-]*(?:\s+[A-Z][\w&'.-]*){0,2})/.exec(brief);
  if (named?.[1] && !/^(A|An|The|My|Our)$/i.test(named[1])) return named[1].trim();

  return '';
}
