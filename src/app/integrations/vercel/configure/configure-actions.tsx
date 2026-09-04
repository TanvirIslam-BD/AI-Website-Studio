'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Unlink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { errorMessage } from '@/lib/utils';

/**
 * Disconnecting, from the Configure screen.
 *
 * Worth stating plainly what does and does not happen: the sites are projects
 * in the user's own Vercel account, so they keep serving after the link is
 * cut. Only this studio's ability to publish new versions goes away.
 */
export function ConfigureActions() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function disconnect() {
    if (
      !window.confirm(
        'Disconnect this Vercel account? Sites you already published stay live in that account - only publishing new changes from here stops.',
      )
    ) {
      return;
    }

    setBusy(true);
    setError(null);
    try {
      const response = await fetch('/api/workspace/vercel', { method: 'DELETE' });
      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as { error?: string } | null;
        throw new Error(payload?.error ?? 'Could not disconnect that account.');
      }
      router.refresh();
    } catch (caught) {
      setError(errorMessage(caught));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="border-t border-ink-200 pt-3">
      <Button variant="ghost" size="sm" loading={busy} onClick={() => void disconnect()}>
        <Unlink className="h-3.5 w-3.5" /> Disconnect this account
      </Button>
      {error ? <p className="mt-2 rounded-lg bg-red-50 px-3 py-2 text-[12px] text-red-700">{error}</p> : null}
    </div>
  );
}
