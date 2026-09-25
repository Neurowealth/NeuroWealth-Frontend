"use client";

import { useState, useMemo } from "react";
import DatePicker from "@/components/datetime/DatePicker";
import TimePicker, { TimeValue } from "@/components/datetime/TimePicker";
import DateRangePicker from "@/components/datetime/DateRangePicker";
import { formatDate } from "@/lib/formatters";
import {
  useDateFilter,
  useDateRangeFilter,
  useTimeRangeFilter,
  useDateTimeRangeFilter,
  type FilteredData,
  type DateRange,
} from "@/hooks/useDateRangeFilter";

// Mock transaction data for filtering demo
const MOCK_DATA: FilteredData[] = [
  {
    id: "tx-1",
    date: new Date(2024, 5, 15, 9, 30),
    amount: 150.5,
    description: "Strategy execution",
  },
  {
    id: "tx-2",
    date: new Date(2024, 5, 15, 14, 45),
    amount: 250.0,
    description: "Portfolio rebalance",
  },
  {
    id: "tx-3",
    date: new Date(2024, 5, 16, 10, 15),
    amount: 500.0,
    description: "Deposit",
  },
  {
    id: "tx-4",
    date: new Date(2024, 5, 17, 11, 0),
    amount: 100.0,
    description: "Fee deduction",
  },
  {
    id: "tx-5",
    date: new Date(2024, 5, 20, 8, 30),
    amount: 1000.0,
    description: "Large investment",
  },
  {
    id: "tx-6",
    date: new Date(2024, 6, 1, 15, 20),
    amount: 75.25,
    description: "Withdrawal",
  },
];

export default function DateTimeDemoPage() {
  const [activeTab, setActiveTab] = useState("pickers");

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 py-12 px-6">
      <div className="max-w-6xl mx-auto space-y-12">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-4xl font-bold">Date/Time Pickers & Filters</h1>
          <p className="text-gray-400">
            Accessible date, time, and range selection components with mock
            filtering hooks
          </p>
        </div>

        {/* Tabs */}
        <div
          role="tablist"
          aria-label="Date/time picker demo sections"
          className="flex gap-4 border-b border-gray-700"
        >
          <button
            role="tab"
            id="datetime-tab-pickers"
            aria-selected={activeTab === "pickers"}
            aria-controls="datetime-panel-pickers"
            onClick={() => setActiveTab("pickers")}
            className={`px-4 py-2 font-medium border-b-2 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400/70 ${
              activeTab === "pickers"
                ? "border-blue-500 text-blue-400"
                : "border-transparent text-gray-400 hover:text-gray-300"
            }`}
          >
            Pickers
          </button>
          <button
            role="tab"
            id="datetime-tab-filters"
            aria-selected={activeTab === "filters"}
            aria-controls="datetime-panel-filters"
            onClick={() => setActiveTab("filters")}
            className={`px-4 py-2 font-medium border-b-2 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400/70 ${
              activeTab === "filters"
                ? "border-blue-500 text-blue-400"
                : "border-transparent text-gray-400 hover:text-gray-300"
            }`}
          >
            Filtering Hooks
          </button>
          <button
            role="tab"
            id="datetime-tab-a11y"
            aria-selected={activeTab === "a11y"}
            aria-controls="datetime-panel-a11y"
            onClick={() => setActiveTab("a11y")}
            className={`px-4 py-2 font-medium border-b-2 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400/70 ${
              activeTab === "a11y"
                ? "border-blue-500 text-blue-400"
                : "border-transparent text-gray-400 hover:text-gray-300"
            }`}
          >
            Accessibility
          </button>
        </div>

        {/* Content */}
        <div
          id="datetime-panel-pickers"
          role="tabpanel"
          aria-labelledby="datetime-tab-pickers"
          hidden={activeTab !== "pickers"}
          tabIndex={0}
        >
          <PickersTab />
        </div>
        <div
          id="datetime-panel-filters"
          role="tabpanel"
          aria-labelledby="datetime-tab-filters"
          hidden={activeTab !== "filters"}
          tabIndex={0}
        >
          <FiltersTab mockData={MOCK_DATA} />
        </div>
        <div
          id="datetime-panel-a11y"
          role="tabpanel"
          aria-labelledby="datetime-tab-a11y"
          hidden={activeTab !== "a11y"}
          tabIndex={0}
        >
          <AccessibilityTab />
        </div>
      </div>
    </div>
  );
}

function PickersTab() {
  const [date, setDate] = useState<Date | null>(null);
  const [time, setTime] = useState<TimeValue | null>(null);
  const [range, setRange] = useState<DateRange>({ start: null, end: null });

  return (
    <div className="space-y-8">
      {/* Date Picker */}
      <section className="bg-gray-800 rounded-lg p-6 space-y-4">
        <div>
          <h2 className="text-xl font-semibold mb-2">Date Picker</h2>
          <p className="text-sm text-gray-400">
            7×6 calendar grid, min 36px cells, keyboard navigation
          </p>
        </div>
        <div className="flex items-center gap-4">
          <DatePicker
            value={date}
            onChange={setDate}
            placeholder="Select a date"
          />
          <div className="text-sm">
            <p className="text-gray-400">Selected:</p>
            <p className="font-mono">
              {date ? formatDate(date) : "—"}
            </p>
          </div>
        </div>
      </section>

      {/* Time Picker */}
      <section className="bg-gray-800 rounded-lg p-6 space-y-4">
        <div>
          <h2 className="text-xl font-semibold mb-2">Time Picker</h2>
          <p className="text-sm text-gray-400">
            Configurable steps (5, 10, 15 minutes), searchable
          </p>
        </div>
        <div className="space-y-4">
          {([5, 10, 15] as const).map((step) => (
            <div key={step} className="flex items-center gap-4">
              <TimePicker
                value={time}
                onChange={setTime}
                step={step}
                placeholder={`Step ${step}m`}
              />
              <span className="text-sm text-gray-400">
                Step: {step} minutes
              </span>
            </div>
          ))}
        </div>
        <div className="text-sm">
          <p className="text-gray-400">Selected:</p>
          <p className="font-mono">
            {time
              ? `${String(time.hours).padStart(2, "0")}:${String(time.minutes).padStart(2, "0")}`
              : "—"}
          </p>
        </div>
      </section>

      {/* Date Range Picker */}
      <section className="bg-gray-800 rounded-lg p-6 space-y-4">
        <div>
          <h2 className="text-xl font-semibold mb-2">Date Range Picker</h2>
          <p className="text-sm text-gray-400">
            Dual calendar, distinct start (blue) & end (teal) emphasis, range
            highlighting
          </p>
        </div>
        <div className="flex items-center gap-4">
          <DateRangePicker value={range} onChange={setRange} />
          <div className="text-sm">
            <p className="text-gray-400">Selected:</p>
            <p className="font-mono">
              {range.start && range.end
                ? `${formatDate(range.start)} &rarr; ${formatDate(range.end)}`
                : "—"}
            </p>
          </div>
        </div>

        {/* Legend */}
        <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-700">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-blue-500 rounded" />
            <span className="text-xs text-gray-400">Start Date</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-teal-700 rounded" />
            <span className="text-xs text-gray-400">End Date</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-blue-500 opacity-20 rounded" />
            <span className="text-xs text-gray-400">Range</span>
          </div>
        </div>
      </section>

      {/* Responsive Note */}
      <div className="bg-blue-900 bg-opacity-30 border border-blue-500 rounded-lg p-4">
        <p className="text-sm">
          ✓ All pickers are fully responsive and work on mobile, tablet, and
          desktop
        </p>
      </div>
    </div>
  );
}

interface FiltersTabProps {
  mockData: FilteredData[];
}

function FiltersTab({ mockData }: FiltersTabProps) {
  const dateFilter = useDateFilter(mockData);
  const rangeFilter = useDateRangeFilter(mockData);
  const timeFilter = useTimeRangeFilter(mockData);
  const dateTimeFilter = useDateTimeRangeFilter(mockData);

  return (
    <div className="space-y-8">
      {/* Date Filter Demo */}
      <section className="bg-gray-800 rounded-lg p-6 space-y-4">
        <h2 className="text-xl font-semibold">useDateFilter Hook</h2>
        <DatePicker
          value={dateFilter.date}
          onChange={dateFilter.setDate}
          placeholder="Select date to filter"
        />
        <FilterResultsDisplay
          count={dateFilter.count}
          total={mockData.length}
          data={dateFilter.filtered}
        />
      </section>

      {/* Date Range Filter Demo */}
      <section className="bg-gray-800 rounded-lg p-6 space-y-4">
        <h2 className="text-xl font-semibold">useDateRangeFilter Hook</h2>
        <DateRangePicker
          value={rangeFilter.range}
          onChange={rangeFilter.setRange}
          placeholder="Select date range"
        />
        <FilterResultsDisplay
          count={rangeFilter.count}
          total={mockData.length}
          data={rangeFilter.filtered}
        />
      </section>

      {/* Time Range Filter Demo */}
      <section className="bg-gray-800 rounded-lg p-6 space-y-4">
        <h2 className="text-xl font-semibold">useTimeRangeFilter Hook</h2>
        <div className="flex gap-4">
          <div>
            <label className="text-sm text-gray-400 block mb-2">From</label>
            <TimePicker
              value={timeFilter.startTime}
              onChange={timeFilter.setStartTime}
              step={15}
              placeholder="Start time"
            />
          </div>
          <div>
            <label className="text-sm text-gray-400 block mb-2">To</label>
            <TimePicker
              value={timeFilter.endTime}
              onChange={timeFilter.setEndTime}
              step={15}
              placeholder="End time"
            />
          </div>
        </div>
        <FilterResultsDisplay
          count={timeFilter.count}
          total={mockData.length}
          data={timeFilter.filtered}
        />
      </section>

      {/* Combined DateTime Filter */}
      <section className="bg-gray-800 rounded-lg p-6 space-y-4">
        <h2 className="text-xl font-semibold">useDateTimeRangeFilter Hook</h2>
        <div className="space-y-4">
          <DateRangePicker
            value={dateTimeFilter.dateRange}
            onChange={dateTimeFilter.setDateRange}
            placeholder="Select date range"
          />
          <div className="flex gap-4">
            <div>
              <label className="text-sm text-gray-400 block mb-2">From</label>
              <TimePicker
                value={dateTimeFilter.startTime}
                onChange={dateTimeFilter.setStartTime}
                step={15}
              />
            </div>
            <div>
              <label className="text-sm text-gray-400 block mb-2">To</label>
              <TimePicker
                value={dateTimeFilter.endTime}
                onChange={dateTimeFilter.setEndTime}
                step={15}
              />
            </div>
          </div>
        </div>
        <FilterResultsDisplay
          count={dateTimeFilter.count}
          total={mockData.length}
          data={dateTimeFilter.filtered}
        />
      </section>
    </div>
  );
}

interface FilterResultsDisplayProps {
  count: number;
  total: number;
  data: FilteredData[];
}

function FilterResultsDisplay({
  count,
  total,
  data,
}: FilterResultsDisplayProps) {
  return (
    <div className="space-y-3">
      <div className="text-sm">
        <p className="text-gray-400">
          Results: <span className="font-mono font-semibold">{count}</span> of{" "}
          <span className="font-mono">{total}</span>
        </p>
      </div>
      <div className="bg-gray-900 rounded p-3 max-h-48 overflow-y-auto space-y-2">
        {data.length === 0 ? (
          <p className="text-sm text-gray-500 text-center py-4">
            No results matching filter
          </p>
        ) : (
          data.map((item) => (
            <div
              key={item.id}
              className="text-xs border border-gray-700 rounded p-2"
            >
              <p className="font-mono text-blue-400">{item.id}</p>
              <p className="text-gray-400">
                {item.date.toLocaleString("en-US")}
              </p>
              <p className="text-gray-300">{item.description}</p>
              <p className="text-green-400 font-mono">
                ${item.amount.toFixed(2)}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function AccessibilityTab() {
  return (
    <div className="space-y-6">
      <section className="bg-gray-800 rounded-lg p-6 space-y-4">
        <h2 className="text-xl font-semibold">Keyboard Navigation</h2>
        <ul className="space-y-3 text-sm">
          <li className="flex gap-3">
            <code className="bg-gray-900 px-2 py-1 rounded text-blue-400 min-w-fit">
              Enter / Space
            </code>
            <span className="text-gray-300">Open picker</span>
          </li>
          <li className="flex gap-3">
            <code className="bg-gray-900 px-2 py-1 rounded text-blue-400 min-w-fit">
              Arrow Keys
            </code>
            <span className="text-gray-300">Navigate calendar/time slots</span>
          </li>
          <li className="flex gap-3">
            <code className="bg-gray-900 px-2 py-1 rounded text-blue-400 min-w-fit">
              Enter
            </code>
            <span className="text-gray-300">Select date/time</span>
          </li>
          <li className="flex gap-3">
            <code className="bg-gray-900 px-2 py-1 rounded text-blue-400 min-w-fit">
              Escape
            </code>
            <span className="text-gray-300">Close picker</span>
          </li>
        </ul>
      </section>

      <section className="bg-gray-800 rounded-lg p-6 space-y-4">
        <h2 className="text-xl font-semibold">Screen Reader Labels</h2>
        <ul className="space-y-3 text-sm text-gray-300">
          <li>✓ All buttons have descriptive aria-labels</li>
          <li>✓ Calendar role=&quot;dialog&quot; with proper labeling</li>
          <li>
            ✓ Time picker uses role=&quot;listbox&quot; with
            role=&quot;option&quot;
          </li>
          <li>✓ Selected state announced via aria-pressed/aria-selected</li>
          <li>
            ✓ Date cells describe full date (e.g., &quot;Tuesday, June 15,
            2024&quot;)
          </li>
          <li>✓ Navigation buttons labeled (Previous/Next month)</li>
          <li>✓ Focus management within dialogs</li>
        </ul>
      </section>

      <section className="bg-gray-800 rounded-lg p-6 space-y-4">
        <h2 className="text-xl font-semibold">Mobile Support</h2>
        <ul className="space-y-2 text-sm text-gray-300">
          <li>✓ Touch targets ≥44px (date cells 36px + padding)</li>
          <li>✓ Time picker vertical scrolling optimized</li>
          <li>✓ Pickers positioned to avoid keyboard overlap</li>
          <li>✓ Range picker uses two-finger selection on mobile</li>
        </ul>
      </section>

      <section className="bg-gray-800 rounded-lg p-6 space-y-4">
        <h2 className="text-xl font-semibold">Focus Management</h2>
        <ul className="space-y-2 text-sm text-gray-300">
          <li>✓ Focus ring on all interactive elements</li>
          <li>✓ Focus trapped within open picker (Tab/Shift+Tab)</li>
          <li>✓ Focus restored to trigger button on close</li>
          <li>✓ Keyboard focus visible in high contrast mode</li>
        </ul>
      </section>
    </div>
  );
}
