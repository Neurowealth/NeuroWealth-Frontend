# Demo seed — deterministic mock data

**Issue:** #420  
**Module:** `src/lib/seeded-rng.ts`  
**Env var:** `NEXT_PUBLIC_DEMO_SEED`

---

## Why this exists

Mock data generated with `Math.random()` changes on every run, making visual
baseline screenshots and demo recordings flaky. The mock modules therefore use
a deterministic PRNG (Mulberry32), so every chart value, allocation amount,
transaction hash, and simulated success/failure outcome is identical across
runs as long as the seed string is the same. The seed is `DEFAULT_SEED`
(`demo-seed-2026`) unless `NEXT_PUBLIC_DEMO_SEED` overrides it.

---

## How it works

`src/lib/seeded-rng.ts` exports three functions used by every mock data module:

| Function | Description |
|----------|-------------|
| `random()` | Returns a float in `[0, 1)` |
| `randomInt(min, max)` | Returns an integer in `[min, max)` |
| `randomItem(array)` | Returns one element from the array |

All three use a Mulberry32 PRNG seeded from a DJB2 hash of a string seed. At
import time that string is `NEXT_PUBLIC_DEMO_SEED` when it is a non-empty
string, and `DEFAULT_SEED` (`demo-seed-2026`) otherwise. **An unset or empty
variable does not switch to `Math.random()`**: the output is still
deterministic, and identical on the server and in the browser. The only way to
get `Math.random()` is `reseed(null)` in code (for example in a test).

The seed is a `NEXT_PUBLIC_*` variable — it is inlined into the browser bundle
at build time by Next.js and is also available as `process.env.NEXT_PUBLIC_DEMO_SEED`
on the server. It contains no secrets.

---

## Enabling the seed

### Local development

Add to `.env.local`:

```bash
NEXT_PUBLIC_DEMO_SEED=demo-seed-2026
```

Then restart the dev server:

```bash
yarn dev
```

### Visual baseline capture

The server must already be running with the seed set before calling the script:

```bash
# Terminal 1
NEXT_PUBLIC_DEMO_SEED=demo-seed-2026 yarn dev

# Terminal 2
yarn qa:visual-baseline
```

The captured `manifest.json` records the `demoSeed` field so baselines are
traceable. If `NEXT_PUBLIC_DEMO_SEED` was unset when the script ran, the
manifest contains `"demoSeed": null` and a warning is printed.

### Reverting to the default seed

Remove the variable or leave it empty to go back to `DEFAULT_SEED`
(`demo-seed-2026`). This does **not** make the data random:

```bash
NEXT_PUBLIC_DEMO_SEED=
```

To get different (but still reproducible) data, set another seed string, for
example `NEXT_PUBLIC_DEMO_SEED=my-other-seed`. To get genuinely random data in
a test, call `reseed(null)`.

---

## Where randomness is consumed

All of these modules route through `seeded-rng` and become deterministic when
the seed is set:

| Module | What it randomises |
|--------|--------------------|
| `src/lib/mock-chart-data.ts` | Portfolio value noise, yield bars, allocation slices, benchmark comparison |
| `src/lib/mock-services.ts` | ~15% simulated failure rate |
| `src/lib/mock-audit.ts` | Audit event IDs |
| `src/lib/transactions.ts` | Transaction reference suffix |
| `src/lib/logger.ts` | Log entry IDs |
| `src/lib/analytics.ts` | Analytics event IDs |
| `src/components/onboarding/steps/WalletConnectStep.tsx` | 90% connection success simulation |
| `src/components/onboarding/steps/FirstDepositStep.tsx` | 95% deposit success simulation |
| `src/components/help/SupportForm.tsx` | Support reference ID suffix |
| `src/components/avatar/FileUpload.tsx` | Upload progress increment steps |
| `src/hooks/useRealtimeStream.ts` | Realtime event intervals, kinds, and simulated values |

> **Note:** `src/lib/mock-auth.ts` is intentionally **not** seeded — it uses
> `crypto.randomUUID()` for secure, unpredictable session tokens and user IDs.
> This is by design: mock-auth tokens remain non-deterministic even when
> `NEXT_PUBLIC_DEMO_SEED` is set.

---

## Sandbox toggle

The QA Sandbox at `/dashboard/sandbox` controls UI state scenarios
(success / empty / loading / partial-failure / timeout) independently of the
seed. The seed only affects *data values*, not *which scenario is shown*.

To combine both for a fully reproducible demo environment:

1. Set `NEXT_PUBLIC_DEMO_SEED=demo-seed-2026` in `.env.local`
2. Restart `yarn dev`
3. Navigate to `/dashboard/sandbox` and select "All Success"
4. Screenshots will now show identical values across repeated captures

---

## Unit tests

`src/lib/seeded-rng.test.ts` verifies:

- Values stay in `[0, 1)` range
- Same seed → identical sequence across two separate calls to `reseed()`
- Different seeds → different sequences
- `reseed(null)` restores non-deterministic behaviour
- An unset or empty `NEXT_PUBLIC_DEMO_SEED` resolves to `DEFAULT_SEED`, and the
  initial sequence after import is deterministic
- `randomInt()` always returns integers in the specified range
- `randomItem()` always returns an element from the input array

Run with:

```bash
yarn test
```

---

## QA steps for PR verification

1. Add `NEXT_PUBLIC_DEMO_SEED=demo-seed-2026` to `.env.local` and start `yarn dev`.
2. Open `/dashboard` — note the portfolio balance and chart values.
3. Hard-refresh the page (`Cmd+Shift+R` / `Ctrl+Shift+R`). Values must be identical.
4. Open `/dashboard/strategy` — APY chart values must be identical across reloads.
5. Open `/dashboard/transactions`, submit a deposit — note the reference ID suffix.
6. Hard-refresh and repeat step 5 — the suffix must match step 5's value.
7. Set `NEXT_PUBLIC_DEMO_SEED=another-seed` in `.env.local`, restart the server, and
   reload the dashboard. Values should differ from those in step 2. Removing the
   variable again returns to the values from step 2, because the default seed is
   `demo-seed-2026`.
8. Run `yarn test` — all `seeded-rng` tests must pass.
