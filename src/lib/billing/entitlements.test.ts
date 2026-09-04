import { beforeEach, describe, expect, it, vi } from 'vitest';

/**
 * Plan enforcement.
 *
 * This decides who gets charged and who gets refused, so it is tested against
 * the boundaries rather than the happy path: exactly at a limit, one past it,
 * and the difference between a capability someone lacks and an allowance they
 * have exhausted - which produce different prompts and must not be conflated.
 */

const workspace = { findUniqueOrThrow: vi.fn() };
const project = { count: vi.fn() };
const usageEvent = { aggregate: vi.fn(), create: vi.fn() };
const platformSetting = { findUnique: vi.fn() };

vi.mock('@/lib/db', () => ({
  db: { workspace, project, usageEvent, platformSetting },
  isRemoteDatabase: () => false,
}));

const { requireAllowance, recordUsage, entitlementsFor, PlanLimitError } = await import('./entitlements');

/** Puts the workspace in a given state before a check. */
function given({ plan = 'FREE', websites = 0, creditsUsed = 0, paused = false } = {}) {
  workspace.findUniqueOrThrow.mockResolvedValue({ plan, periodStart: new Date('2026-01-01') });
  project.count.mockResolvedValue(websites);
  usageEvent.aggregate.mockResolvedValue({ _sum: { credits: creditsUsed } });
  platformSetting.findUnique.mockResolvedValue({ generationPaused: paused });
}

async function refusal(promise: Promise<unknown>) {
  try {
    await promise;
    return null;
  } catch (error) {
    return error as InstanceType<typeof PlanLimitError>;
  }
}

beforeEach(() => {
  vi.clearAllMocks();
  usageEvent.create.mockResolvedValue({});
});

describe('a new free workspace', () => {
  it('may generate its first website', async () => {
    given({ plan: 'FREE', websites: 0, creditsUsed: 0 });
    await expect(requireAllowance('ws', 'generate')).resolves.toMatchObject({ plan: 'FREE' });
  });

  it('may not generate a second', async () => {
    given({ plan: 'FREE', websites: 1, creditsUsed: 1 });

    const error = await refusal(requireAllowance('ws', 'generate'));
    expect(error?.reason).toBe('websites');
    expect(error?.status).toBe(402);
    expect(error?.requiredPlan).toBe('PRO');
  });

  it('may not edit what it generated', async () => {
    given({ plan: 'FREE', websites: 1 });

    const error = await refusal(requireAllowance('ws', 'edit'));
    expect(error?.reason).toBe('editing');
    expect(error?.requiredPlan).toBe('PRO');
  });

  it('may not use the copilot', async () => {
    given({ plan: 'FREE', websites: 1 });
    expect((await refusal(requireAllowance('ws', 'copilot')))?.reason).toBe('editing');
  });

  it('may not publish', async () => {
    given({ plan: 'FREE', websites: 1 });

    const error = await refusal(requireAllowance('ws', 'deploy'));
    expect(error?.reason).toBe('deploying');
    expect(error?.requiredPlan).toBe('PRO');
  });

  /**
   * Two different refusals that a single "upgrade" message would blur. Lacking
   * the capability is permanent on this plan; running out of credits is not.
   */
  it('reports a missing capability separately from an exhausted allowance', async () => {
    given({ plan: 'FREE', websites: 1 });
    expect((await refusal(requireAllowance('ws', 'copilot')))?.reason).toBe('editing');

    given({ plan: 'PRO', websites: 1, creditsUsed: 300 });
    expect((await refusal(requireAllowance('ws', 'copilot')))?.reason).toBe('credits');
  });
});

describe('a paid workspace', () => {
  it('may edit, use the copilot and publish', async () => {
    given({ plan: 'PRO', websites: 3, creditsUsed: 10 });

    await expect(requireAllowance('ws', 'edit')).resolves.toBeTruthy();
    await expect(requireAllowance('ws', 'copilot')).resolves.toBeTruthy();
    await expect(requireAllowance('ws', 'deploy')).resolves.toBeTruthy();
  });

  it('is refused at its website limit, not before it', async () => {
    given({ plan: 'PRO', websites: 24 });
    await expect(requireAllowance('ws', 'generate')).resolves.toBeTruthy();

    given({ plan: 'PRO', websites: 25 });
    expect((await refusal(requireAllowance('ws', 'generate')))?.reason).toBe('websites');
  });

  it('may spend its last credit but not one beyond', async () => {
    given({ plan: 'PRO', websites: 1, creditsUsed: 299 });
    await expect(requireAllowance('ws', 'copilot')).resolves.toBeTruthy();

    given({ plan: 'PRO', websites: 1, creditsUsed: 300 });
    expect((await refusal(requireAllowance('ws', 'copilot')))?.reason).toBe('credits');
  });

  it('is pointed at Agency when Pro is the plan it has exhausted', async () => {
    given({ plan: 'PRO', websites: 25 });
    expect((await refusal(requireAllowance('ws', 'generate')))?.requiredPlan).toBe('AGENCY');
  });
});

describe('when generation is paused platform-wide', () => {
  it('refuses generation on any plan', async () => {
    given({ plan: 'AGENCY', websites: 1, paused: true });

    const error = await refusal(requireAllowance('ws', 'generate'));
    expect(error?.reason).toBe('paused');
  });

  it('still allows publishing, which calls no model', async () => {
    given({ plan: 'PRO', websites: 1, paused: true });
    await expect(requireAllowance('ws', 'deploy')).resolves.toBeTruthy();
  });
});

describe('the ledger', () => {
  it('charges the listed cost for a generation', async () => {
    await recordUsage({ workspaceId: 'ws', plan: 'PRO', kind: 'generate', userId: 'u', projectId: 'p' });

    expect(usageEvent.create).toHaveBeenCalledWith({
      data: expect.objectContaining({ kind: 'generate', credits: 1, plan: 'PRO' }),
    });
  });

  it.each(['deploy', 'scaffold'] as const)('records %s at zero credits', async (kind) => {
    await recordUsage({ workspaceId: 'ws', plan: 'FREE', kind });

    expect(usageEvent.create).toHaveBeenCalledWith({ data: expect.objectContaining({ kind, credits: 0 }) });
  });

  /**
   * The work is already done by the time this runs. Losing the record is bad;
   * failing the request the user just paid for is worse.
   */
  it('does not fail the request when the write fails', async () => {
    usageEvent.create.mockRejectedValue(new Error('database is gone'));
    await expect(recordUsage({ workspaceId: 'ws', plan: 'PRO', kind: 'generate' })).resolves.toBeUndefined();
  });
});

describe('reported usage', () => {
  it('is derived from the ledger rather than a stored balance', async () => {
    given({ plan: 'PRO', websites: 4, creditsUsed: 120 });

    const entitlements = await entitlementsFor('ws');

    expect(entitlements.credits).toEqual({ used: 120, limit: 300, remaining: 180 });
    expect(entitlements.websites).toEqual({ used: 4, limit: 25, remaining: 21 });
  });

  it('never reports negative remaining, even past a limit', async () => {
    given({ plan: 'FREE', websites: 5, creditsUsed: 9 });

    const entitlements = await entitlementsFor('ws');

    expect(entitlements.websites.remaining).toBe(0);
    expect(entitlements.credits.remaining).toBe(0);
  });
});
