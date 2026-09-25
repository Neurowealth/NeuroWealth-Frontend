'use client';

// Fixes issue 454: responsive navigation variants
import Link from "next/link";
import WalletConnectButton from "./WalletConnectButton";
import { ThemeToggle } from "./ThemeToggle";
import { NotificationToggle } from "./notifications/NotificationToggle";
import { LocaleSwitcher } from "./LocaleSwitcher";
import { NavLinks, NavMobileLinks } from "./navbar/NavLinks";
import { NavWalletStatus } from "./navbar/NavWalletStatus";
import { NavbarSearchBox, NavbarSearchTrigger, NavbarSearchModal } from "./navbar/NavbarSearch";
import { useNavbarSearch } from "./navbar/useNavbarSearch";
import { NavbarAuthActions } from "./navbar/NavbarAuthActions";

export function Navbar() {
  const search = useNavbarSearch();

  return (
    <nav aria-label="Main navigation" className="fixed top-0 left-0 right-0 z-overlay border-b border-white/5 bg-dark-900/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-2 px-4 py-4 sm:px-6 md:gap-4 md:px-8 md:py-5">
        <Link href="/" aria-label="NeuroWealth home" className="flex items-center gap-2 text-lg font-bold text-white">
          <span aria-hidden="true" className="text-brand-400">&#x2B21;</span> NeuroWealth
        </Link>

        <NavLinks />

        <NavbarSearchBox
          isDesktopSearchActive={search.isDesktopSearchActive}
          setIsDesktopSearchActive={search.setIsDesktopSearchActive}
        />

        <div className="ml-auto flex items-center gap-2 sm:gap-3 md:gap-4">
          <NavbarSearchTrigger
            isMobileSearchOpen={search.isMobileSearchOpen}
            setIsMobileSearchOpen={search.setIsMobileSearchOpen}
          />

          <LocaleSwitcher />

          <NavMobileLinks />
          <NavWalletStatus />

          <NotificationToggle />
          <ThemeToggle />
          <WalletConnectButton />

          <NavbarAuthActions />
        </div>
      </div>

      <NavbarSearchModal
        isMobileSearchOpen={search.isMobileSearchOpen}
        setIsMobileSearchOpen={search.setIsMobileSearchOpen}
      />
    </nav>
  );
}
