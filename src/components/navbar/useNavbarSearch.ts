'use client';

import { useEffect, useState } from "react";

export function useNavbarSearch() {
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const [isDesktopSearchActive, setIsDesktopSearchActive] = useState(false);

  useEffect(() => {
    if (!isMobileSearchOpen) return;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMobileSearchOpen]);

  return {
    isMobileSearchOpen,
    setIsMobileSearchOpen,
    isDesktopSearchActive,
    setIsDesktopSearchActive,
  };
}

export type NavbarSearchState = ReturnType<typeof useNavbarSearch>;
