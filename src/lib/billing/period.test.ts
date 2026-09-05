import { describe, expect, it } from 'vitest';
import { addMonths, currentPeriod } from './period';

/**
 * Credit periods.
 *
 * Tested hard at the boundaries because this decides, silently and once a
 * month, whether someone's credits come back. The interesting cases are all
 * calendar arithmetic: months of different lengths, an anchor day that does
 * not exist in the next month, and long gaps where nobody visited.
 */

const at = (iso: string) => new Date(iso);

describe('adding months to an anchor', () => {
  it('keeps the day of the month', () => {
    expect(addMonths(at('2026-01-15T09:30:00Z'), 1).toISOString()).toBe('2026-02-15T09:30:00.000Z');
  });

  it('keeps the time of day', () => {
    expect(addMonths(at('2026-01-15T23:59:59.999Z'), 3).toISOString()).toBe('2026-04-15T23:59:59.999Z');
  });

  it('rolls the year over', () => {
    expect(addMonths(at('2026-11-05T00:00:00Z'), 3).toISOString()).toBe('2027-02-05T00:00:00.000Z');
  });

  /**
   * The 31st does not exist in February. Overflowing into March - which is
   * what a naive setMonth does - would move the boundary into the following
   * period and hand out an extra month of credits.
   */
  it('clamps to the last day of a shorter month', () => {
    expect(addMonths(at('2026-01-31T12:00:00Z'), 1).toISOString()).toBe('2026-02-28T12:00:00.000Z');
    expect(addMonths(at('2026-03-31T12:00:00Z'), 1).toISOString()).toBe('2026-04-30T12:00:00.000Z');
  });

  it('clamps to 29 February in a leap year', () => {
    expect(addMonths(at('2028-01-31T12:00:00Z'), 1).toISOString()).toBe('2028-02-29T12:00:00.000Z');
  });

  /**
   * The reason every offset is measured from the original anchor rather than
   * from the previous result: clamping must not be permanent.
   */
  it('recovers the anchor day after a short month', () => {
    const anchor = at('2026-01-31T12:00:00Z');

    expect(addMonths(anchor, 1).toISOString()).toBe('2026-02-28T12:00:00.000Z');
    expect(addMonths(anchor, 2).toISOString()).toBe('2026-03-31T12:00:00.000Z');
    expect(addMonths(anchor, 3).toISOString()).toBe('2026-04-30T12:00:00.000Z');
  });
});

describe('the period containing a moment', () => {
  const anchor = at('2026-01-20T10:00:00Z');

  it('is the first period on the anchor itself', () => {
    const period = currentPeriod(anchor, anchor);

    expect(period.start.toISOString()).toBe('2026-01-20T10:00:00.000Z');
    expect(period.end.toISOString()).toBe('2026-02-20T10:00:00.000Z');
  });

  it('has not advanced part-way through', () => {
    expect(currentPeriod(anchor, at('2026-02-19T23:59:59Z')).start.toISOString()).toBe('2026-01-20T10:00:00.000Z');
  });

  /**
   * A calendar-month difference is not a period. Three days into February the
   * month has changed but the 20th has not come round.
   */
  it('does not advance just because the calendar month changed', () => {
    expect(currentPeriod(anchor, at('2026-02-03T10:00:00Z')).start.toISOString()).toBe('2026-01-20T10:00:00.000Z');
  });

  it('advances the moment the anchor day comes round', () => {
    const period = currentPeriod(anchor, at('2026-02-20T10:00:00Z'));

    expect(period.start.toISOString()).toBe('2026-02-20T10:00:00.000Z');
    expect(period.end.toISOString()).toBe('2026-03-20T10:00:00.000Z');
  });

  /**
   * Nobody signs in for two years. One arithmetic step, not twenty-six, and
   * the answer is the period they are actually in - not the second one.
   */
  it('lands in the right period after a long absence', () => {
    const period = currentPeriod(anchor, at('2028-03-15T00:00:00Z'));

    expect(period.start.toISOString()).toBe('2028-02-20T10:00:00.000Z');
    expect(period.end.toISOString()).toBe('2028-03-20T10:00:00.000Z');
  });

  it('keeps the anchor day across a short month', () => {
    const endOfMonth = at('2026-01-31T00:00:00Z');

    expect(currentPeriod(endOfMonth, at('2026-03-01T00:00:00Z')).start.toISOString()).toBe('2026-02-28T00:00:00.000Z');
    expect(currentPeriod(endOfMonth, at('2026-03-31T00:00:00Z')).start.toISOString()).toBe('2026-03-31T00:00:00.000Z');
  });

  /**
   * A workspace granted a plan with a start date in the future, or a server
   * whose clock is behind. Neither should produce a negative period.
   */
  it('stays in the first period when the clock is behind the anchor', () => {
    const period = currentPeriod(anchor, at('2025-06-01T00:00:00Z'));

    expect(period.start.toISOString()).toBe('2026-01-20T10:00:00.000Z');
    expect(period.end.toISOString()).toBe('2026-02-20T10:00:00.000Z');
  });

  /**
   * The property the rest of the billing code relies on: whatever the calendar
   * does, the returned window actually contains the moment being asked about,
   * so a usage row is never counted against a period it did not happen in.
   *
   * Scoped to anchors in the past, which is the only kind that exists - an
   * anchor is written at signup or when an operator resets it. A series
   * starting in the future has no period containing an earlier moment, and the
   * first-period behaviour for that case is pinned by the test above.
   */
  it('always returns a period that contains the moment asked about', () => {
    const anchors = ['2026-01-31T23:00:00Z', '2026-02-28T00:00:00Z', '2026-06-15T12:00:00Z'];
    const moments = ['2026-03-01T00:00:00Z', '2026-12-31T23:59:59Z', '2027-02-28T12:00:00Z', '2029-07-04T06:00:00Z'];

    for (const a of anchors) {
      for (const m of moments) {
        const anchorAt = at(a);
        const now = at(m);
        if (now.getTime() < anchorAt.getTime()) continue;

        const period = currentPeriod(anchorAt, now);

        expect(period.start.getTime()).toBeLessThanOrEqual(now.getTime());
        expect(period.end.getTime()).toBeGreaterThan(now.getTime());
      }
    }
  });
});
