'use client';

import Link from "next/link";
import { useAuth, useI18n } from "@/contexts";
import { Button } from "../ui/Button";

export function NavbarAuthActions() {
  const { user, signOut } = useAuth();
  const { messages } = useI18n();

  if (user) {
    return (
      <div className="flex items-center gap-3 ml-2 pl-4 border-l border-white/10">
        <div className="flex flex-col items-end">
          <span className="text-[10px] text-slate-500 uppercase font-bold leading-none">{messages.navbar.account}</span>
          <span className="text-xs text-white font-medium">{user.displayName}</span>
        </div>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={signOut}
          aria-label={`Sign out of ${user.displayName}'s account`}
          className="min-h-9 rounded-md px-2 py-1 text-xs text-slate-500 hover:text-red-400 hover:bg-white/5 uppercase font-bold"
        >
          {messages.navbar.signOut}
        </Button>
      </div>
    );
  }

  return (
    <Link href="/login">
      <Button variant="secondary" size="sm" className="text-xs h-9">
        {messages.navbar.signIn}
      </Button>
    </Link>
  );
}
