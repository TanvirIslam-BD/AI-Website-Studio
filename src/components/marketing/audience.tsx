import { Briefcase, Building2, PenTool, Rocket, Store } from 'lucide-react';
import { Container } from './shell';

/**
 * Trust strip.
 *
 * States who the product is for rather than inventing social proof. No
 * customer logos and no testimonials appear here, because there are none to
 * show yet and fabricating them would be worse than an honest audience list.
 */
const AUDIENCES = [
  { icon: PenTool, label: 'Freelancers' },
  { icon: Building2, label: 'Agencies' },
  { icon: Rocket, label: 'Founders' },
  { icon: Store, label: 'Small businesses' },
  { icon: Briefcase, label: 'Designers' },
];

export function Audience() {
  return (
    <div className="border-y border-ink-200 bg-white">
      <Container className="py-10">
        <p className="text-center text-[15px] font-medium tracking-[-0.01em] text-ink-800">
          Built for people who need to ship websites, not fight with them.
        </p>
        <ul className="mt-7 flex flex-wrap items-center justify-center gap-x-10 gap-y-4">
          {AUDIENCES.map((audience) => (
            <li key={audience.label} className="flex items-center gap-2 text-[13px] text-ink-500">
              <audience.icon className="h-4 w-4 text-ink-400" strokeWidth={1.7} />
              {audience.label}
            </li>
          ))}
        </ul>
      </Container>
    </div>
  );
}
