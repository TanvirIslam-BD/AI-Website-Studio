/**
 * Monthly credit periods, derived rather than stored.
 *
 * `Workspace.periodStart` is an *anchor* - the day the workspace started
 * counting, set at signup and re-set when an operator deliberately resets it.
 * The period a workspace is actually in right now is calculated from that
 * anchor and the clock, so it advances on its own with nothing to run.
 *
 * The alternative was a job that rewrites every workspace's period each month.
 * That needs a scheduler the product does not otherwise have, and it fails in
 * the worst possible way: silently, leaving customers who paid for credits
 * unable to spend them until someone notices. Deriving cannot drift, cannot be
 * missed, and needs no infrastructure.
 *
 * Nothing here writes. Persisting the derived value as the new anchor would
 * lose the anchor day for months that have to be clamped - a 31st that becomes
 * the 28th in February would stay the 28th forever after - so the anchor is
 * left exactly as it was set.
 */

export type Period = {
  /** Inclusive: usage on or after this instant counts against the period. */
  start: Date;
  /** Exclusive: the instant the next period begins. */
  end: Date;
};

/**
 * Adds whole months to a date, clamping to the end of a short month.
 *
 * Always measured from the original anchor, never from a previously clamped
 * result, so an anchor on the 31st gives 31, 28, 31, 30 rather than collapsing
 * to the 28th after one short month. UTC throughout: these are server-side
 * instants, stored as UTC, and using local getters would move a period
 * boundary by an hour twice a year.
 */
export function addMonths(anchor: Date, months: number): Date {
  const year = anchor.getUTCFullYear();
  const month = anchor.getUTCMonth() + months;

  // Day 0 of the following month is the last day of this one.
  const lastDayOfTarget = new Date(Date.UTC(year, month + 1, 0)).getUTCDate();

  return new Date(
    Date.UTC(
      year,
      month,
      Math.min(anchor.getUTCDate(), lastDayOfTarget),
      anchor.getUTCHours(),
      anchor.getUTCMinutes(),
      anchor.getUTCSeconds(),
      anchor.getUTCMilliseconds(),
    ),
  );
}

/**
 * The period containing `now`, for a workspace anchored at `anchor`.
 *
 * Computed in one step rather than by looping a month at a time, so a
 * workspace nobody has touched for two years costs the same as one used this
 * morning.
 */
export function currentPeriod(anchor: Date, now: Date = new Date()): Period {
  const elapsed =
    (now.getUTCFullYear() - anchor.getUTCFullYear()) * 12 + (now.getUTCMonth() - anchor.getUTCMonth());

  // The calendar-month difference overshoots when the anchor day has not come
  // round yet this month - anchored on the 20th, three days into the next
  // month, that is one calendar month but not one period.
  let months = elapsed;
  if (months > 0 && addMonths(anchor, months).getTime() > now.getTime()) months -= 1;

  // A clock behind the anchor, or an anchor set in the future: the first
  // period has not ended, so it is still the current one.
  if (months < 0) months = 0;

  return { start: addMonths(anchor, months), end: addMonths(anchor, months + 1) };
}
