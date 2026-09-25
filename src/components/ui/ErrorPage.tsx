"use client";

import React, { ReactNode, useEffect, useRef } from "react";
import { MAIN_CONTENT_LANDMARK_ID } from "@/lib/app-landmarks";
import { Button } from "./Button";

interface ErrorPageProps {
  statusCode: string | number;
  title: string;
  description: string;
  icon?: ReactNode;
  primaryAction: { label: string; href: string };
  secondaryAction?: { label: string; href?: string; onClick?: () => void };
  /**
   * Set to false when ErrorPage renders inside a layout (e.g. DashboardShell)
   * that already owns the MAIN_CONTENT_LANDMARK_ID main-content landmark, so
   * this component doesn't create a second element with the same id. Focus
   * management is unaffected - the wrapper is still focused on mount either
   * way. Defaults to true for standalone error/not-found routes that have no
   * persistent layout landmark of their own.
   */
  ownsLandmark?: boolean;
}

/**
 * Reusable branded error page with recovery actions.
 *
 * Spec: distinct title + recovery per status, primary above secondary on mobile.
 */
export function ErrorPage({
  statusCode,
  title,
  description,
  icon,
  primaryAction,
  secondaryAction,
  ownsLandmark = true,
}: ErrorPageProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    containerRef.current?.focus({ preventScroll: true });
  }, []);

  return (
    <div
      ref={containerRef}
      id={ownsLandmark ? MAIN_CONTENT_LANDMARK_ID : undefined}
      tabIndex={-1}
      className={ownsLandmark 
        ? "min-h-screen flex items-center justify-center bg-dark-900 px-4"
        : "flex items-center justify-center bg-dark-900 px-4 py-8"
      }
    >
      <div className="text-center max-w-md">
        {icon && (
          <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-red-500/10 text-red-400 mx-auto mb-6">
            {icon}
          </div>
        )}

        <p className="text-6xl font-bold text-sky-500/30 mb-4">{statusCode}</p>

        <h1 className="text-2xl font-bold text-slate-100 mb-3">{title}</h1>

        <p className="text-sm text-slate-400 max-w-[420px] leading-relaxed mb-8 mx-auto">
          {description}
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <a
            href={primaryAction.href}
            className="inline-flex items-center justify-center gap-2 text-center whitespace-normal leading-snug transition-all duration-200 bg-sky-500 hover:bg-sky-400 text-white font-semibold shadow-lg shadow-sky-500/20 px-5 py-2.5 text-sm rounded-lg"
          >
            {primaryAction.label}
          </a>

          {secondaryAction && (
            secondaryAction.href ? (
              <a
                href={secondaryAction.href}
                className="inline-flex items-center justify-center gap-2 text-center whitespace-normal leading-snug transition-all duration-200 border border-sky-500/60 text-sky-400 hover:bg-sky-500/10 font-medium px-5 py-2.5 text-sm rounded-lg"
              >
                {secondaryAction.label}
              </a>
            ) : (
              <Button
                variant="secondary"
                size="md"
                onClick={secondaryAction.onClick}
              >
                {secondaryAction.label}
              </Button>
            )
          )}
        </div>
      </div>
    </div>
  );
}
