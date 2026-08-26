"use client";

import { useState } from "react";
import TransactionList from "@/components/pagination-filters/TransactionList";
import StrategyList from "@/components/pagination-filters/StrategyList";
import FilterChips from "@/components/pagination-filters/FilterChips";
import Pagination from "@/components/pagination-filters/Pagination";

export default function PaginationFiltersDemo() {
  const [activeView, setActiveView] = useState<
    "transactions" | "strategies" | "showcase"
  >("transactions");

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 dark:bg-gray-900 dark:text-gray-100 py-12 px-6">
      <div className="max-w-7xl mx-auto space-y-12">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white">Pagination & Filter Chips</h1>
          <p className="text-gray-500 dark:text-gray-400">
            Accessible pagination controls and reusable filter chips with count
            badges
          </p>
        </div>

        {/* Navigation */}
        <div
          role="tablist"
          aria-label="Pagination and filters demo sections"
          className="flex gap-3 border-b border-gray-200 dark:border-gray-700"
        >
          <button
            role="tab"
            id="pagination-tab-transactions"
            aria-selected={activeView === "transactions"}
            aria-controls="pagination-panel-transactions"
            onClick={() => setActiveView("transactions")}
            className={`px-4 py-2 font-medium border-b-2 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400/70 ${
              activeView === "transactions"
                ? "border-blue-500 text-blue-600 dark:text-blue-400"
                : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
            }`}
          >
            Transaction List
          </button>
          <button
            role="tab"
            id="pagination-tab-strategies"
            aria-selected={activeView === "strategies"}
            aria-controls="pagination-panel-strategies"
            onClick={() => setActiveView("strategies")}
            className={`px-4 py-2 font-medium border-b-2 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400/70 ${
              activeView === "strategies"
                ? "border-blue-500 text-blue-600 dark:text-blue-400"
                : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
            }`}
          >
            Strategy Cards
          </button>
          <button
            role="tab"
            id="pagination-tab-showcase"
            aria-selected={activeView === "showcase"}
            aria-controls="pagination-panel-showcase"
            onClick={() => setActiveView("showcase")}
            className={`px-4 py-2 font-medium border-b-2 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400/70 ${
              activeView === "showcase"
                ? "border-blue-500 text-blue-600 dark:text-blue-400"
                : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
            }`}
          >
            Component Showcase
          </button>
        </div>

        {/* Content */}
        <div
          id="pagination-panel-transactions"
          role="tabpanel"
          aria-labelledby="pagination-tab-transactions"
          hidden={activeView !== "transactions"}
          tabIndex={0}
        >
          <TransactionList />
        </div>
        <div
          id="pagination-panel-strategies"
          role="tabpanel"
          aria-labelledby="pagination-tab-strategies"
          hidden={activeView !== "strategies"}
          tabIndex={0}
        >
          <StrategyList />
        </div>
        <div
          id="pagination-panel-showcase"
          role="tabpanel"
          aria-labelledby="pagination-tab-showcase"
          hidden={activeView !== "showcase"}
          tabIndex={0}
        >
          <ComponentShowcase />
        </div>
      </div>
    </div>
  );
}

function ComponentShowcase() {
  const [selectedFilters, setSelectedFilters] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);

  const mockFilters = [
    { id: "all", label: "All", count: 145 },
    { id: "active", label: "Active", count: 89 },
    { id: "pending", label: "Pending", count: 32 },
    { id: "archived", label: "Archived", count: 24 },
  ];

  return (
    <div className="space-y-12">
      {/* Filter Chips Showcase */}
      <section className="bg-white dark:bg-gray-800 shadow-sm dark:shadow-none border border-gray-200 dark:border-transparent rounded-lg p-8 space-y-6">
        <div>
          <h2 className="text-2xl font-semibold mb-2 text-gray-900 dark:text-white">Filter Chips</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Clickable filter chips with count badges and clear-all control
          </p>
        </div>

        <div className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-transparent rounded p-6 space-y-6">
          {/* State 1: No filters */}
          <div className="space-y-2">
            <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">
              No Filters Active
            </h3>
            <FilterChips
              options={mockFilters}
              selected={[]}
              onChange={() => {}}
            />
          </div>

          {/* State 2: With filters */}
          <div className="space-y-2">
            <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Multiple Filters Active
            </h3>
            <FilterChips
              options={mockFilters}
              selected={selectedFilters}
              onChange={setSelectedFilters}
            />
          </div>

          {/* Design notes */}
          <div className="pt-4 border-t border-gray-200 dark:border-gray-700 space-y-2 text-sm text-gray-600 dark:text-gray-300">
            <p>✓ Min height 36px (pointer) / 44px effective (touch)</p>
            <p>✓ Count badges: 12–14px, high contrast (AA)</p>
            <p>✓ Clear-all button always visible when filters active</p>
            <p>✓ Keyboard navigation: Tab, Enter to toggle</p>
            <p>✓ Screen reader announces active filter count via aria-live</p>
          </div>
        </div>
      </section>

      {/* Pagination Showcase */}
      <section className="bg-white dark:bg-gray-800 shadow-sm dark:shadow-none border border-gray-200 dark:border-transparent rounded-lg p-8 space-y-6">
        <div>
          <h2 className="text-2xl font-semibold mb-2 text-gray-900 dark:text-white">Pagination</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Navigation controls with prev/next, jump, and page numbers
          </p>
        </div>

        <div className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-transparent rounded p-6 space-y-6">
          {/* Pagination 1: Many pages */}
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Large Dataset (523 items)
            </h3>
            <Pagination
              totalItems={523}
              itemsPerPage={10}
              currentPage={currentPage}
              onPageChange={setCurrentPage}
              showJump
            />
          </div>

          {/* Pagination 2: Few pages */}
          <div className="space-y-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Small Dataset (25 items)
            </h3>
            <Pagination
              totalItems={25}
              itemsPerPage={10}
              currentPage={1}
              onPageChange={() => {}}
              showJump={false}
            />
          </div>

          {/* Design notes */}
          <div className="pt-4 border-t border-gray-200 dark:border-gray-700 space-y-2 text-sm text-gray-600 dark:text-gray-300">
            <p>✓ All controls min 36px (pointer) / 44px (touch)</p>
            <p>✓ Page numbers show ellipsis for large ranges</p>
            <p>✓ Jump input appears when &gt;5 pages</p>
            <p>✓ Current page highlighted (blue background)</p>
            <p>✓ Live region announces page changes</p>
            <p>✓ Keyboard support: Tab through, Enter to navigate</p>
          </div>
        </div>
      </section>

      {/* Accessibility Features */}
      <section className="bg-white dark:bg-gray-800 shadow-sm dark:shadow-none border border-gray-200 dark:border-transparent rounded-lg p-8 space-y-4">
        <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-white">Accessibility</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-semibold text-green-700 dark:text-green-400 mb-2">Filter Chips</h3>
            <ul className="space-y-1 text-sm text-gray-600 dark:text-gray-300">
              <li>✓ role=&quot;group&quot; for container</li>
              <li>✓ role=&quot;checkbox&quot; for each chip</li>
              <li>✓ aria-checked reflects active state</li>
              <li>✓ aria-live=&quot;polite&quot; announces changes</li>
              <li>✓ Focus visible on all chips</li>
              <li>✓ Keyboard: Tab, Space/Enter to toggle</li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-green-700 dark:text-green-400 mb-2">Pagination</h3>
            <ul className="space-y-1 text-sm text-gray-600 dark:text-gray-300">
              <li>✓ nav with aria-label=&quot;Pagination&quot;</li>
              <li>✓ aria-current=&quot;page&quot; on active page</li>
              <li>✓ aria-label on prev/next buttons</li>
              <li>✓ Live region announces page changes</li>
              <li>✓ Jump input with aria-label</li>
              <li>✓ Keyboard: Tab, Enter to navigate</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Mobile Responsiveness */}
      <section className="bg-white dark:bg-gray-800 shadow-sm dark:shadow-none border border-gray-200 dark:border-transparent rounded-lg p-8 space-y-4">
        <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-white">Mobile & Touch</h2>
        <div className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-transparent rounded p-4 space-y-2 text-sm text-gray-700 dark:text-gray-300">
          <p>✓ All interactive targets: 44px minimum (WCAG 2.1 AAA)</p>
          <p>✓ Filter chips wrap on narrow screens</p>
          <p>✓ Pagination reduces to prev/next on mobile (&lt;640px)</p>
          <p>✓ Touch-friendly spacing and padding</p>
          <p>✓ No hover-only controls</p>
        </div>
      </section>

      {/* Integration Notes */}
      <section className="bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-500 rounded-lg p-8 space-y-3">
        <h3 className="font-semibold text-blue-700 dark:text-blue-400 mb-2">Integration</h3>
        <ul className="space-y-2 text-sm text-blue-800 dark:text-blue-100">
          <li>
            ✓ <strong>TransactionList</strong> - Table view with filters and
            pagination
          </li>
          <li>
            ✓ <strong>StrategyList</strong> - Card grid with multi-group
            filtering
          </li>
          <li>✓ Both demonstrate real-world usage patterns</li>
          <li>✓ Reusable across any filterable dataset</li>
        </ul>
      </section>
    </div>
  );
}
