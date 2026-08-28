"use client";

import { startTransition, useEffect, useState, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import styles from "./portfolio-dashboard.module.css";
import {
  PortfolioPayload,
  PortfolioScenario,
  AllocationItem,
  ActivityItem,
  parseScenario,
} from "@/lib/portfolio";
import {
  formatApy,
  formatCurrency,
  formatSignedCurrency,
  formatPercent,
  formatSignedPercent,
  formatTimestamp,
  formatSyncLabel,
} from "@/lib/formatters";
import { ApiRequestError, apiRequest } from "@/lib/api-client";
import { useSandbox, ScenarioType } from "@/contexts/SandboxContext";
import { AllocationChart } from "./AllocationChart";
import { useI18n } from "@/contexts/I18nContext";
import { AppMessages } from "@/lib/i18n/messages";
import {
  ArrowDown,
  ArrowUp,
  Shuffle,
  Sparkles,
  PieChart,
  Activity,
} from "lucide-react";
import { EmptyState } from "@/components/ui/EmptyState";
import { Skeleton } from "@/components/ui/Skeleton";
import { SandboxBadge } from "@/components/ui/SandboxBadge";

const toneMap: Record<string, string> = {
  primary: "#3b82f6",
  accent: "#10b981",
  warning: "#f59e0b",
  "neutral-strong": "#64748b",
  "neutral-soft": "#94a3b8",
};

const activityLabels: Record<string, string> = {
  deposit: "Deposit",
  withdrawal: "Withdrawal",
  rebalance: "Rebalance",
  yield: "Yield",
};


type ThemeMode = "light" | "dark";

function getTheme(searchParams: Pick<URLSearchParams, "get">): ThemeMode {
  return searchParams.get("theme") === "dark" ? "dark" : "light";
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
  if (value > 0) return "positive";
  if (value < 0) return "negative";
  return "neutral";
}

function renderActivityIcon(kind: ActivityItem["kind"]) {
  switch (kind) {
    case "deposit":
      return <ArrowDown />;
    case "withdrawal":
      return <ArrowUp />;
    case "rebalance":
      return <Shuffle />;
    default:
      return <Sparkles />;
  }
}

function SummarySkeleton() {
  return (
    <>
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className={styles.card}>
          <Skeleton className="h-4 w-20 mb-2" />
          <Skeleton className="h-7 w-28" />
        </div>
      ))}
    </>
  );
}

function MetricCard({
  label,
  value,
  helper,
  tone,
  mono,
}: {
  label: string;
  value: string;
  helper: string;
  tone: string;
  mono?: boolean;
}) {
  return (
    <div className={styles.card}>
      <p className={styles.controlLabel}>{label}</p>
      <p className={`${mono ? "font-mono" : ""} text-lg font-bold text-text-primary`}>{value}</p>
      <p className="text-xs text-text-muted">{helper}</p>
    </div>
  );
}

function renderSourceLabel(source: PortfolioPayload["source"], t: AppMessages["dashboard"]["portfolio"]) {
  if (source === "api") {
    return t.liveWidgets;
  }

  if (source === "fallback") {
    return t.emptyStates;
  }

  return "Preview data";
}

export function PortfolioDashboard() {
  const { messages } = useI18n();
  const t = messages.dashboard.portfolio;
  const router = useRouter();
  const searchParams = useSearchParams();
  const { getCurrentScenario, isSandboxMode } = useSandbox();
  const [portfolio, setPortfolio] = useState<PortfolioPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryNonce, setRetryNonce] = useState(0);

  const theme = getTheme(searchParams);
  const scenario = getScenario(
    searchParams,
    mapScenarioTypeToPortfolio(getCurrentScenario("portfolio")),
  );

  useEffect(() => {
    const controller = new AbortController();

    async function loadPortfolio() {
      setLoading(true);
      setError(null);

      try {
        const payload = await apiRequest<PortfolioPayload>(
          `/api/portfolio?scenario=${scenario}`,
          { cache: "no-store", signal: controller.signal, timeoutMs: 12000 },
        );
        setPortfolio(payload);
      } catch (loadError) {
        if (controller.signal.aborted) return;
        const message =
          loadError instanceof ApiRequestError || loadError instanceof Error
            ? loadError.message
            : "Unable to load portfolio widgets.";
        logger.error("portfolio_fetch_failed", loadError);
        setError(message);
        setPortfolio(null);
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }

    void loadPortfolio();
    return () => controller.abort();
  }, [scenario, retryNonce]);

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

  function retryPortfolio() {
    setRetryNonce((value) => value + 1);
  }

  const summaryCards = portfolio
    ? [
        {
          label: "Total balance",
          value: formatCurrency(portfolio.summary.totalBalance),
          helper: "Across active positions and protected reserve holdings.",
          tone: "default",
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
          value: formatApy(portfolio.summary.apy),
          helper: "Weighted live rate across the current strategy mix.",
          tone: getValueTone(portfolio.summary.apy),
          mono: true,
        },
        {
          label: "Strategy",
          value: portfolio.summary.strategyLabel,
          helper: portfolio.summary.strategyDescription,
          tone: "default",
        },
      ]
    : [];

  const allocationData = useMemo(() => {
    if (!portfolio) return [];
    return portfolio.allocation.map((item) => ({
      name: item.label,
      value: item.amount,
      tone: item.tone,
    }));
  }, [portfolio]);

  return (
    <div className={styles.page}>
      <section className={styles.shell} data-theme={theme}>
        <div className={styles.content}>
          {/* ── Top bar ── */}
          <div className={styles.topbar}>
            <div>
              <span className={styles.eyebrow}>
                <span className={styles.eyebrowDot} />{t.overview.split(" ")[0]} widgets</span>
              <h2 className={styles.heading}>{t.overview}</h2>
              <p className={styles.subheading}>
                Total balance, yield, APY, strategy, allocation, and recent activity in a single
                review surface with measurable light and dark theme parity.
              </p>
            </div>

            <div className={styles.controls}>
              <div className={styles.controlCard}>
                <p className={styles.controlLabel}>{t.themePreview}</p>
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
                      {option === "light" ? t.lightMode : t.darkMode}
                    </button>
                  ))}
                </div>
              </div>

              <div className={styles.controlCard}>
                <p className={styles.controlLabel}>{t.scenarioPreview}</p>
                <div className={styles.segmentGroup}>
                  {(
                    [
                      { label: t.liveWidgets, value: "live" },
                      { label: t.emptyStates, value: "empty" },
                    ] as const
                  ).map((option) => (
                    <button
                      className={[
                        styles.segmentButton,
                        scenario === option.value ? styles.segmentButtonActive : "",
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

          {/* ── Status banner ── */}
          <div className={styles.banner}>
            <div className={styles.bannerText}>
              <span className={styles.bannerTitle}>
                {portfolio?.notice ?? t.loadingWidget}
              </span>
              <span className={styles.bannerMeta}>
                {portfolio
                  ? formatSyncLabel(portfolio.updatedAt)
                  : t.syncingData}
              </span>
            </div>
            <div className={styles.bannerChips}>
              {isSandboxMode && <SandboxBadge scenario={scenario} label={t.sandbox} />}
              <span className={styles.chip}>{t.theme}: {theme}</span>
              <span className={styles.chip}>{t.source}:{" "}
                {portfolio ? renderSourceLabel(portfolio.source, t) : "Loading"}
              </span>
            </div>
          </div>

          {error && !portfolio ? (
            <div className={`${styles.card} ${styles.errorState}`}>
              <h2 className={styles.errorTitle}>{t.unavailableTitle}</h2>
              <p className={styles.errorCopy}>
                {error} {t.unavailableDesc}
              </p>
              <button
                className={styles.emptyButton}
                onClick={resetToLivePreview}
                type="button"
              >{t.retryWidgets}</button>
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
                      <h2 className={styles.panelTitle}>{t.allocationTitle}</h2>
                      <p className={styles.panelMeta}>{t.allocationDesc}</p>
                    </div>
                    {!loading && portfolio ? (
                      <span className={styles.chip}>
                        {portfolio.allocation.length} allocation
                        {portfolio.allocation.length === 1 ? " " + t.line : " " + t.lines}
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
                        <AllocationChart 
                          data={allocationData}
                          height={200}
                          innerRadius={60}
                          outerRadius={90}
                        />

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
                      icon={<PieChart />}
                      heading={t.emptyAllocation}
                      body={t.loadSample}
                      ctaLabel={t.loadSample}
                      onAction={resetToLivePreview}
                    />
                  )}
                </article>

                <article className={`${styles.card} ${styles.panel}`}>
                  <header className={styles.panelHeader}>
                    <div>
                      <h2 className={styles.panelTitle}>{t.activityTitle}</h2>
                      <p className={styles.panelMeta}>{t.activityDesc}</p>
                    </div>
                    {!loading && portfolio ? (
                      <span className={styles.chip}>
                        {portfolio.activity.length} {portfolio.activity.length === 1 ? t.event : t.events}
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
                                ? t.noAmount
                                : formatSignedCurrency(item.amount)}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <EmptyState
                      icon={<Activity />}
                      heading={t.emptyActivity}
                      body={t.loadSample}
                      ctaLabel={t.loadSample}
                      onAction={resetToLivePreview}
                    />
                  )}
                </article>
              </div>
            </>
          )}
        </div>
      </section>
    </div>
  );
}
