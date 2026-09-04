import type { ReactNode } from 'react';
import { Logo } from '@/components/brand/logo';

/**
 * Chrome for the integration install and configure screens.
 *
 * Deliberately has no navigation. Vercel opens these in a popup, and the
 * integration review guidelines ask that a user cannot wander out of the
 * install flow part-way through - so the logo is inert rather than a link home,
 * and there is no footer to click away into. A single card, one job, one exit.
 */
export function IntegrationShell({ children }: { children: ReactNode }) {
  return (
    <main className="grid min-h-screen place-items-center bg-ink-50 px-4 py-10">
      <div className="w-full max-w-xl">
        <div className="mb-5 flex justify-center">
          <Logo size={26} />
        </div>
        <div className="rounded-2xl border border-ink-200 bg-white p-5 shadow-panel sm:p-6">{children}</div>
      </div>
    </main>
  );
}
