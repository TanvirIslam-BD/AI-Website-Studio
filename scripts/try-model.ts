/**
 * Benchmark models against the real generation path.
 *
 *   npm run try:model                                  # the model .env selects
 *   npm run try:model gemini-3.8-flash gpt-4.1-mini    # compare, same brief
 *   SAMPLES=3 npm run try:model gpt-4o                 # more samples
 *
 * Calls the same prompts and the same validation the app does, so the number
 * that matters - sections - is what would actually survive `buildFromResponse`.
 * A model whose JSON is subtly wrong returns a thin site rather than an error,
 * and only running it through the real schemas shows that.
 *
 * Two samples by default, in parallel, because latency here is not stable: one
 * candidate measured 54s and 351s on identical requests, and a single sample
 * would have recommended it.
 *
 * Reads the key from .env. Never pass a key on the command line - it would land
 * in your shell history.
 */
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import OpenAI from 'openai';

for (const line of readFileSync(resolve(process.cwd(), '.env'), 'utf8').split('\n')) {
  const match = /^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/.exec(line);
  if (!match) continue;
  const value = match[2].trim().replace(/^["']|["']$/g, '');
  if (value && !process.env[match[1]]) process.env[match[1]] = value;
}

/** The route's own ceiling. Anything slower is killed before it answers. */
const ROUTE_LIMIT_SECONDS = 120;
const SAMPLES = Number(process.env.SAMPLES ?? 2);

const BRIEF =
  'A modern premium SaaS website for Money Copilot AI, an AI personal finance assistant that tracks ' +
  'expenses through conversation. Mint accent, off-white background, hero with a chat mock-up, ' +
  'how-it-works, pricing, FAQ and a closing call to action.';

/**
 * Models that cannot be stopped from reasoning need it turned down, or they
 * spend the whole output budget thinking and return truncated JSON.
 */
const EXTRA_PARAMS: Record<string, Record<string, unknown>> = {
  'glm-5.3-flash': { reasoning_effort: 'low' },
  'glm-5.3': { reasoning_effort: 'low' },
};

type Sample = { seconds: number; sections: number; pages: number; outTokens: number; error?: string };

async function sample(model: string, system: string, user: string, brief: string, stock: string[]): Promise<Sample> {
  const { buildFromResponse } = await import('../src/lib/ai/generate');
  const client = new OpenAI({
    apiKey: process.env.COMETAPI_API_KEY,
    baseURL: process.env.COMETAPI_BASE_URL ?? 'https://api.cometapi.com/v1',
  });

  const started = Date.now();
  try {
    const response = await client.chat.completions.create({
      model,
      max_tokens: 16000,
      temperature: 0.7,
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: system },
        { role: 'user', content: user },
      ],
      ...(EXTRA_PARAMS[model] ?? {}),
    } as never);

    const seconds = (Date.now() - started) / 1000;
    const text = (response as { choices: Array<{ message?: { content?: string } }> }).choices[0]?.message?.content ?? '';
    const outTokens = (response as { usage?: { completion_tokens?: number } }).usage?.completion_tokens ?? 0;

    // The real validation. Anything that fails the section schemas is dropped.
    const built = buildFromResponse(text, brief, stock);
    return {
      seconds,
      pages: built.document.pages.length,
      sections: built.document.pages.reduce((total, page) => total + page.sections.length, 0),
      outTokens,
    };
  } catch (error) {
    return {
      seconds: (Date.now() - started) / 1000,
      pages: 0,
      sections: 0,
      outTokens: 0,
      error: error instanceof Error ? error.message.slice(0, 60) : 'failed',
    };
  }
}

async function main() {
  if (!process.env.COMETAPI_API_KEY?.trim()) {
    console.error('\nCOMETAPI_API_KEY is not set. Add it to .env (gitignored) and run again.\n');
    process.exit(1);
  }

  const { websiteGenerationPrompt, generationUserMessage } = await import('../src/lib/ai/prompts');
  const { stockImages } = await import('../src/lib/website/stock');

  const stock = stockImages('abstract', 6);
  const system = websiteGenerationPrompt();
  const user = generationUserMessage(BRIEF, stock);

  const models = process.argv.slice(2);
  const targets = models.length > 0 ? models : [process.env.COMETAPI_MODEL ?? 'gpt-4o'];

  console.log(`\n${targets.length} model(s) x ${SAMPLES} sample(s), live calls against the real prompts.`);
  console.log(`Route limit is ${ROUTE_LIMIT_SECONDS}s.\n`);

  const rows: Array<Sample & { model: string }> = [];
  for (let round = 0; round < SAMPLES; round += 1) {
    process.stdout.write(`round ${round + 1}… `);
    const results = await Promise.all(targets.map((model) => sample(model, system, user, BRIEF, stock)));
    results.forEach((result, index) => rows.push({ model: targets[index], ...result }));
    console.log('done');
  }

  const summary = targets.map((model) => {
    const mine = rows.filter((row) => row.model === model);
    const good = mine.filter((row) => !row.error && row.sections > 0);
    const times = mine.map((row) => row.seconds);
    const slowest = Math.max(...times);
    const sections = good.length > 0 ? Math.round(good.reduce((n, r) => n + r.sections, 0) / good.length) : 0;

    return {
      model,
      ok: `${good.length}/${mine.length}`,
      fastest: `${Math.min(...times).toFixed(0)}s`,
      slowest: `${slowest.toFixed(0)}s`,
      sections,
      fitsLimit: slowest < ROUTE_LIMIT_SECONDS ? 'yes' : 'NO',
      note: good.length === 0 ? (mine[0]?.error ?? 'no usable output') : '',
    };
  });

  // Usable first, then richest output, then fastest worst case.
  summary.sort((a, b) => {
    const fit = Number(b.fitsLimit === 'yes') - Number(a.fitsLimit === 'yes');
    if (fit !== 0) return fit;
    const okDiff = Number(b.ok.split('/')[0]) - Number(a.ok.split('/')[0]);
    if (okDiff !== 0) return okDiff;
    if (b.sections !== a.sections) return b.sections - a.sections;
    return parseFloat(a.slowest) - parseFloat(b.slowest);
  });

  console.log('\nRanked - every sample must fit the limit, not just the best one:\n');
  console.table(summary);
  console.log('sections is the average that survived schema validation. Higher is a richer site.\n');
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
