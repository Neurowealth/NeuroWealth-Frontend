"use client";

import Link from "next/link";
import { useI18n } from "@/contexts";

export function HomeFooter() {
  const { messages } = useI18n();

  return (
    <footer className="border-t border-gray-800 py-8 text-center text-sm text-slate-600">
      <span>
        &copy; {new Date().getFullYear()} NeuroWealth &middot; {messages.footer.builtOn}
      </span>
      <span className="mx-2">&middot;</span>
      <Link
        href="/docs/tokens"
        className="font-medium text-slate-400 transition hover:text-sky-300"
      >
        {messages.footer.designTokens}
      </Link>
    </footer>
  );
}
