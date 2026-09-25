/**
 * seeded-rng.ts — Deterministic random number generator
 *
 * Controlled by NEXT_PUBLIC_DEMO_SEED (public env var, safe to expose).
 * When the variable is set, every call to random() / randomInt() /
 * randomItem() produces the same sequence across server and browser,
 * making mock data, chart values, and demo screenshots reproducible.
 *
 * When NEXT_PUBLIC_DEMO_SEED is unset the module falls back to
 * Math.random() so normal development behaviour is unchanged.
 *
 * Algorithm: Mulberry32 — a fast, high-quality 32-bit PRNG seeded
 * from a DJB2-style hash of the string seed value.
 *
 * Usage
 * ─────
 *   import { random, randomInt, randomItem } from "@/lib/seeded-rng";
 *
 *   random()              → number in [0, 1)
 *   randomInt(0, 100)     → integer in [0, 100)
 *   randomItem(["a","b"]) → one element
 *
 * Toggling the seed
 * ─────────────────
 *   # .env.local — stable demo/screenshot output
 *   NEXT_PUBLIC_DEMO_SEED=demo-seed-2026
 *
 *   # Unset or empty — normal random behaviour
 *   NEXT_PUBLIC_DEMO_SEED=
 *
 * Resetting mid-test
 * ──────────────────
 *   import { reseed } from "@/lib/seeded-rng";
 *   reseed("my-test-seed");   // deterministic from this point
 *   reseed(null);             // back to Math.random()
 *
 * Default seed (for contributors)
 * ────────────────────────────────
 *   import { DEFAULT_SEED } from "@/lib/seeded-rng";
 *   console.log(DEFAULT_SEED); // "demo-seed-2026"
 *
 *   All mock modules (mock-services, mock-chart-data, mock-audit, …)
 *   draw from this single PRNG instance. Call reseed(DEFAULT_SEED) to
 *   restore deterministic output after a reseed(null) call.
 */

/** Internal PRNG state — null means "use Math.random()". */
let rng: (() => number) | null = null;

// ─── Mulberry32 algorithm ─────────────────────────────────────────────────────

function mulberry32(seed: number): () => number {
  let s = seed;
  return function () {
    s += 0x6d2b79f5;
    let t = Math.imul(s ^ (s >>> 15), s | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// ─── String → numeric seed (DJB2 hash) ───────────────────────────────────────

function hashSeed(seed: string): number {
  let h = 0;
  for (let i = 0; i < seed.length; i++) {
    h = Math.imul(31, h) + seed.charCodeAt(i);
    h |= 0; // keep 32-bit
  }
  return Math.abs(h);
}

// ─── Default seed ─────────────────────────────────────────────────────────────
// Used by all mock modules so demos and screenshots are reproducible.
// Override with NEXT_PUBLIC_DEMO_SEED in .env.local when needed.

export const DEFAULT_SEED = "demo-seed-2026";

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Re-initialize the PRNG with a new seed string, or pass `null` to
 * revert to Math.random().  Useful in unit tests to get a fresh,
 * predictable sequence without reloading the module.
 */
export function reseed(seed: string | null): void {
  if (seed) {
    rng = mulberry32(hashSeed(seed));
  } else {
    rng = null;
  }
}

/** Returns a pseudo-random number in [0, 1). */
export function random(): number {
  return rng !== null ? rng() : Math.random();
}

/** Returns a pseudo-random integer in [min, max). */
export function randomInt(min: number, max: number): number {
  return Math.floor(random() * (max - min)) + min;
}

/** Returns a random element from `array`. */
export function randomItem<T>(array: T[]): T {
  return array[Math.floor(random() * array.length)];
}

// ─── Module initialisation ────────────────────────────────────────────────────
// Runs once when the module is first imported.
// NEXT_PUBLIC_DEMO_SEED is inlined at build time by Next.js for client
// bundles and available as process.env.NEXT_PUBLIC_DEMO_SEED on the server.

reseed(process.env.NEXT_PUBLIC_DEMO_SEED || DEFAULT_SEED);
