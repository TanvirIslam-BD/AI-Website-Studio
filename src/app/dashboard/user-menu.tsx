'use client';

import { signOut } from 'next-auth/react';
import { LogOut } from 'lucide-react';

/** Account chip for the dark dashboard header: an initial, the name, and sign out. */
export function UserMenu({ name, email }: { name: string; email: string }) {
  const initial = (name.trim()[0] ?? email[0] ?? '?').toUpperCase();

  return (
    <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] py-1 pl-1 pr-1 sm:pr-1.5">
      <span
        className="grid h-7 w-7 place-items-center rounded-full bg-gradient-to-br from-indigo-400 to-sky-300 text-[12px] font-semibold text-[#07070a]"
        aria-hidden
      >
        {initial}
      </span>
      <div className="hidden text-left sm:block">
        <p className="max-w-[180px] truncate text-[12px] font-medium leading-tight text-white/90">{name}</p>
        <p className="max-w-[180px] truncate text-[11px] leading-tight text-white/40">{email}</p>
      </div>
      <button
        type="button"
        title="Sign out"
        aria-label="Sign out"
        onClick={() => void signOut({ redirectTo: '/' })}
        className="focus-ring grid h-7 w-7 place-items-center rounded-full text-white/55 transition-colors hover:bg-white/10 hover:text-white"
      >
        <LogOut className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
