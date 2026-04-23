"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Search, X } from "lucide-react";
import {
  GroupedSearchResults,
  SearchGroup,
  SearchResultItem,
  hasAnySearchResults,
  searchMockIndex,
} from "@/lib/mock-search-index";
import { useOnClickOutside } from "@/hooks/useOnClickOutside";

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

export function GlobalSearch({
  placeholder = "Search pages, actions, or records",
  onRequestClose,
  autoFocus = false,
  className = "",
}: GlobalSearchProps) {
  const router = useRouter();
  const listboxId = useId();

  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [results, setResults] = useState<GroupedSearchResults>(EMPTY_RESULTS);
  const [activeIndex, setActiveIndex] = useState(-1);

  const rootRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

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
    const timer = window.setTimeout(() => {
      setDebouncedQuery(query.trim());
    }, 300);
    return () => window.clearTimeout(timer);
  }, [query]);

  useEffect(() => {
    let cancelled = false;

    if (!debouncedQuery) {
      setResults(EMPTY_RESULTS);
      setErrorMessage(null);
      setIsLoading(false);
      setActiveIndex(-1);
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    searchMockIndex(debouncedQuery)
      .then((grouped) => {
        if (cancelled) return;
        setResults(grouped);
        const nextFlat = flattenResults(grouped);
        setActiveIndex(nextFlat.length > 0 ? 0 : -1);
      })
      .catch(() => {
        if (cancelled) return;
        setResults(EMPTY_RESULTS);
        setActiveIndex(-1);
        setErrorMessage("Search is temporarily unavailable. Please try again.");
      })
      .finally(() => {
        if (!cancelled) {
          setIsLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [debouncedQuery]);

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
    setQuery("");
    setResults(EMPTY_RESULTS);
    setErrorMessage(null);
    setActiveIndex(-1);
    inputRef.current?.focus();
  };

  const navigateToResult = (item: SearchResultItem) => {
    router.push(item.href);
    setIsOpen(false);
    setQuery("");
    setResults(EMPTY_RESULTS);
    setActiveIndex(-1);
    onRequestClose?.();
  };

  const moveActiveIndex = (direction: 1 | -1) => {
    if (flatResults.length === 0) return;

    setActiveIndex((current) => {
      if (current < 0) return 0;
      const next = current + direction;
      if (next < 0) return flatResults.length - 1;
      if (next >= flatResults.length) return 0;
      return next;
    });
  };

  return (
    <div ref={rootRef} className={`relative ${className}`}>
      <label htmlFor={`${listboxId}-input`} className="sr-only">
        Global search
      </label>
      <div className="relative">
        <Search
          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
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
          placeholder={placeholder}
          className="h-11 w-full rounded-xl border border-white/10 bg-slate-950/80 pl-10 pr-10 text-sm text-white shadow-inner shadow-black/20 outline-none transition focus:border-sky-400/60 focus:ring-2 focus:ring-sky-400/20"
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
            className="absolute right-2 top-1/2 inline-flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg text-slate-400 transition hover:bg-white/5 hover:text-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400/50"
            aria-label="Clear search"
          >
            <X size={16} aria-hidden="true" />
          </button>
        )}
      </div>

      <div className="sr-only" aria-live="polite">
        {activeItem ? `${activeItem.group} result selected: ${activeItem.title}` : ""}
      </div>

      {shouldShowPanel && (
        <div
          id={listboxId}
          role="listbox"
          className="absolute left-0 right-0 top-[calc(100%+8px)] z-[70] max-h-[min(70vh,28rem)] overflow-auto rounded-2xl border border-white/10 bg-slate-950/95 p-2 shadow-2xl shadow-black/50 backdrop-blur-md"
        >
          {isLoading && (
            <div className="flex min-h-11 items-center gap-2 rounded-xl px-3 py-2 text-sm text-slate-300">
              <Loader2 size={16} className="animate-spin text-sky-400" aria-hidden="true" />
              Searching index...
            </div>
          )}

          {!isLoading && errorMessage && (
            <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-3 text-sm text-red-100">
              <p className="font-medium">Search unavailable</p>
              <p className="mt-1 text-red-200/90">{errorMessage}</p>
              <p className="mt-2 text-red-200/80">Try a different query or retry in a moment.</p>
            </div>
          )}

          {!isLoading && !errorMessage && hasCommittedQuery && !hasResults && (
            <div className="rounded-xl border border-white/10 bg-white/5 px-3 py-3 text-sm text-slate-300">
              <p className="font-medium text-slate-100">No matches found</p>
              <p className="mt-1">Try searching by route name, action verb, or a record ID like TX-7F1C.</p>
            </div>
          )}

          {!isLoading && !errorMessage && hasResults && (
            <div className="space-y-2">
              {GROUP_ORDER.map((group) => {
                const groupResults = results[group];
                if (groupResults.length === 0) return null;

                return (
                  <section key={group} aria-label={`${group} results`}>
                    <h3 className="px-2 pb-1 pt-2 text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-400">
                      {group}
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
                                  ? "bg-sky-500/20 text-sky-100 ring-1 ring-sky-400/50"
                                  : "text-slate-200 hover:bg-white/10"
                              }`}
                            >
                              <span className="pr-3">
                                <span className="block text-sm font-medium">{item.title}</span>
                                <span className="block text-xs text-slate-400">{item.description}</span>
                              </span>
                              <span className="text-[11px] uppercase tracking-wide text-slate-500">{item.group}</span>
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
