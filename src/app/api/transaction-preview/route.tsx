import React from "react";
import { formatCurrency, formatTimestamp } from "@/lib/formatters";
import {
  buildPreviewSnapshot,
  buildStatusChips,
  getTransactionContext,
} from "@/lib/transactions";
import { parseTransactionPreviewSearchParams } from "@/lib/preview-route-query";
import { ImageResponse } from "next/og";


type ThemeMode = "light" | "dark";

function getThemePalette(theme: ThemeMode) {
  if (theme === "dark") {
    return {
      page: "#020617",
      card: "#0f172a",
      panel: "#111c33",
      border: "#334155",
      text: "#e2e8f0",
      muted: "#94a3b8",
      accent: "#38bdf8",
    };
  }

  return {
    page: "#f8fafc",
    card: "#ffffff",
    panel: "#f8fafc",
    border: "#dbe4ee",
    text: "#0f172a",
    muted: "#94a3b8",
    accent: "#38bdf8",
  };
}

function getToneColor(tone: "success" | "warning" | "error") {
  if (tone === "success") {
    return "#10b981";
  }

  if (tone === "warning") {
    return "#f59e0b";
  }

  return "#ef4444";
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const { theme, kind, preview } =
    parseTransactionPreviewSearchParams(searchParams);
  const palette = getThemePalette(theme);
  const context = getTransactionContext(kind);
  const snapshot = buildPreviewSnapshot(kind, preview);
  const chips = buildStatusChips(kind, snapshot.form);

  const imageResponse = new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        background: palette.page,
        color: palette.text,
        padding: 42,
        fontFamily: "Inter, sans-serif",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 22,
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              fontSize: 18,
              color: palette.muted,
              textTransform: "uppercase",
              letterSpacing: 2,
            }}
          >
            <div
              style={{
                width: 10,
                height: 10,
                borderRadius: 999,
                background: palette.accent,
              }}
            />
            Transaction flow preview
          </div>
          <div style={{ fontSize: 48, fontWeight: 700, lineHeight: 1 }}>
            {context.title}
          </div>
          <div style={{ fontSize: 18, color: palette.muted }}>
            {kind === "deposit" ? "Deposit" : "Withdrawal"} · {preview}
          </div>
        </div>

        <div
          style={{
            padding: "12px 18px",
            borderRadius: 999,
            border: `1px solid ${palette.border}`,
            background: palette.card,
            color: palette.muted,
            fontSize: 20,
          }}
        >
          {theme === "dark" ? "Dark mode" : "Light mode"}
        </div>
      </div>

      <div style={{ display: "flex", gap: 18, marginBottom: 18 }}>
        {chips.map((chip) => (
          <div
            key={chip.label}
            style={{
              minWidth: 40,
              minHeight: 40,
              display: "flex",
              alignItems: "center",
              gap: 10,
              padding: "0 14px",
              borderRadius: 999,
              border: `1px solid ${getToneColor(chip.tone)}`,
              color: getToneColor(chip.tone),
              fontSize: 16,
              fontWeight: 700,
            }}
          >
            <div
              style={{
                width: 8,
                height: 8,
                borderRadius: 999,
                background: getToneColor(chip.tone),
              }}
            />
            {chip.label}
          </div>
        ))}
      </div>

      <div style={{ display: "flex", gap: 18, flex: 1 }}>
        <div
          style={{
            flex: 1.15,
            display: "flex",
            flexDirection: "column",
            gap: 18,
            borderRadius: 28,
            border: `1px solid ${palette.border}`,
            background: palette.card,
            padding: 26,
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <div style={{ fontSize: 26, fontWeight: 700 }}>Primary surface</div>
            <div style={{ fontSize: 16, color: palette.muted }}>
              {context.intro}
            </div>
          </div>

          {snapshot.stage === "form" ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 8,
                  padding: 18,
                  borderRadius: 18,
                  border: `1px solid ${palette.border}`,
                  background: palette.panel,
                }}
              >
                <div style={{ fontSize: 16, fontWeight: 700 }}>
                  {context.amountLabel}
                </div>
                <div
                  style={{
                    minHeight: 52,
                    display: "flex",
                    alignItems: "center",
                    borderRadius: 8,
                    border: `1px solid ${snapshot.fieldErrors.amount ? "#ef4444" : palette.border}`,
                    padding: "0 16px",
                    fontSize: 22,
                    fontFamily: '"SFMono-Regular", Menlo, monospace',
                  }}
                >
                  {snapshot.form.amount || "0.00"}
                </div>
                <div
                  style={{
                    fontSize: 15,
                    color: snapshot.fieldErrors.amount
                      ? "#ef4444"
                      : palette.muted,
                  }}
                >
                  {snapshot.fieldErrors.amount ?? context.amountHint}
                </div>
              </div>

              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 8,
                  padding: 18,
                  borderRadius: 18,
                  border: `1px solid ${palette.border}`,
                  background: palette.panel,
                }}
              >
                <div style={{ fontSize: 16, fontWeight: 700 }}>
                  {context.walletLabel}
                </div>
                <div
                  style={{
                    minHeight: 52,
                    display: "flex",
                    alignItems: "center",
                    borderRadius: 8,
                    border: `1px solid ${
                      snapshot.fieldErrors.walletAddress ||
                      snapshot.fieldErrors.walletConnected
                        ? "#ef4444"
                        : palette.border
                    }`,
                    padding: "0 16px",
                    fontSize: 17,
                    color: palette.text,
                  }}
                >
                  {kind === "deposit"
                    ? context.connectedWalletAddress
                    : snapshot.form.walletAddress}
                </div>
                <div
                  style={{
                    fontSize: 15,
                    color:
                      snapshot.fieldErrors.walletAddress ||
                      snapshot.fieldErrors.walletConnected
                        ? "#ef4444"
                        : palette.muted,
                  }}
                >
                  {snapshot.fieldErrors.walletAddress ??
                    snapshot.fieldErrors.walletConnected ??
                    context.walletHint}
                </div>
              </div>
            </div>
          ) : null}

          {snapshot.stage === "confirm" && snapshot.quote ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 8,
                  padding: 22,
                  borderRadius: 22,
                  border: `1px solid ${palette.border}`,
                  background: palette.panel,
                }}
              >
                <div
                  style={{
                    fontSize: 42,
                    fontWeight: 700,
                    lineHeight: 1,
                    fontFamily: '"SFMono-Regular", Menlo, monospace',
                  }}
                >
                  {formatCurrency(snapshot.quote.amount)}
                </div>
                <div style={{ fontSize: 17, color: palette.muted }}>
                  Amount confirmed for review
                </div>
              </div>

              <div
                style={{ display: "flex", flexDirection: "column", gap: 12 }}
              >
                {[
                  ["Fees", formatCurrency(snapshot.quote.fee)],
                  [
                    kind === "deposit" ? "Total debit" : "Net destination",
                    formatCurrency(
                      kind === "deposit"
                        ? snapshot.quote.totalDebit
                        : snapshot.quote.netAmount,
                    ),
                  ],
                  ["Reference", snapshot.quote.reference],
                ].map(([label, value]) => (
                  <div
                    key={label}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      gap: 12,
                      paddingBottom: 12,
                      borderBottom: `1px solid ${palette.border}`,
                    }}
                  >
                    <div style={{ color: palette.muted }}>{label}</div>
                    <div
                      style={{
                        fontWeight: 700,
                        fontFamily:
                          label === "Reference"
                            ? '"SFMono-Regular", Menlo, monospace'
                            : "Inter, sans-serif",
                      }}
                    >
                      {value}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : null}

          {snapshot.stage === "pending" && snapshot.pending ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
                <div
                  style={{
                    width: 56,
                    height: 56,
                    borderRadius: 999,
                    border: "4px solid rgba(56, 189, 248, 0.18)",
                    borderTopColor: "#38bdf8",
                  }}
                />
                <div
                  style={{ display: "flex", flexDirection: "column", gap: 6 }}
                >
                  <div style={{ fontSize: 24, fontWeight: 700 }}>
                    {snapshot.pending.statusLabel}
                  </div>
                  <div style={{ fontSize: 16, color: palette.muted }}>
                    {snapshot.pending.message}
                  </div>
                </div>
              </div>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 8,
                  padding: 18,
                  borderRadius: 18,
                  border: `1px dashed ${palette.border}`,
                  background: palette.panel,
                }}
              >
                <div
                  style={{
                    fontSize: 15,
                    color: palette.muted,
                    textTransform: "uppercase",
                    letterSpacing: 1,
                  }}
                >
                  Reference
                </div>
                <div
                  style={{
                    fontSize: 22,
                    fontWeight: 700,
                    fontFamily: '"SFMono-Regular", Menlo, monospace',
                  }}
                >
                  {snapshot.pending.reference}
                </div>
              </div>
            </div>
          ) : null}

          {(snapshot.stage === "success" || snapshot.stage === "failure") &&
          snapshot.receipt ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 8,
                  padding: 20,
                  borderRadius: 20,
                  border: `1px solid ${snapshot.receipt.status === "success" ? "#10b981" : "#ef4444"}`,
                  background: palette.panel,
                }}
              >
                <div
                  style={{
                    fontSize: 18,
                    fontWeight: 700,
                    color:
                      snapshot.receipt.status === "success"
                        ? "#10b981"
                        : "#ef4444",
                  }}
                >
                  {snapshot.receipt.status === "success"
                    ? "Success receipt"
                    : "Failure state"}
                </div>
                <div style={{ fontSize: 26, fontWeight: 700 }}>
                  {snapshot.receipt.message}
                </div>
                <div style={{ fontSize: 16, color: palette.muted }}>
                  {snapshot.receipt.failureReason ??
                    "Transaction reference and amount are preserved for follow-up."}
                </div>
              </div>

              <div
                style={{ display: "flex", flexDirection: "column", gap: 12 }}
              >
                {[
                  ["Reference", snapshot.receipt.reference],
                  ["Amount", formatCurrency(snapshot.receipt.quote.amount)],
                  ["Fees", formatCurrency(snapshot.receipt.quote.fee)],
                  ["Settled", formatTimestamp(snapshot.receipt.settledAt)],
                ].map(([label, value]) => (
                  <div
                    key={label}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      gap: 12,
                      paddingBottom: 12,
                      borderBottom: `1px solid ${palette.border}`,
                    }}
                  >
                    <div style={{ color: palette.muted }}>{label}</div>
                    <div
                      style={{
                        fontWeight: 700,
                        fontFamily:
                          label === "Reference"
                            ? '"SFMono-Regular", Menlo, monospace'
                            : "Inter, sans-serif",
                      }}
                    >
                      {value}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : null}
        </div>

        <div
          style={{
            width: 420,
            display: "flex",
            flexDirection: "column",
            gap: 18,
            borderRadius: 28,
            border: `1px solid ${palette.border}`,
            background: palette.card,
            padding: 24,
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <div style={{ fontSize: 24, fontWeight: 700 }}>
              Validation details
            </div>
            <div style={{ fontSize: 16, color: palette.muted }}>
              Clear amount, wallet, and lifecycle messaging for the current
              preview state.
            </div>
          </div>

          {[
            ["Available balance", formatCurrency(context.availableAmount)],
            ["Minimum amount", formatCurrency(context.minAmount)],
            ["Fees", formatCurrency(context.fee)],
            ["Strategy", context.strategyLabel],
            ["Connected wallet", context.connectedWalletAddress],
          ].map(([label, value]) => (
            <div
              key={label}
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 4,
                paddingBottom: 12,
                borderBottom: `1px solid ${palette.border}`,
              }}
            >
              <div
                style={{
                  fontSize: 14,
                  color: palette.muted,
                  textTransform: "uppercase",
                  letterSpacing: 1,
                }}
              >
                {label}
              </div>
              <div
                style={{
                  fontSize: 17,
                  fontWeight: 700,
                  fontFamily:
                    label === "Connected wallet"
                      ? '"SFMono-Regular", Menlo, monospace'
                      : "Inter, sans-serif",
                }}
              >
                {value}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>,
    {
      width: 1600,
      height: 1000,
    },
  );

  // Add cache headers to avoid regenerating images on every request
  imageResponse.headers.set(
    "Cache-Control",
    "public, s-maxage=86400, max-age=3600"
  );

  return imageResponse;
}
