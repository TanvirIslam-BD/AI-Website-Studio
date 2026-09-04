import { db } from '@/lib/db';

/**
 * Platform-wide controls, and who is allowed to change them.
 *
 * These live in the database rather than the environment because they are
 * levers for a bad afternoon: a provider is down, a bill is running away, an
 * abusive signup is spraying generations. An environment variable cannot be
 * moved without a redeploy, which is the wrong tool when the point is to stop
 * something quickly.
 */

export type GenerationMode = 'auto' | 'ai' | 'template';

export type PlatformSettings = {
  /**
   * `auto` defers to whatever the environment configures - the existing
   * behaviour. `ai` and `template` force the path regardless, so the owner can
   * fall back to templates without touching a deploy.
   */
  generationMode: GenerationMode;
  generationPaused: boolean;
  signupsPaused: boolean;
  notice: string | null;
};

const DEFAULTS: PlatformSettings = {
  generationMode: 'auto',
  generationPaused: false,
  signupsPaused: false,
  notice: null,
};

function isMode(value: string): value is GenerationMode {
  return value === 'auto' || value === 'ai' || value === 'template';
}

/**
 * Reads the settings, falling back to defaults.
 *
 * Never throws. This is consulted on paths that must keep working - if the row
 * is missing, or the table has not been migrated yet, the right answer is the
 * behaviour the product had before these controls existed, not an error page.
 */
export async function platformSettings(): Promise<PlatformSettings> {
  try {
    const row = await db.platformSetting.findUnique({ where: { id: 'singleton' } });
    if (!row) return DEFAULTS;

    return {
      generationMode: isMode(row.generationMode) ? row.generationMode : 'auto',
      generationPaused: row.generationPaused,
      signupsPaused: row.signupsPaused,
      notice: row.notice?.trim() || null,
    };
  } catch (error) {
    console.error('[platform] could not read settings, using defaults:', error);
    return DEFAULTS;
  }
}

/** Writes settings, creating the single row the first time. */
export async function savePlatformSettings(
  patch: Partial<PlatformSettings>,
  updatedById: string,
): Promise<PlatformSettings> {
  const data = {
    ...(patch.generationMode !== undefined ? { generationMode: patch.generationMode } : {}),
    ...(patch.generationPaused !== undefined ? { generationPaused: patch.generationPaused } : {}),
    ...(patch.signupsPaused !== undefined ? { signupsPaused: patch.signupsPaused } : {}),
    ...(patch.notice !== undefined ? { notice: patch.notice } : {}),
    updatedById,
  };

  await db.platformSetting.upsert({
    where: { id: 'singleton' },
    create: { id: 'singleton', ...data },
    update: data,
  });

  return platformSettings();
}
