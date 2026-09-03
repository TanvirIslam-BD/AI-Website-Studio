import { SECTION_TYPES } from '@/lib/website/sections';
import { OPERATION_NAMES } from '@/lib/website/operations';
import { Container } from './shell';

/**
 * Product facts rather than invented social proof. Two of the four are read
 * from the registries they describe, so they cannot drift out of date.
 */
const STATS = [
  { value: String(SECTION_TYPES.length), label: 'Section types' },
  { value: String(OPERATION_NAMES.length), label: 'AI operations' },
  { value: '4', label: 'Pages generated per site' },
  { value: '0 kB', label: 'JavaScript shipped' },
];

export function Stats() {
  return (
    <div className="border-y border-ink-200/70 bg-white">
      <Container>
        <dl className="grid grid-cols-2 divide-ink-200/70 sm:grid-cols-4 sm:divide-x">
          {STATS.map((stat) => (
            <div key={stat.label} className="px-2 py-8 text-center">
              <dt className="sr-only">{stat.label}</dt>
              <dd>
                <span className="block text-3xl font-bold tracking-[-0.03em] text-ink-950 sm:text-4xl">
                  {stat.value}
                </span>
                <span className="mt-1.5 block text-[12px] font-medium uppercase tracking-wider text-ink-400">
                  {stat.label}
                </span>
              </dd>
            </div>
          ))}
        </dl>
      </Container>
    </div>
  );
}
