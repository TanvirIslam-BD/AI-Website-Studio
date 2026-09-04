'use client';

import { useState } from 'react';
import type { WorkspacePlan } from '@prisma/client';
import { AlertCircle, Loader2 } from 'lucide-react';
import { Select } from '@/components/ui/field';
import { PLANS, PLAN_ORDER } from '@/lib/billing/plans';
import { errorMessage, formatRelative } from '@/lib/utils';

type Row = {
  id: string;
  name: string;
  slug: string;
  plan: WorkspacePlan;
  planSource: string;
  members: number;
  projects: number;
  creditsUsed: number;
  creditLimit: number;
  periodStart: string | Date;
  createdAt: string | Date;
  ownerEmail: string | null;
};

/**
 * Workspaces, with their plan changeable in place.
 *
 * The plan is the one field worth editing from here, so it is the only one that
 * is editable - a console that can change everything is a console where a
 * mis-click can do anything.
 */
export function WorkspaceTable({ initial }: { initial: Row[] }) {
  const [rows, setRows] = useState(initial);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function changePlan(workspaceId: string, plan: WorkspacePlan) {
    setBusy(workspaceId);
    setError(null);
    try {
      const response = await fetch('/api/admin/workspaces', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ workspaceId, plan }),
      });
      const payload = (await response.json()) as { workspace?: Row; error?: string };
      if (!response.ok || !payload.workspace) throw new Error(payload.error ?? 'Could not change that plan.');

      setRows((current) =>
        current.map((row) =>
          row.id === workspaceId
            ? { ...row, plan, planSource: 'granted', creditLimit: PLANS[plan].credits }
            : row,
        ),
      );
    } catch (caught) {
      setError(errorMessage(caught));
    } finally {
      setBusy(null);
    }
  }

  if (rows.length === 0) {
    return (
      <p className="rounded-xl border border-ink-200 bg-white px-3.5 py-6 text-center text-[13px] text-ink-500">
        No workspaces yet.
      </p>
    );
  }

  return (
    <div>
      <div className="studio-scroll overflow-x-auto rounded-xl border border-ink-200 bg-white">
        <table className="w-full min-w-[720px] text-left">
          <thead>
            <tr className="border-b border-ink-200 text-[11px] uppercase tracking-wide text-ink-500">
              <th className="px-3.5 py-2.5 font-semibold">Workspace</th>
              <th className="px-3.5 py-2.5 font-semibold">Sites</th>
              <th className="px-3.5 py-2.5 font-semibold">Credits</th>
              <th className="px-3.5 py-2.5 font-semibold">Created</th>
              <th className="px-3.5 py-2.5 font-semibold">Plan</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-ink-100">
            {rows.map((row) => (
              <tr key={row.id} className="text-[13px]">
                <td className="max-w-[240px] px-3.5 py-2.5">
                  <p className="truncate font-medium text-ink-900">{row.name}</p>
                  <p className="truncate text-[11px] text-ink-500">{row.ownerEmail ?? row.slug}</p>
                </td>
                <td className="px-3.5 py-2.5 tabular-nums text-ink-700">{row.projects}</td>
                <td className="px-3.5 py-2.5 tabular-nums text-ink-700">
                  {row.creditsUsed}
                  <span className="text-ink-400"> / {row.creditLimit}</span>
                </td>
                <td className="px-3.5 py-2.5 text-[12px] text-ink-500">{formatRelative(row.createdAt)}</td>
                <td className="px-3.5 py-2.5">
                  <span className="flex items-center gap-2">
                    <Select
                      value={row.plan}
                      disabled={busy === row.id}
                      onChange={(event) => void changePlan(row.id, event.target.value as WorkspacePlan)}
                      className="text-[12px]"
                      aria-label={`Plan for ${row.name}`}
                    >
                      {PLAN_ORDER.map((plan) => (
                        <option key={plan} value={plan}>
                          {PLANS[plan].label}
                        </option>
                      ))}
                    </Select>
                    {busy === row.id ? <Loader2 className="h-3.5 w-3.5 animate-spin text-ink-400" /> : null}
                    {row.planSource === 'granted' ? (
                      <span className="shrink-0 rounded border border-ink-200 px-1.5 py-0.5 text-[10px] text-ink-500">
                        granted
                      </span>
                    ) : null}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {error ? (
        <p className="mt-3 flex items-start gap-2 rounded-lg bg-red-50 px-3 py-2 text-[12px] text-red-700">
          <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" /> {error}
        </p>
      ) : null}
    </div>
  );
}
