/**
 * @module Skeleton
 *
 * Reusable skeleton loading primitives for NeuroWealth.
 *
 * Design spec:
 * - Animation duration: 1.4s (within 1.2s–1.8s range)
 * - Skeleton dimensions match final components ±4px tolerance
 * - `prefers-reduced-motion` users receive static, non-animated skeletons
 * - All skeletons carry `aria-hidden="true"` so screen readers skip them
 *
 * Usage:
 * ```tsx
 * // Primitive blocks
 * <Skeleton width="60%" height={16} />
 * <SkeletonCircle size={40} />
 * <SkeletonText lines={3} />
 *
 * // Composed presets
 * <MetricCardSkeleton />
 * <DashboardSkeleton />
 * <TableSkeleton rows={5} />
 * <CardSkeleton />
 * <ModalSkeleton />
 * <NotificationItemSkeleton />
 * <NotificationListSkeleton />
 * <TransactionFormSkeleton />
 * <AuditTableSkeleton />
 * <ProfileFormSkeleton />
 * <OnboardingStepSkeleton />
 * ```
 */

"use client";

import { CSSProperties, HTMLAttributes } from "react";
import styles from "./Skeleton.module.css";

// ─── Primitive: Skeleton ───────────────────────────────────────────────────────

export interface SkeletonProps extends HTMLAttributes<HTMLSpanElement> {
  /** Width as a CSS value or number (px) */
  width?: string | number;
  /** Height as a CSS value or number (px) */
  height?: string | number;
  /** Border radius as a CSS value or number (px). Defaults to 6px. */
  radius?: string | number;
}

/**
 * Base skeleton block. Renders as an inline-block shimmer bar.
 *
 * Reduced-motion: animation is suppressed via CSS media query.
 */
export function Skeleton({
  width = "100%",
  height = 16,
  radius = 6,
  className = "",
  style,
  ...props
}: SkeletonProps) {
  const cssVars: CSSProperties = {
    width: typeof width === "number" ? `${width}px` : width,
    height: typeof height === "number" ? `${height}px` : height,
    borderRadius: typeof radius === "number" ? `${radius}px` : radius,
    ...style,
  };

  return (
    <span
      aria-hidden="true"
      role="presentation"
      className={`${styles.skeleton} ${className}`}
      style={cssVars}
      {...props}
    />
  );
}

// ─── Primitive: SkeletonCircle ─────────────────────────────────────────────────

export interface SkeletonCircleProps {
  /** Diameter in px */
  size?: number;
  className?: string;
}

/** Circular skeleton (avatars, icon placeholders). */
export function SkeletonCircle({ size = 40, className = "" }: SkeletonCircleProps) {
  return (
    <Skeleton
      width={size}
      height={size}
      radius="50%"
      className={className}
    />
  );
}

// ─── Primitive: SkeletonText ───────────────────────────────────────────────────

export interface SkeletonTextProps {
  /** Number of lines to render */
  lines?: number;
  /** Width of the last line (shorter to look more natural). Defaults to "60%". */
  lastLineWidth?: string;
  /** Height per line in px. Defaults to 14. */
  lineHeight?: number;
  /** Gap between lines in px. Defaults to 8. */
  gap?: number;
  className?: string;
}

/** Multi-line text skeleton. */
export function SkeletonText({
  lines = 3,
  lastLineWidth = "60%",
  lineHeight = 14,
  gap = 8,
  className = "",
}: SkeletonTextProps) {
  return (
    <div
      aria-hidden="true"
      role="presentation"
      className={`${styles.textBlock} ${className}`}
      style={{ gap }}
    >
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          height={lineHeight}
          width={i === lines - 1 && lines > 1 ? lastLineWidth : "100%"}
        />
      ))}
    </div>
  );
}

// ─── Preset: MetricCard ────────────────────────────────────────────────────────

export interface MetricCardSkeletonProps {
  className?: string;
}

/**
 * Matches MetricCard in PortfolioDashboard (min-height: 173px, padding: 22px).
 * Label line: 12px h × 45% w
 * Value line: 42px h × 72% w
 * Helper line: 14px h × 84% w
 */
export function MetricCardSkeleton({ className = "" }: MetricCardSkeletonProps) {
  return (
    <article
      aria-hidden="true"
      role="presentation"
      className={`${styles.metricCard} ${className}`}
    >
      <Skeleton height={12} width="45%" />
      <Skeleton height={42} width="72%" />
      <Skeleton height={14} width="84%" />
    </article>
  );
}

// ─── Preset: Dashboard ────────────────────────────────────────────────────────

export interface DashboardSkeletonProps {
  className?: string;
}

/**
 * Full PortfolioDashboard loading state.
 * - 4 metric cards (summaryGrid: repeat(4,1fr), gap 16px)
 * - Chart panel (contentGrid left): 340px h
 * - Allocation panel (contentGrid right): 340px h
 * - Activity list: 5 rows
 */
export function DashboardSkeleton({ className = "" }: DashboardSkeletonProps) {
  return (
    <div
      aria-hidden="true"
      role="presentation"
      className={`${styles.dashboard} ${className}`}
    >
      {/* Topbar */}
      <div className={styles.dashboardTopbar}>
        <div className={styles.dashboardHeadingGroup}>
          <Skeleton height={12} width={120} radius={999} />
          <Skeleton height={44} width="55%" radius={8} className={styles.dashboardHeading} />
          <Skeleton height={16} width="72%" />
        </div>
        <div className={styles.dashboardControls}>
          <Skeleton height={90} width={240} radius={20} />
        </div>
      </div>

      {/* Banner */}
      <Skeleton height={68} width="100%" radius={20} className={styles.dashboardBanner} />

      {/* Summary grid – 4 metric cards */}
      <div className={styles.summaryGrid}>
        {Array.from({ length: 4 }).map((_, i) => (
          <MetricCardSkeleton key={i} />
        ))}
      </div>

      {/* Content grid */}
      <div className={styles.contentGrid}>
        {/* Chart panel */}
        <div className={styles.panelSkeleton}>
          <Skeleton height={18} width="40%" />
          <Skeleton height={200} width="100%" radius={12} />
          <div className={styles.legendRow}>
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className={styles.legendItem}>
                <Skeleton height={10} width={10} radius="50%" />
                <Skeleton height={12} width={60} />
              </div>
            ))}
          </div>
        </div>

        {/* Allocation panel */}
        <div className={styles.panelSkeleton}>
          <Skeleton height={18} width="50%" />
          <div className={styles.allocationLayout}>
            <SkeletonCircle size={180} />
            <div className={styles.allocationList}>
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className={styles.allocationRow}>
                  <Skeleton height={12} width="60%" />
                  <Skeleton height={12} width={50} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Preset: Card ─────────────────────────────────────────────────────────────

export interface CardSkeletonProps {
  /** Number of body lines */
  lines?: number;
  showHeader?: boolean;
  showFooter?: boolean;
  className?: string;
}

/**
 * Generic card skeleton matching Card component (rounded-xl, p-6).
 */
export function CardSkeleton({
  lines = 3,
  showHeader = true,
  showFooter = false,
  className = "",
}: CardSkeletonProps) {
  return (
    <div
      aria-hidden="true"
      role="presentation"
      className={`${styles.cardSkeleton} ${className}`}
    >
      {showHeader && (
        <div className={styles.cardHeader}>
          <Skeleton height={20} width="55%" />
          <Skeleton height={12} width="35%" />
        </div>
      )}
      <SkeletonText lines={lines} lineHeight={14} gap={8} />
      {showFooter && (
        <div className={styles.cardFooter}>
          <Skeleton height={36} width={100} radius={8} />
          <Skeleton height={36} width={80} radius={8} />
        </div>
      )}
    </div>
  );
}

// ─── Preset: Modal ────────────────────────────────────────────────────────────

export interface ModalSkeletonProps {
  className?: string;
}

/**
 * Skeleton matching Modal component (max-w-md, p-6, rounded-2xl).
 * Title bar + 4 body lines + two action buttons.
 */
export function ModalSkeleton({ className = "" }: ModalSkeletonProps) {
  return (
    <div
      aria-hidden="true"
      role="presentation"
      className={`${styles.modalSkeleton} ${className}`}
    >
      {/* Title bar */}
      <div className={styles.modalHeader}>
        <Skeleton height={22} width="55%" />
        <Skeleton height={28} width={28} radius={8} />
      </div>
      {/* Body */}
      <SkeletonText lines={4} lineHeight={14} gap={10} />
      {/* Actions */}
      <div className={styles.modalActions}>
        <Skeleton height={40} width={120} radius={8} />
        <Skeleton height={40} width={96} radius={8} />
      </div>
    </div>
  );
}

// ─── Preset: Table ────────────────────────────────────────────────────────────

export interface TableSkeletonProps {
  rows?: number;
  cols?: number;
  showHeader?: boolean;
  className?: string;
}

/**
 * Table skeleton matching AuditTrail table (5 columns).
 * Header row + configurable data rows.
 */
export function TableSkeleton({
  rows = 5,
  cols = 5,
  showHeader = true,
  className = "",
}: TableSkeletonProps) {
  const colWidths = ["28%", "20%", "18%", "14%", "10%"];

  return (
    <div
      aria-hidden="true"
      role="presentation"
      className={`${styles.tableSkeleton} ${className}`}
    >
      {showHeader && (
        <div className={styles.tableRow}>
          {Array.from({ length: cols }).map((_, i) => (
            <Skeleton key={i} height={13} width={colWidths[i] ?? "15%"} />
          ))}
        </div>
      )}
      {Array.from({ length: rows }).map((_, rowIdx) => (
        <div key={rowIdx} className={`${styles.tableRow} ${styles.tableDataRow}`}>
          {Array.from({ length: cols }).map((_, colIdx) => (
            <Skeleton
              key={colIdx}
              height={14}
              width={
                colIdx === 0 ? "24%" :
                colIdx === 1 ? "18%" :
                colIdx === 2 ? "16%" :
                colIdx === 3 ? "12%" :
                "8%"
              }
            />
          ))}
        </div>
      ))}
    </div>
  );
}

// ─── Preset: NotificationItem ──────────────────────────────────────────────────

export interface NotificationItemSkeletonProps {
  className?: string;
}

/**
 * Matches NotificationItem layout (p-4, border-l-2, flex-col gap-2).
 */
export function NotificationItemSkeleton({ className = "" }: NotificationItemSkeletonProps) {
  return (
    <div
      aria-hidden="true"
      role="presentation"
      className={`${styles.notifItem} ${className}`}
    >
      <div className={styles.notifHeader}>
        <div className={styles.notifTitleGroup}>
          <SkeletonCircle size={16} />
          <Skeleton height={13} width={140} />
        </div>
        <Skeleton height={10} width={36} />
      </div>
      <Skeleton height={12} width="90%" />
      <Skeleton height={12} width="70%" />
    </div>
  );
}

// ─── Preset: NotificationList ─────────────────────────────────────────────────

export interface NotificationListSkeletonProps {
  items?: number;
  className?: string;
}

/**
 * Full notification panel skeleton (w-80, max-h-500px).
 */
export function NotificationListSkeleton({
  items = 4,
  className = "",
}: NotificationListSkeletonProps) {
  return (
    <div
      aria-hidden="true"
      role="presentation"
      className={`${styles.notifPanel} ${className}`}
    >
      {/* Header */}
      <div className={styles.notifPanelHeader}>
        <Skeleton height={11} width={90} />
        <Skeleton height={20} width={20} radius={4} />
      </div>
      {/* Items */}
      <div className={styles.notifPanelBody}>
        {Array.from({ length: items }).map((_, i) => (
          <NotificationItemSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}

// ─── Preset: TransactionForm ──────────────────────────────────────────────────

export interface TransactionFormSkeletonProps {
  className?: string;
}

/**
 * Matches TransactionFlow form stage layout.
 * Tab row + 3 form fields + preview box + action button.
 */
export function TransactionFormSkeleton({ className = "" }: TransactionFormSkeletonProps) {
  return (
    <div
      aria-hidden="true"
      role="presentation"
      className={`${styles.txForm} ${className}`}
    >
      {/* Kind tabs */}
      <div className={styles.txTabs}>
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} height={36} width={88} radius={14} />
        ))}
      </div>
      {/* Fields */}
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className={styles.txField}>
          <Skeleton height={12} width={80} />
          <Skeleton height={44} width="100%" radius={10} />
        </div>
      ))}
      {/* Preview box */}
      <Skeleton height={88} width="100%" radius={14} className={styles.txPreview} />
      {/* CTA */}
      <Skeleton height={48} width="100%" radius={10} />
    </div>
  );
}

// ─── Preset: AuditTable ───────────────────────────────────────────────────────

export interface AuditTableSkeletonProps {
  rows?: number;
  className?: string;
}

/**
 * Full AuditTrail page skeleton.
 * Header + controls + table (5 cols).
 */
export function AuditTableSkeleton({ rows = 6, className = "" }: AuditTableSkeletonProps) {
  return (
    <div
      aria-hidden="true"
      role="presentation"
      className={`${styles.auditSkeleton} ${className}`}
    >
      {/* Page header */}
      <div className={styles.auditHeader}>
        <div>
          <Skeleton height={28} width={220} radius={8} />
          <Skeleton height={14} width={300} className={styles.auditSubtitle} />
        </div>
        <Skeleton height={38} width={130} radius={8} />
      </div>
      {/* Controls */}
      <div className={styles.auditControls}>
        <Skeleton height={38} width={180} radius={8} />
        <Skeleton height={38} width={120} radius={8} />
      </div>
      {/* Table */}
      <TableSkeleton rows={rows} cols={5} />
    </div>
  );
}

// ─── Preset: ProfileForm ──────────────────────────────────────────────────────

export interface ProfileFormSkeletonProps {
  className?: string;
}

/**
 * Profile page form skeleton.
 * Avatar + 4 labeled select/input fields + save button.
 */
export function ProfileFormSkeleton({ className = "" }: ProfileFormSkeletonProps) {
  return (
    <div
      aria-hidden="true"
      role="presentation"
      className={`${styles.profileForm} ${className}`}
    >
      {/* Avatar + name */}
      <div className={styles.profileHeader}>
        <SkeletonCircle size={64} />
        <div className={styles.profileName}>
          <Skeleton height={22} width={160} />
          <Skeleton height={13} width={110} />
        </div>
      </div>
      {/* Fields */}
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className={styles.profileField}>
          <Skeleton height={12} width={90} />
          <Skeleton height={44} width="100%" radius={8} />
        </div>
      ))}
      {/* Actions */}
      <div className={styles.profileActions}>
        <Skeleton height={40} width={120} radius={8} />
        <Skeleton height={40} width={96} radius={8} />
      </div>
    </div>
  );
}

// ─── Preset: OnboardingStep ────────────────────────────────────────────────────

export interface OnboardingStepSkeletonProps {
  className?: string;
}

/**
 * Onboarding flow step skeleton (stepper + content card).
 */
export function OnboardingStepSkeleton({ className = "" }: OnboardingStepSkeletonProps) {
  return (
    <div
      aria-hidden="true"
      role="presentation"
      className={`${styles.onboardingStep} ${className}`}
    >
      {/* Stepper dots */}
      <div className={styles.stepperRow}>
        {Array.from({ length: 3 }).map((_, i) => (
          <SkeletonCircle key={i} size={28} />
        ))}
      </div>
      {/* Content card */}
      <div className={styles.onboardingCard}>
        <Skeleton height={28} width="60%" radius={8} />
        <SkeletonText lines={3} lineHeight={14} gap={8} lastLineWidth="50%" className={styles.onboardingBody} />
        {/* Input area */}
        <Skeleton height={52} width="100%" radius={10} />
        {/* CTA */}
        <Skeleton height={48} width="100%" radius={10} />
      </div>
    </div>
  );
}

// ─── Preset: SettingsSection ──────────────────────────────────────────────────

export interface SettingsSectionSkeletonProps {
  rows?: number;
  className?: string;
}

/**
 * Settings page skeleton.
 * Section title + toggle rows.
 */
export function SettingsSectionSkeleton({
  rows = 4,
  className = "",
}: SettingsSectionSkeletonProps) {
  return (
    <div
      aria-hidden="true"
      role="presentation"
      className={`${styles.settingsSection} ${className}`}
    >
      <Skeleton height={20} width={160} radius={6} className={styles.settingsTitle} />
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className={styles.settingsRow}>
          <div className={styles.settingsRowLeft}>
            <Skeleton height={14} width={180} />
            <Skeleton height={11} width={260} />
          </div>
          <Skeleton height={24} width={44} radius={999} />
        </div>
      ))}
    </div>
  );
}
