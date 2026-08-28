import React from "react";
import {
  formatCurrency,
  formatPercent,
  formatSignedCurrency,
  formatSignedPercent,
} from "@/lib/formatters";
import { buildScenarioPayload } from "@/lib/portfolio";
import { parseWidgetPreviewSearchParams } from "@/lib/preview-route-query";
import { ImageResponse } from "next/og";


type ThemeMode = "light" | "dark";

function getThemePalette(theme: ThemeMode) {
  if (theme === "dark") {
    return {
      page: "#020617",
      surface: "#0f172a",
      card: "#111c33",
      border: "#334155",
      text: "#e2e8f0",
      muted: "#94a3b8",
      highlight: "#0f766e",
      accent: "#38bdf8",
    };
  }

  return {
    page: "#f8fafc",
    surface: "#ffffff",
    card: "#ffffff",
    border: "#dbe4ee",
    text: "#0f172a",
    muted: "#94a3b8",
    highlight: "#0f766e",
    accent: "#38bdf8",
  };
}

function getToneColor(value: number) {
  if (value > 0) {
    return "#10b981";
  }

  if (value < 0) {
    return "#ef4444";
  }

  return "#94a3b8";
}

function chartColor(index: number) {
  const colors = ["#0f766e", "#38bdf8", "#f59e0b", "#64748b"];
  return colors[index] ?? "#94a3b8";
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const { theme } = parseWidgetPreviewSearchParams(searchParams);
  const palette = getThemePalette(theme);
  const portfolio = buildScenarioPayload("live", {
    source: "demo",
    notice: null,
  });

  const imageResponse = new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        background: palette.page,
        color: palette.text,
        padding: 44,
        fontFamily: "Inter, sans-serif",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 28,
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
                background: palette.highlight,
              }}
            />
            Portfolio widgets
          </div>
          <div style={{ fontSize: 52, fontWeight: 700, lineHeight: 1 }}>
            NeuroWealth overview
          </div>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            padding: "14px 18px",
            borderRadius: 999,
            border: `1px solid ${palette.border}`,
            background: palette.surface,
            fontSize: 20,
            color: palette.muted,
          }}
        >
          {theme === "dark" ? "Dark mode" : "Light mode"}
        </div>
      </div>

      <div
        style={{
          display: "flex",
          gap: 18,
          marginBottom: 18,
        }}
      >
        {[
          {
            label: "Total balance",
            value: formatCurrency(portfolio.summary.totalBalance),
            helper: "Across active positions and protected reserve holdings.",
            tone: palette.text,
          },
          {
            label: "Total yield",
            value: formatSignedCurrency(portfolio.summary.totalYield),
            helper: "Net earnings since your first deployed deposit.",
            tone: getToneColor(portfolio.summary.totalYield),
          },
          {
            label: "APY",
            value: formatPercent(portfolio.summary.apy),
            helper: "Weighted live rate across the current strategy mix.",
            tone: getToneColor(portfolio.summary.apy),
          },
          {
            label: "Strategy",
            value: portfolio.summary.strategyLabel,
            helper: portfolio.summary.strategyDescription,
            tone: palette.text,
            mono: false,
          },
        ].map((card) => (
          <div
            key={card.label}
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              gap: 18,
              borderRadius: 28,
              border: `1px solid ${palette.border}`,
              background: palette.card,
              padding: 24,
              boxShadow:
                theme === "dark"
                  ? "0 18px 40px rgba(2, 6, 23, 0.32)"
                  : "0 18px 40px rgba(15, 23, 42, 0.08)",
            }}
          >
            <div style={{ fontSize: 18, fontWeight: 600 }}>{card.label}</div>
            <div
              style={{
                fontSize: 38,
                fontWeight: 700,
                lineHeight: 1,
                color: card.tone,
                fontFamily:
                  card.mono === false
                    ? "Inter, sans-serif"
                    : '"SFMono-Regular", Menlo, monospace',
              }}
            >
              {card.value}
            </div>
            <div
              style={{
                fontSize: 16,
                lineHeight: 1.5,
                color: "#94a3b8",
                minHeight: 48,
              }}
            >
              {card.helper}
            </div>
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
            padding: 24,
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <div style={{ fontSize: 24, fontWeight: 700 }}>
                Asset allocation
              </div>
              <div style={{ fontSize: 16, color: palette.muted }}>
                Visible deployment mix across strategy buckets and reserve
                capital.
              </div>
            </div>
            <div
              style={{
                padding: "10px 14px",
                borderRadius: 999,
                border: `1px solid ${palette.border}`,
                color: palette.muted,
                fontSize: 16,
              }}
            >
              {portfolio.allocation.length} allocation lines
            </div>
          </div>

          <div
            style={{ display: "flex", gap: 22, alignItems: "stretch", flex: 1 }}
          >
            <div
              style={{
                width: 260,
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                gap: 14,
                padding: 24,
                borderRadius: 24,
                background: palette.surface,
                border: `1px solid ${palette.border}`,
              }}
            >
              <div
                style={{
                  fontSize: 14,
                  color: palette.muted,
                  textTransform: "uppercase",
                  letterSpacing: 2,
                }}
              >
                Allocated
              </div>
              <div
                style={{
                  fontSize: 30,
                  fontWeight: 700,
                  fontFamily: '"SFMono-Regular", Menlo, monospace',
                }}
              >
                {formatCurrency(portfolio.summary.totalBalance)}
              </div>
              <div
                style={{ display: "flex", flexDirection: "column", gap: 10 }}
              >
                {portfolio.allocation.map((item, index) => (
                  <div
                    key={item.id}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                    }}
                  >
                    <div
                      style={{
                        width: `${item.share * 1.6}%`,
                        minWidth: 18,
                        height: 12,
                        borderRadius: 999,
                        background: chartColor(index),
                      }}
                    />
                    <div style={{ fontSize: 14, color: palette.muted }}>
                      {formatPercent(item.share)}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", flex: 1 }}>
              {portfolio.allocation.map((item, index) => (
                <div
                  key={item.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "18px 0",
                    borderBottom:
                      index === portfolio.allocation.length - 1
                        ? "0"
                        : `1px solid ${palette.border}`,
                  }}
                >
                  <div
                    style={{ display: "flex", alignItems: "center", gap: 14 }}
                  >
                    <div
                      style={{
                        width: 12,
                        height: 12,
                        borderRadius: 999,
                        background: chartColor(index),
                      }}
                    />
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 4,
                      }}
                    >
                      <div style={{ fontSize: 18, fontWeight: 600 }}>
                        {item.label}
                      </div>
                      <div style={{ fontSize: 15, color: palette.muted }}>
                        {item.symbol}
                      </div>
                    </div>
                  </div>
                  <div
                    style={{ display: "flex", alignItems: "center", gap: 24 }}
                  >
                    <div
                      style={{
                        fontSize: 17,
                        color: palette.muted,
                        fontFamily: '"SFMono-Regular", Menlo, monospace',
                      }}
                    >
                      {formatPercent(item.share)}
                    </div>
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "flex-end",
                        gap: 4,
                      }}
                    >
                      <div
                        style={{
                          fontSize: 17,
                          fontFamily: '"SFMono-Regular", Menlo, monospace',
                        }}
                      >
                        {formatCurrency(item.amount)}
                      </div>
                      <div
                        style={{
                          fontSize: 15,
                          color: getToneColor(item.change),
                        }}
                      >
                        {formatSignedPercent(item.change)}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div
          style={{
            width: 520,
            display: "flex",
            flexDirection: "column",
            gap: 18,
            borderRadius: 28,
            border: `1px solid ${palette.border}`,
            background: palette.card,
            padding: 24,
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <div style={{ fontSize: 24, fontWeight: 700 }}>
                Recent activity
              </div>
              <div style={{ fontSize: 16, color: palette.muted }}>
                Latest deposits, yield events, rebalances, and scheduled cash
                flows.
              </div>
            </div>
            <div
              style={{
                padding: "10px 14px",
                borderRadius: 999,
                border: `1px solid ${palette.border}`,
                color: palette.muted,
                fontSize: 16,
              }}
            >
              {portfolio.activity.length} events
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", flex: 1 }}>
            {portfolio.activity.map((item, index) => (
              <div
                key={item.id}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  gap: 14,
                  padding: "18px 0",
                  borderBottom:
                    index === portfolio.activity.length - 1
                      ? "0"
                      : `1px solid ${palette.border}`,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 8,
                    maxWidth: 320,
                  }}
                >
                  <div
                    style={{ display: "flex", alignItems: "center", gap: 10 }}
                  >
                    <div style={{ fontSize: 18, fontWeight: 600 }}>
                      {item.title}
                    </div>
                    <div
                      style={{
                        padding: "6px 10px",
                        borderRadius: 999,
                        background: palette.surface,
                        fontSize: 13,
                        textTransform: "capitalize",
                        color:
                          item.status === "completed"
                            ? "#10b981"
                            : item.status === "pending"
                              ? "#f59e0b"
                              : "#94a3b8",
                      }}
                    >
                      {item.status}
                    </div>
                  </div>
                  <div
                    style={{
                      fontSize: 15,
                      lineHeight: 1.5,
                      color: palette.muted,
                    }}
                  >
                    {item.detail}
                  </div>
                </div>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "flex-end",
                    gap: 8,
                  }}
                >
                  <div
                    style={{
                      fontSize: 18,
                      fontWeight: 700,
                      color: getToneColor(item.amount ?? 0),
                      fontFamily: '"SFMono-Regular", Menlo, monospace',
                    }}
                  >
                    {item.amount == null
                      ? "No amount"
                      : formatSignedCurrency(item.amount)}
                  </div>
                  <div style={{ fontSize: 14, color: palette.muted }}>
                    {item.occurredAt.slice(0, 16)} UTC
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>,
    {
      width: 1600,
      height: 1080,
    },
  );

  // Add cache headers to match transaction-preview (1-day CDN / 1-hour browser)
  imageResponse.headers.set(
    "Cache-Control",
    "public, s-maxage=86400, max-age=3600"
  );

  return imageResponse;
}
