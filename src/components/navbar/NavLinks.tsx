'use client';

import Link from "next/link";
import { siteNavigationLinks } from "@/lib/routeMetadata";
import { useI18n } from "@/contexts";

type NavLabelKey = "features" | "howItWorks" | "strategies" | "help";

export function NavLinks() {
  const { messages } = useI18n();
  return (
    <div className="hidden md:flex items-center gap-6 text-sm text-slate-400">
      {siteNavigationLinks.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          className="hover:text-white transition-colors"
        >
          {messages.navbar[link.labelKey as NavLabelKey]}
        </Link>
      ))}
    </div>
  );
}

export function NavMobileLinks() {
  const { messages } = useI18n();
  return (
    <>
      {siteNavigationLinks
        .filter((link) => link.mobile)
        .map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="md:hidden text-sm text-slate-400 hover:text-white transition-colors"
          >
            {messages.navbar[link.labelKey as NavLabelKey]}
          </Link>
        ))}
    </>
  );
}
