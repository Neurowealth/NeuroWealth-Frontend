"use client";

import { startTransition, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import styles from "./portfolio-dashboard.module.css";
import {
  ActivityItem,
  AllocationItem,
  ChartTone,
  PortfolioPayload,
  PortfolioScenario,
  parseScenario,
} from "@/lib/portfolio";
import {
  formatCurrency,
  formatPercent,
  formatSignedCurrency,
  formatSignedPercent,
  formatSyncLabel,
  formatTimestamp,
} from "@/lib/formatters";
import { useSandbox, ScenarioType } from "@/contexts/SandboxContext";

type ThemeMode = "light" | "dark";

function getTheme(searchParams: Pick<URLSearchParams, "get">): ThemeMode {
  return searchParams.get("theme") === "dark" ? "dark" : "light";
}

interface EmptyStateProps {
  icon: React.ReactNode;
  copy: string;
  cta: string;
  onAction: () => void;
}

interface MetricCardProps {
  label: string;
  value: string;
  helper: string;
  tone: "default" | "positive" | "negative" | "neutral";
  mono?: boolean;
}

const toneMap: Record<ChartTone, string> = {
  primary: "var(--chart-primary)",
  accent: "var(--chart-accent)",
  warning: "var(--chart-warning)",
  "neutral-strong": "var(--chart-neutral-strong)",
  "neutral-soft": "var(--chart-neutral-soft)",
};

const activityLabels: Record<ActivityItem["kind"], string> = {
  deposit: "Deposit",
  yield: "Yield",
  rebalance: "Rebalance",
  withdrawal: "Withdrawal",
};

function MetricCard({
  helper,
  label,
  mono = false,
  tone,
  value,
}: MetricCardProps) {
  const toneClassName =
    tone === "positive"
      ? styles.valuePositive
      : tone === "negative"
        ? styles.valueNegative
        : tone === "neutral"
          ? styles.valueNeutral
          : styles.valueDefault;

  return (
    <article className={`${styles.card} ${styles.metricCard}`}>
      <p className={styles.metricLabel}>{label}</p>
      <p
        className={[
          styles.metricValue,
          toneClassName,
          mono ? styles.metricValueMono : "",
        ].join(" ")}
      >
        {value}
      </p>
      <p className={styles.helperText}>{helper}</p>
    </article>
  );
}

function EmptyState({ copy, cta, icon, onAction }: EmptyStateProps) {
  return (
    <div className={styles.emptyState}>
      <div className={styles.emptyIcon}>{icon}</div>
      <p className={styles.emptyCopy}>{copy}</p>
      <button className={styles.emptyButton} onClick={onAction} type="button">
        {cta}
      </button>
    </div>
  );
}

function getScenario(
  searchParams: Pick<URLSearchParams, "get">,
  sandboxScenario?: PortfolioScenario,
): PortfolioScenario {
  const urlScenario = searchParams.get("scenario");
  if (sandboxScenario && process.env.NODE_ENV === "development") {
    return sandboxScenario;
  }
  return parseScenario(urlScenario);
}

function mapScenarioTypeToPortfolio(scenario: ScenarioType): PortfolioScenario {
  return scenario === "success" ? "live" : scenario;
}

function getValueTone(value: number): "positive" | "negative" | "neutral" {
  if (value > 0) {
    return "positive";
  }

  if (value < 0) {
    return "negative";
  }

  return "neutral";
}

function buildDonutBackground(allocation: AllocationItem[]): string {
  let start = 0;

  const segments = allocation.map((item) => {
    const end = start + item.share;
    const segment = `${toneMap[item.tone]} ${start}% ${end}%`;
    start = end;
    return segment;
  });

  return `conic-gradient(${segments.join(", ")})`;
}

function renderActivityIcon(kind: ActivityItem["kind"]) {
  switch (kind) {
    case "deposit":
      return <ArrowDownIcon />;
    case "withdrawal":
      return <ArrowUpIcon />;
    case "rebalance":
      return <ShuffleIcon />;
    default:
      return <SparkIcon />;
  }
}

function renderSourceLabel(source: PortfolioPayload["source"]) {
  if (source === "api") {
    return "Live backend";
  }

  if (source === "fallback") {
    return "Fallback demo";
  }

  return "Preview data";
}

function SummarySkeleton() {
  return (
    <>
      {Array.from({ length: 4 }).map((_, index) => (
        <article
          className={`${styles.card} ${styles.metricCard} ${styles.skeletonCard}`}
          key={index}
        >
          <span className={styles.skeletonLine} />
          <span className={styles.skeletonValue} />
          <span className={`${styles.skeletonLine} ${styles.skeletonCopy}`} />
        </article>
      ))}
    </>
  );
}

export function PortfolioDashboard() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { getCurrentScenario, isSandboxMode } = useSandbox();
  const [portfolio, setPortfolio] = useState<PortfolioPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const theme = getTheme(searchParams);
  const scenario = getScenario(searchParams, mapScenarioTypeToPortfolio(getCurrentScenario("portfolio")));

  useEffect(() => {
    const controller = new AbortController();

    async function loadPortfolio() {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(`/api/portfolio?scenario=${scenario}`, {
          cache: "no-store",
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error(
            `Unable to load portfolio widgets (${response.status})`,
          );
        }

        const payload = (await response.json()) as PortfolioPayload;
        setPortfolio(payload);
      } catch (loadError) {
        if (controller.signal.aborted) {
          return;
        }

        const message =
          loadError instanceof Error
            ? loadError.message
            : "Unable to load portfolio widgets.";

        setError(message);
        setPortfolio(null);
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    void loadPortfolio();

    return () => controller.abort();
  }, [scenario]);

  function updateParam(key: "scenario" | "theme", value: string) {
    const nextParams = new URLSearchParams(searchParams.toString());
    nextParams.set(key, value);

    startTransition(() => {
      router.replace(`/dashboard?${nextParams.toString()}`, { scroll: false });
    });
  }

  function resetToLivePreview() {
    updateParam("scenario", "live");
  }

  const summaryCards = portfolio
    ? [
        {
          label: "Total balance",
          value: formatCurrency(portfolio.summary.totalBalance),
          helper: "Across active positions and protected reserve holdings.",
          tone: "default" as const,
          mono: true,
        },
        {
          label: "Total yield",
          value: formatSignedCurrency(portfolio.summary.totalYield),
          helper: "Net earnings since your first deployed deposit.",
          tone: getValueTone(portfolio.summary.totalYield),
          mono: true,
        },
        {
          label: "APY",
          value: formatPercent(portfolio.summary.apy),
          helper: "Weighted live rate across the current strategy mix.",
          tone: getValueTone(portfolio.summary.apy),
          mono: true,
        },
        {
          label: "Strategy",
          value: portfolio.summary.strategyLabel,
          helper: portfolio.summary.strategyDescription,
          tone: "default" as const,
        },
      ]
    : [];

  return (
    <main className={styles.page}>
      <section className={styles.shell} data-theme={theme}>
        <div className={styles.content}>
          <div className={styles.topbar}>
            <div>
              <span className={styles.eyebrow}>
                <span className={styles.eyebrowDot} />
                Portfolio widgets
              </span>
              <h1 className={styles.heading}>NeuroWealth overview</h1>
              <p className={styles.subheading}>
                Total balance, yield, APY, strategy, allocation, and recent
                activity in a single review surface with measurable light and
                dark theme parity.
              </p>
            </div>

            <div className={styles.controls}>
              <div className={styles.controlCard}>
                <p className={styles.controlLabel}>Theme preview</p>
                <div className={styles.segmentGroup}>
                  {(["light", "dark"] as const).map((option) => (
                    <button
                      className={[
                        styles.segmentButton,
                        theme === option ? styles.segmentButtonActive : "",
                      ].join(" ")}
                      key={option}
                      onClick={() => updateParam("theme", option)}
                      type="button"
                    >
                      {option === "light" ? "Light mode" : "Dark mode"}
                    </button>
                  ))}
                </div>
              </div>

              <div className={styles.controlCard}>
                <p className={styles.controlLabel}>Scenario preview</p>
                <div className={styles.segmentGroup}>
                  {(
                    [
                      { label: "Live widgets", value: "live" },
                      { label: "Empty states", value: "empty" },
                    ] as const
                  ).map((option) => (
                    <button
                      className={[
                        styles.segmentButton,
                        scenario === option.value
                          ? styles.segmentButtonActive
                          : "",
                      ].join(" ")}
                      key={option.value}
                      onClick={() => updateParam("scenario", option.value)}
                      type="button"
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className={styles.banner}>
            <div className={styles.bannerText}>
              <span className={styles.bannerTitle}>
                {portfolio?.notice ?? "Loading portfolio widget state..."}
              </span>
              <span className={styles.bannerMeta}>
                {portfolio
                  ? formatSyncLabel(portfolio.updatedAt)
                  : "Syncing portfolio data"}
              </span>
            </div>

            <div className={styles.bannerChips}>
              {isSandboxMode && (
                <span className={styles.chip} style={{ backgroundColor: "#10b981", color: "white" }}>
                  Sandbox: {scenario}
                </span>
              )}
              <span className={styles.chip}>Theme: {theme}</span>
              <span className={styles.chip}>
                Source:{" "}
                {portfolio ? renderSourceLabel(portfolio.source) : "Loading"}
              </span>
            </div>
          </div>

          {error && !portfolio ? (
            <div className={`${styles.card} ${styles.errorState}`}>
              <h2 className={styles.errorTitle}>
                Portfolio widgets unavailable
              </h2>
              <p className={styles.errorCopy}>
                {error} The dashboard can retry once connectivity to the
                portfolio API is restored.
              </p>
              <button
                className={styles.emptyButton}
                onClick={resetToLivePreview}
                type="button"
              >
                Retry widgets
              </button>
            </div>
          ) : (
            <>
              <div className={styles.summaryGrid}>
                {loading ? (
                  <SummarySkeleton />
                ) : (
                  summaryCards.map((card) => (
                    <MetricCard {...card} key={card.label} />
                  ))
                )}
              </div>

              <div className={styles.contentGrid}>
                <article className={`${styles.card} ${styles.panel}`}>
                  <header className={styles.panelHeader}>
                    <div>
                      <h2 className={styles.panelTitle}>Asset allocation</h2>
                      <p className={styles.panelMeta}>
                        Visible deployment mix across strategy buckets and
                        reserve capital.
                      </p>
                    </div>
                    {!loading && portfolio ? (
                      <span className={styles.chip}>
                        {portfolio.allocation.length} allocation
                        {portfolio.allocation.length === 1 ? " line" : " lines"}
                      </span>
                    ) : null}
                  </header>

                  {loading ? (
                    <div className={styles.emptyState}>
                      <span className={styles.skeletonValue} />
                      <span
                        className={`${styles.skeletonLine} ${styles.skeletonCopy}`}
                      />
                    </div>
                  ) : portfolio && portfolio.allocation.length > 0 ? (
                    <div className={styles.allocationLayout}>
                      <div
                        className={styles.donut}
                        style={{
                          background: buildDonutBackground(
                            portfolio.allocation,
                          ),
                        }}
                      >
                        <div className={styles.donutInner}>
                          <span className={styles.donutLabel}>Allocated</span>
                          <p className={styles.donutValue}>
                            {formatCurrency(portfolio.summary.totalBalance)}
                          </p>
                        </div>
                      </div>

                      <div className={styles.allocationList}>
                        {portfolio.allocation.map((item) => {
                          const changeTone = getValueTone(item.change);
                          const changeClassName =
                            changeTone === "positive"
                              ? styles.valuePositive
                              : changeTone === "negative"
                                ? styles.valueNegative
                                : styles.valueNeutral;

                          return (
                            <div className={styles.allocationRow} key={item.id}>
                              <div className={styles.allocationIdentity}>
                                <span
                                  className={styles.allocationDot}
                                  style={{ background: toneMap[item.tone] }}
                                />
                                <div>
                                  <p className={styles.allocationName}>
                                    {item.label}
                                  </p>
                                  <p className={styles.allocationSymbol}>
                                    {item.symbol}
                                  </p>
                                </div>
                              </div>
                              <span className={styles.allocationShare}>
                                {formatPercent(item.share)}
                              </span>
                              <div className={styles.allocationValueWrap}>
                                <span className={styles.allocationAmount}>
                                  {formatCurrency(item.amount)}
                                </span>
                                <span
                                  className={`${styles.allocationChange} ${changeClassName}`}
                                >
                                  {formatSignedPercent(item.change)}
                                </span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ) : (
                    <EmptyState
                      copy="No allocation yet. Add a deposit to see deployed positions and reserve coverage."
                      cta="Load sample data"
                      icon={<PieIcon />}
                      onAction={resetToLivePreview}
                    />
                  )}
                </article>

                <article className={`${styles.card} ${styles.panel}`}>
                  <header className={styles.panelHeader}>
                    <div>
                      <h2 className={styles.panelTitle}>Recent activity</h2>
                      <p className={styles.panelMeta}>
                        Latest deposits, yield events, rebalances, and scheduled
                        cash flows.
                      </p>
                    </div>
                    {!loading && portfolio ? (
                      <span className={styles.chip}>
                        {portfolio.activity.length} event
                        {portfolio.activity.length === 1 ? "" : "s"}
                      </span>
                    ) : null}
                  </header>

                  {loading ? (
                    <div className={styles.emptyState}>
                      <span className={styles.skeletonValue} />
                      <span
                        className={`${styles.skeletonLine} ${styles.skeletonCopy}`}
                      />
                    </div>
                  ) : portfolio && portfolio.activity.length > 0 ? (
                    <div className={styles.activityList}>
                      {portfolio.activity.map((item) => {
                        const statusClassName =
                          item.status === "pending"
                            ? styles.statusPending
                            : item.status === "scheduled"
                              ? styles.statusScheduled
                              : styles.statusCompleted;

                        const amountTone = getValueTone(item.amount ?? 0);
                        const amountClassName =
                          amountTone === "positive"
                            ? styles.valuePositive
                            : amountTone === "negative"
                              ? styles.valueNegative
                              : styles.valueNeutral;

                        return (
                          <div className={styles.activityItem} key={item.id}>
                            <div className={styles.activityIcon}>
                              {renderActivityIcon(item.kind)}
                            </div>

                            <div className={styles.activityBody}>
                              <div className={styles.activityTitleRow}>
                                <p className={styles.activityTitle}>
                                  {item.title}
                                </p>
                                <span
                                  className={`${styles.statusBadge} ${statusClassName}`}
                                >
                                  {item.status}
                                </span>
                              </div>
                              <p className={styles.activityDetail}>
                                {item.detail}
                              </p>
                              <div className={styles.activityMeta}>
                                <span>{activityLabels[item.kind]}</span>
                                <span>{formatTimestamp(item.occurredAt)}</span>
                              </div>
                            </div>

                            <div
                              className={`${styles.activityAmount} ${amountClassName}`}
                            >
                              {item.amount == null
                                ? "No amount"
                                : formatSignedCurrency(item.amount)}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <EmptyState
                      copy="No recent activity yet. Deposits and rebalances will appear here as soon as they happen."
                      cta="Load sample data"
                      icon={<ActivityIcon />}
                      onAction={resetToLivePreview}
                    />
                  )}
                </article>
              </div>
            </>
          )}
        </div>
      </section>
    </main>
  );
}

function PieIcon() {
  return (
    <svg
      aria-hidden="true"
      fill="none"
      height="24"
      viewBox="0 0 24 24"
      width="24"
    >
      <path
        d="M11 3a9 9 0 1 0 9 9h-9V3Z"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.8"
      />
      <path
        d="M14.5 3.7A9 9 0 0 1 20.3 9.5H14.5V3.7Z"
        fill="currentColor"
        opacity="0.24"
      />
    </svg>
  );
}

function ActivityIcon() {
  return (
    <svg
      aria-hidden="true"
      fill="none"
      height="24"
      viewBox="0 0 24 24"
      width="24"
    >
      <path
        d="M5 19.25h14"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="1.8"
      />
      <path
        d="M7 15.75 10.2 12l2.8 2.4 4-5.15"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.8"
      />
      <circle cx="7" cy="15.75" fill="currentColor" opacity="0.24" r="1.4" />
      <circle cx="10.2" cy="12" fill="currentColor" opacity="0.24" r="1.4" />
      <circle cx="13" cy="14.4" fill="currentColor" opacity="0.24" r="1.4" />
      <circle cx="17" cy="9.25" fill="currentColor" opacity="0.24" r="1.4" />
    </svg>
  );
}

function ArrowDownIcon() {
  return (
    <svg
      aria-hidden="true"
      fill="none"
      height="20"
      viewBox="0 0 24 24"
      width="20"
    >
      <path
        d="M12 5v14"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="1.8"
      />
      <path
        d="m6.5 13.5 5.5 5.5 5.5-5.5"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.8"
      />
    </svg>
  );
}

function ArrowUpIcon() {
  return (
    <svg
      aria-hidden="true"
      fill="none"
      height="20"
      viewBox="0 0 24 24"
      width="20"
    >
      <path
        d="M12 19V5"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="1.8"
      />
      <path
        d="M17.5 10.5 12 5 6.5 10.5"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.8"
      />
    </svg>
  );
}

function ShuffleIcon() {
  return (
    <svg
      aria-hidden="true"
      fill="none"
      height="20"
      viewBox="0 0 24 24"
      width="20"
    >
      <path
        d="M16 4h4v4"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.8"
      />
      <path
        d="M4 18h3.2c1.3 0 2.5-.6 3.3-1.6L20 4"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.8"
      />
      <path
        d="M16 20h4v-4"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.8"
      />
      <path
        d="M4 6h3.2c1.3 0 2.5.6 3.3 1.6L12 9"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.8"
      />
      <path
        d="m14 15 1.5 1.8c.8 1 2 1.6 3.3 1.6H20"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.8"
      />
    </svg>
  );
}

function SparkIcon() {
  return (
    <svg
      aria-hidden="true"
      fill="none"
      height="20"
      viewBox="0 0 24 24"
      width="20"
    >
      <path
        d="m12 3 1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9L12 3Z"
        stroke="currentColor"
        strokeLinejoin="round"
        strokeWidth="1.8"
      />
    </svg>
  );
}
