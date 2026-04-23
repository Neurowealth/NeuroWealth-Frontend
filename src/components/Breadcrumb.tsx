"use client";

import React, { useState, useRef, useEffect } from "react";
import { BreadcrumbProps, BreadcrumbItem } from "./breadcrumb.types";

// ─── Separator Icon (12–16px per spec) ────────────────────────────────────────
const SeparatorIcon = () => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2.5}
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
    className="nw-breadcrumb__separator-icon"
  >
    <polyline points="9 18 15 12 9 6" />
  </svg>
);

// ─── Ellipsis button shown when items are collapsed ───────────────────────────
const EllipsisButton = ({ onClick }: { onClick: () => void }) => (
  <button
    type="button"
    onClick={onClick}
    aria-label="Show all breadcrumb items"
    className="nw-breadcrumb__ellipsis"
  >
    <span aria-hidden="true">•••</span>
  </button>
);

// ─── Single breadcrumb item ────────────────────────────────────────────────────
const BreadcrumbNode = ({
  item,
  isLast,
}: {
  item: BreadcrumbItem;
  isLast: boolean;
}) => {
  const Tag = item.href && !isLast ? "a" : "span";
  return (
    <span
      className={`nw-breadcrumb__item${isLast ? " nw-breadcrumb__item--current" : ""}`}
    >
      <Tag
        {...(item.href && !isLast ? { href: item.href } : {})}
        {...(isLast ? { "aria-current": "page" as const } : {})}
        className="nw-breadcrumb__link"
      >
        {item.icon && (
          <span className="nw-breadcrumb__icon" aria-hidden="true">
            {item.icon}
          </span>
        )}
        <span className="nw-breadcrumb__label">{item.label}</span>
      </Tag>
    </span>
  );
};

// ─── Main Component ────────────────────────────────────────────────────────────
export default function Breadcrumb({
  items,
  maxItems = 4,
  theme = "dark",
  className = "",
}: BreadcrumbProps) {
  const [expanded, setExpanded] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const containerRef = useRef<HTMLElement>(null);

  // Detect mobile (<640px)
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 639px)");
    setIsMobile(mq.matches);
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  // Determine which items to render
  const getVisibleItems = (): (BreadcrumbItem | "ellipsis")[] => {
    // Mobile: always show only last 2 segments (unless expanded)
    if (isMobile && !expanded && items.length > 2) {
      return ["ellipsis", ...items.slice(-2)];
    }
    // Desktop: collapse if exceeds maxItems (keep first + last N-2)
    if (!expanded && items.length > maxItems) {
      return [
        items[0],
        "ellipsis",
        ...items.slice(-(maxItems - 2)),
      ];
    }
    return items;
  };

  const visible = getVisibleItems();

  return (
    <>
      {/* Scoped styles */}
      <style>{`
        .nw-breadcrumb {
          --nw-bc-gap: 6px;
          --nw-bc-height: 36px;
          --nw-bc-separator-color: #4b5563;
          --nw-bc-text-muted: #6b7280;
          --nw-bc-text-current: #f9fafb;
          --nw-bc-text-link: #9ca3af;
          --nw-bc-link-hover: #e5e7eb;
          --nw-bc-focus-ring: #6366f1;
          --nw-bc-ellipsis-bg: #1f2937;
          --nw-bc-ellipsis-hover: #374151;
          --nw-bc-ellipsis-border: #374151;
          --nw-bc-font-size: 14px;
          display: flex;
          align-items: center;
          min-height: var(--nw-bc-height);
          padding: 0 4px;
          font-size: var(--nw-bc-font-size);
          font-family: 'DM Mono', 'Fira Code', 'Cascadia Code', monospace;
          letter-spacing: 0.01em;
        }

        .nw-breadcrumb--light {
          --nw-bc-separator-color: #d1d5db;
          --nw-bc-text-muted: #9ca3af;
          --nw-bc-text-current: #111827;
          --nw-bc-text-link: #6b7280;
          --nw-bc-link-hover: #111827;
          --nw-bc-ellipsis-bg: #f3f4f6;
          --nw-bc-ellipsis-hover: #e5e7eb;
          --nw-bc-ellipsis-border: #e5e7eb;
        }

        .nw-breadcrumb__list {
          display: flex;
          align-items: center;
          gap: var(--nw-bc-gap);
          list-style: none;
          margin: 0;
          padding: 0;
          flex-wrap: nowrap;
          overflow: hidden;
        }

        .nw-breadcrumb__segment {
          display: flex;
          align-items: center;
          gap: var(--nw-bc-gap);
          min-width: 0;
          white-space: nowrap;
        }

        /* Separator */
        .nw-breadcrumb__separator {
          display: flex;
          align-items: center;
          color: var(--nw-bc-separator-color);
          flex-shrink: 0;
          user-select: none;
        }

        /* Item */
        .nw-breadcrumb__item {
          display: flex;
          align-items: center;
          min-width: 0;
        }

        .nw-breadcrumb__link {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          color: var(--nw-bc-text-link);
          text-decoration: none;
          border-radius: 4px;
          padding: 2px 4px;
          margin: -2px -4px;
          transition: color 0.15s ease;
          outline: none;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          max-width: 160px;
        }

        a.nw-breadcrumb__link:hover {
          color: var(--nw-bc-link-hover);
        }

        a.nw-breadcrumb__link:focus-visible {
          box-shadow: 0 0 0 2px var(--nw-bc-focus-ring);
          color: var(--nw-bc-link-hover);
        }

        /* Current page item */
        .nw-breadcrumb__item--current .nw-breadcrumb__link {
          color: var(--nw-bc-text-current);
          font-weight: 500;
          cursor: default;
          pointer-events: none;
          max-width: 220px;
        }

        .nw-breadcrumb__icon {
          display: inline-flex;
          align-items: center;
          flex-shrink: 0;
          opacity: 0.85;
        }

        .nw-breadcrumb__item--current .nw-breadcrumb__icon {
          opacity: 1;
        }

        /* Ellipsis button */
        .nw-breadcrumb__ellipsis {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          background: var(--nw-bc-ellipsis-bg);
          border: 1px solid var(--nw-bc-ellipsis-border);
          border-radius: 5px;
          color: var(--nw-bc-text-muted);
          font-size: 11px;
          cursor: pointer;
          padding: 2px 8px;
          letter-spacing: 2px;
          line-height: 1;
          height: 22px;
          transition: background 0.15s ease, color 0.15s ease;
          flex-shrink: 0;
          outline: none;
        }

        .nw-breadcrumb__ellipsis:hover {
          background: var(--nw-bc-ellipsis-hover);
          color: var(--nw-bc-link-hover);
        }

        .nw-breadcrumb__ellipsis:focus-visible {
          box-shadow: 0 0 0 2px var(--nw-bc-focus-ring);
        }

        /* Separator icon sizing */
        .nw-breadcrumb__separator-icon {
          width: 13px;
          height: 13px;
        }

        /* Fade-in animation for expanded items */
        @keyframes nw-bc-fadein {
          from { opacity: 0; transform: translateX(-4px); }
          to { opacity: 1; transform: translateX(0); }
        }

        .nw-breadcrumb__segment--revealed {
          animation: nw-bc-fadein 0.18s ease forwards;
        }
      `}</style>

      <nav
        ref={containerRef}
        aria-label="Breadcrumb"
        className={`nw-breadcrumb nw-breadcrumb--${theme} ${className}`}
      >
        <ol className="nw-breadcrumb__list">
          {visible.map((item, idx) => {
            if (item === "ellipsis") {
              return (
                <li key="ellipsis" className="nw-breadcrumb__segment">
                  {idx > 0 && (
                    <span className="nw-breadcrumb__separator" aria-hidden="true">
                      <SeparatorIcon />
                    </span>
                  )}
                  <EllipsisButton onClick={() => setExpanded(true)} />
                </li>
              );
            }

            const isLast = idx === visible.length - 1;
            // Items revealed after expansion get animation
            const wasHidden =
              expanded && items.indexOf(item) > 0 && items.indexOf(item) < items.length - (maxItems - 2);

            return (
              <li
                key={item.href ?? item.label}
                className={`nw-breadcrumb__segment${wasHidden ? " nw-breadcrumb__segment--revealed" : ""}`}
              >
                {idx > 0 && (
                  <span className="nw-breadcrumb__separator" aria-hidden="true">
                    <SeparatorIcon />
                  </span>
                )}
                <BreadcrumbNode item={item} isLast={isLast} />
              </li>
            );
          })}
        </ol>
      </nav>
    </>
  );
}