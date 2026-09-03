'use client';

import { signOut } from 'next-auth/react';
import { LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function UserMenu({ name, email }: { name: string; email: string }) {
  return (
    <div className="flex items-center gap-3">
      <div className="hidden text-right sm:block">
        <p className="text-[13px] font-medium leading-tight text-ink-800">{name}</p>
        <p className="text-[11px] leading-tight text-ink-400">{email}</p>
      </div>
      <Button variant="ghost" size="icon" title="Sign out" onClick={() => void signOut({ redirectTo: '/' })}>
        <LogOut className="h-4 w-4" />
      </Button>
    </div>
  );
}
