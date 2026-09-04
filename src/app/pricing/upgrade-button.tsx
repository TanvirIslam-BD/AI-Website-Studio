'use client';

import { useState } from 'react';
import type { WorkspacePlan } from '@prisma/client';
import { Button } from '@/components/ui/button';
import { errorMessage } from '@/lib/utils';

/**
 * Starts an upgrade.
 *
 * Reports what actually happened rather than pretending. Until a payment
 * provider is wired up the endpoint answers 501 with an explanation, and that
 * explanation is what appears here - a button that silently did nothing, or one
 * that granted a paid plan for free, would both be worse.
 */
export function UpgradeButton({ plan, label }: { plan: WorkspacePlan; label: string }) {
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function upgrade() {
    setBusy(true);
    setMessage(null);
    try {
      const response = await fetch('/api/workspace/plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan }),
      });
      const payload = (await response.json()) as { message?: string; error?: string; url?: string };

      // Once a provider is connected it hands back somewhere to go.
      if (response.ok && payload.url) {
        window.location.href = payload.url;
        return;
      }
      setMessage(payload.message ?? payload.error ?? 'Could not start that upgrade.');
    } catch (caught) {
      setMessage(errorMessage(caught));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <Button variant="primary" size="md" className="w-full justify-center" loading={busy} onClick={() => void upgrade()}>
        {label}
      </Button>
      {message ? <p className="mt-2 text-[12px] leading-relaxed text-ink-500">{message}</p> : null}
    </div>
  );
}
