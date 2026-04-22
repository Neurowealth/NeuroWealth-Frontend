"use client";

import { useState, useEffect } from "react";
import { env } from "@/lib/env";

export interface Portfolio {
  balance: number;
  earnings: number;
  apy: number;
  strategy: "conservative" | "balanced" | "growth";
}

export function usePortfolio(address: string | null) {
  const [portfolio, setPortfolio] = useState<Portfolio | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!address || !env.apiUrl) return;

    setLoading(true);
    fetch(`${env.apiUrl}/portfolio/${address}`)
      .then((r) => r.json())
      .then((data) => setPortfolio(data))
      .catch(() => setError("Failed to load portfolio"))
      .finally(() => setLoading(false));
  }, [address]);

  return { portfolio, loading, error };
}
