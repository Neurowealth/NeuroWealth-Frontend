"use client";

import { useCallback, useEffect, useId, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle, Loader2, Search, SearchX, X } from "lucide-react";
import {
  GroupedSearchResults,
  SearchGroup,
  SearchResultItem,
  hasAnySearchResults,
  getSearchDataProvider,
  SEARCH_DEBOUNCE_MS,
} from "@/lib/search-service";
import { useOnClickOutside } from "@/hooks/useOnClickOutside";
import { useDebounce } from "@/hooks/useDebounce";
import { useI18n } from "@/contexts/I18nContext";
import type { AppMessages } from "@/lib/i18n/messages";

interface GlobalSearchProps {
  placeholder?: string;
  onRequestClose?: () => void;
  autoFocus?: boolean;
  className?: string;
}

const EMPTY_RESULTS: GroupedSearchResults = {
  Pages: [],
  Actions: [],
  Records: [],
};

const GROUP_ORDER: SearchGroup[] = ["Pages", "Actions", "Records"];

function flattenResults(results: GroupedSearchResults): SearchResultItem[] {
  return GROUP_ORDER.flatMap((group) => results[group]);
}

export function computeNextIndex(
  current: number,
  direction: 1 | -1,
  total: number,
): number {
  if (total === 0) return -1;
  if (current < 0 || current >= total) return 0;
  const next = current + direction;
  if (next < 0) return total - 1;
  if (next >= total) return 0;
  return next;
}

export function resolveLiveRegionMessage(
  isLoading: boolean,
  errorMessage: string | null,
  hasCommittedQuery: boolean,
  hasResults: boolean,
  debouncedQuery: string,
  numResults: number,
  t: AppMessages['globalSearch']
): string {
  if (isLoading) return "";
  if (errorMessage) return `${t.liveRegion.errorPrefix} ${errorMessage}`;
  if (hasCommittedQuery && !hasResults) return `${t.liveRegion.noResults} ${debouncedQuery}`;
  if (hasResults) return `${numResults} ${numResults !== 1 ? t.liveRegion.resultsAvailable : t.liveRegion.resultsAvailableSingular}`;
  return "";
}

/**
 * Tracks the latest in-flight async search so stale responses can be dropped.
 * Extracted as a pure helper (rather than inlined ref arithmetic) so the
 * latest-wins / supersede behaviour can be unit-tested directly — see #365.
 */
export interface LatestRequestTracker {
  /** Begin a new request; supersedes all earlier ones and returns its id. */
  start(): number;
  /** True once `id` is no longer the latest (a newer request or invalidate ran). */
  isStale(id: number): boolean;
  /** Supersede any in-flight request without starting a new one (clear/navigate/unmount). */
  invalidate(): void;
}

export function createLatestRequestTracker(): LatestRequestTracker {
  let latest = 0;
  return {
    start: () => ++latest,
    isStale: (id: number) => id !== latest,
    invalidate: () => {
      latest += 1;
    },
  };
}

export function GlobalSearch({
  placeholder,
  onRequestClose,
  autoFocus = false,
  className = "",
}: GlobalSearchProps) {
  const router = useRouter();
  const { messages } = useI18n();
  const t = messages.globalSearch;
  const resolvedPlaceholder = placeholder ?? t.placeholder;
  const listboxId = useId();

  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [results, setResults] = useState<GroupedSearchResults>(EMPTY_RESULTS);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [retryKey, setRetryKey] = useState(0);

  const debouncedQuery = useDebounce(query.trim(), SEARCH_DEBOUNCE_MS);

  const rootRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  // Tracks the latest in-flight search. A response is applied only when its id
  // is still the latest, so a slow search can never overwrite a newer one (or
  // results that were cleared / navigated away from).
  const requestTrackerRef = useRef<LatestRequestTracker>(createLatestRequestTracker());

  useOnClickOutside(rootRef, () => {
    setIsOpen(false);
    setActiveIndex(-1);
  });

  useEffect(() => {
    if (!autoFocus) return;
    const timer = window.setTimeout(() => {
      inputRef.current?.focus();
      setIsOpen(true);
    }, 25);
    return () => window.clearTimeout(timer);
  }, [autoFocus]);

  useEffect(() => {
    const tracker = requestTrackerRef.current;

    if (!debouncedQuery) {
      // Invalidate any in-flight search so a late response can't repopulate.
      tracker.invalidate();
      setResults(EMPTY_RESULTS);
      setErrorMessage(null);
      setIsLoading(false);
      setActiveIndex(-1);
      return;
    }

    const requestId = tracker.start();
    setIsLoading(true);
    setErrorMessage(null);

    getSearchDataProvider()
      .search(debouncedQuery)
      .then((grouped) => {
        if (tracker.isStale(requestId)) return;
        setResults(grouped);
        const nextFlat = flattenResults(grouped);
        setActiveIndex(nextFlat.length > 0 ? 0 : -1);
      })
      .catch(() => {
        if (tracker.isStale(requestId)) return;
        setResults(EMPTY_RESULTS);
        setActiveIndex(-1);
        setErrorMessage(t.errorMessage);
      })
      .finally(() => {
        if (!tracker.isStale(requestId)) {
          setIsLoading(false);
        }
      });

    return () => {
      // A newer query (or unmount) supersedes this run; ignore its result.
      tracker.invalidate();
    };
  }, [debouncedQuery, retryKey, t.errorMessage]);

  const flatResults = useMemo(() => flattenResults(results), [results]);

  const activeItem = activeIndex >= 0 ? flatResults[activeIndex] : null;
  const activeOptionId = activeItem ? `${listboxId}-${activeItem.id}` : undefined;

  const shouldShowPanel =
    isOpen && (query.length > 0 || isLoading || !!errorMessage || hasAnySearchResults(results));

  const hasResults = hasAnySearchResults(results);
  const hasCommittedQuery = debouncedQuery.length > 0 && debouncedQuery === query.trim();

  const openAndFocus = () => {
    setIsOpen(true);
  };

  const clearQuery = () => {
    requestTrackerRef.current.invalidate(); // drop any in-flight search so it can't repopulate
    setQuery("");
    setResults(EMPTY_RESULTS);
    setErrorMessage(null);
    setIsLoading(false);
    setActiveIndex(-1);
    inputRef.current?.focus();
  };

  const navigateToResult = (item: SearchResultItem) => {
    requestTrackerRef.current.invalidate(); // drop any in-flight search before navigating away
    router.push(item.href);
    setIsOpen(false);
    setQuery("");
    setResults(EMPTY_RESULTS);
    setActiveIndex(-1);
    onRequestClose?.();
  };

  const handleRetry = useCallback(() => {
    setErrorMessage(null);
    setRetryKey((k) => k + 1);
  }, []);

  const moveActiveIndex = (direction: 1 | -1) => {
    if (flatResults.length === 0) return;

    setActiveIndex((current) =>
      computeNextIndex(current, direction, flatResults.length),
    );
  };

  return (
    <div ref={rootRef} className={`relative ${className}`}>
      <label htmlFor={`${listboxId}-input`} className="sr-only">
        {t.label}
      </label>
      <div className="relative">
        <Search
          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 dark:text-slate-400"
          size={18}
          aria-hidden="true"
        />

        <input
          id={`${listboxId}-input`}
          ref={inputRef}
          value={query}
          onChange={(event) => {
            setQuery(event.target.value);
            setIsOpen(true);
          }}
          onFocus={openAndFocus}
          onClick={openAndFocus}
          onKeyDown={(event) => {
            if (event.key === "ArrowDown") {
              event.preventDefault();
              setIsOpen(true);
              moveActiveIndex(1);
              return;
            }
            if (event.key === "ArrowUp") {
              event.preventDefault();
              setIsOpen(true);
              moveActiveIndex(-1);
              return;
            }
            if (event.key === "Enter" && activeItem) {
              event.preventDefault();
              navigateToResult(activeItem);
              return;
            }
            if (event.key === "Escape") {
              event.preventDefault();
              setIsOpen(false);
              setActiveIndex(-1);
              onRequestClose?.();
            }
          }}
          placeholder={resolvedPlaceholder}
          className="h-11 w-full rounded-xl border border-slate-200 dark:border-white/10 bg-white/90 dark:bg-slate-950/80 pl-10 pr-10 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 shadow-inner shadow-black/5 dark:shadow-black/20 outline-none transition focus:border-sky-400/60 focus:ring-2 focus:ring-sky-400/20"
          autoComplete="off"
          role="combobox"
          aria-autocomplete="list"
          aria-expanded={shouldShowPanel}
          aria-controls={listboxId}
          aria-activedescendant={activeOptionId}
        />

        {query.length > 0 && (
          <button
            type="button"
            onClick={clearQuery}
            className="absolute right-2 top-1/2 inline-flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-900 dark:hover:bg-white/5 dark:hover:text-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400/50"
            aria-label={t.clearAriaLabel}
          >
            <X size={16} aria-hidden="true" />
          </button>
        )}
      </div>

      <div className="sr-only" aria-live="polite" aria-atomic="true">
        {activeItem
          ? `${activeItem.group} result selected: ${activeItem.title}`
          : ""}
      </div>
      <div className="sr-only" aria-live="polite" aria-atomic="true">
        {resolveLiveRegionMessage(
          isLoading,
          errorMessage,
          hasCommittedQuery,
          hasResults,
          debouncedQuery,
          flatResults.length,
          t
        )}
      </div>

      {shouldShowPanel && (
        <div
          id={listboxId}
          role="listbox"
          className="absolute left-0 right-0 top-[calc(100%+8px)] z-dropdown max-h-[min(70vh,28rem)] overflow-auto rounded-2xl border border-slate-200 dark:border-white/10 bg-white/95 dark:bg-slate-950/95 p-2 shadow-2xl shadow-slate-900/10 dark:shadow-black/50 backdrop-blur-md"
        >
          {isLoading && (
            <div className="flex min-h-11 items-center gap-2 rounded-xl px-3 py-2 text-sm text-slate-600 dark:text-slate-300">
              <Loader2 size={16} className="animate-spin text-sky-400" aria-hidden="true" />
              {t.searching}
            </div>
          )}

          {!isLoading && errorMessage && (
            <div
              className="rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-4 text-sm text-red-100"
              role="alert"
            >
              <div className="flex items-start gap-2">
                <AlertCircle size={16} className="mt-0.5 shrink-0 text-red-300" aria-hidden="true" />
                <div className="min-w-0">
                  <p className="font-medium">{t.errorTitle}</p>
                  <p className="mt-1 text-red-200/90">{errorMessage}</p>
                </div>
              </div>
              <div className="mt-3 flex gap-2">
                <button
                  type="button"
                  onClick={handleRetry}
                  className="rounded-lg border border-red-500/40 bg-red-500/20 px-3 py-1.5 text-xs font-medium text-red-100 transition hover:bg-red-500/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400/50"
                >
                  {t.errorRetry}
                </button>
                <span className="text-xs text-red-200/70 self-center">
                  {t.errorOr}
                </span>
              </div>
            </div>
          )}

          {!isLoading && !errorMessage && hasCommittedQuery && !hasResults && (
            <div className="rounded-xl border border-dashed border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/[0.03] px-4 py-6 text-center text-sm text-slate-500 dark:text-slate-400">
              <SearchX size={28} className="mx-auto text-slate-400 dark:text-slate-500" aria-hidden="true" />
              <p className="mt-2 font-medium text-slate-700 dark:text-slate-300">
                {t.noMatchesTitle} for &ldquo;{debouncedQuery}&rdquo;
              </p>
              <p className="mt-1 text-slate-500">
                {t.noMatchesHint}
              </p>
            </div>
          )}

          {!isLoading && !errorMessage && hasResults && (
            <div className="space-y-2">
              {GROUP_ORDER.map((group) => {
                const groupResults = results[group];
                if (groupResults.length === 0) return null;

                return (
                  <section key={group} aria-label={`${t.groups[group]} results`}>
                    <h3 className="px-2 pb-1 pt-2 text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-500 dark:text-slate-400">
                      {t.groups[group]}
                    </h3>
                    <ul className="space-y-1">
                      {groupResults.map((item) => {
                        const index = flatResults.findIndex((entry) => entry.id === item.id);
                        const isActive = activeIndex === index;

                        return (
                          <li key={item.id}>
                            <button
                              type="button"
                              id={`${listboxId}-${item.id}`}
                              role="option"
                              aria-selected={isActive}
                              onMouseEnter={() => setActiveIndex(index)}
                              onClick={() => navigateToResult(item)}
                              className={`flex min-h-11 w-full items-center justify-between rounded-xl px-3 py-2 text-left transition ${
                                isActive
                                  ? "bg-slate-100 text-sky-600 dark:bg-slate-800 dark:text-sky-400"
                                  : "text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-white/10"
                              }`}
                            >
                              <span className="pr-3">
                                <span className="block text-sm font-medium text-slate-900 dark:text-slate-100">{item.title}</span>
                                <span className="block text-xs text-slate-500 dark:text-slate-400">{item.description}</span>
                              </span>
                              <span className="text-[11px] uppercase tracking-wide text-slate-400 dark:text-slate-500">{item.group}</span>
                            </button>
                          </li>
                        );
                      })}
                    </ul>
                  </section>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
