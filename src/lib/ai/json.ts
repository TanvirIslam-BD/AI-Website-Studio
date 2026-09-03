/**
 * Extracting structured output from a text completion.
 *
 * Models occasionally wrap JSON in prose or a code fence even when asked not
 * to. Rather than failing the user's request we recover the outermost JSON
 * object, then hand it to zod for the real validation.
 */

export function extractJsonObject(text: string): unknown {
  const trimmed = text.trim();

  const candidates: string[] = [];
  const fenced = /```(?:json)?\s*([\s\S]*?)```/i.exec(trimmed);
  if (fenced?.[1]) candidates.push(fenced[1].trim());
  candidates.push(trimmed);

  const start = trimmed.indexOf('{');
  const end = trimmed.lastIndexOf('}');
  if (start !== -1 && end > start) candidates.push(trimmed.slice(start, end + 1));

  for (const candidate of candidates) {
    try {
      return JSON.parse(candidate);
    } catch {
      // try the next candidate
    }
  }

  throw new Error('The model did not return valid JSON.');
}
