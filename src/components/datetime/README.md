# Date/Time Picker Components

Accessible, reusable date/time selection components with comprehensive keyboard navigation and screen reader support.

## Components

### DatePicker

Single date selection with calendar view.

**Features:**

- 7×6 calendar grid with min 36px cells
- Month navigation
- Today shortcut
- Min/max date constraints
- Keyboard navigation (arrow keys, enter, escape)

```tsx
import DatePicker from "@/components/datetime/DatePicker";

export function MyComponent() {
  const [date, setDate] = useState<Date | null>(null);
  return (
    <DatePicker
      value={date}
      onChange={setDate}
      placeholder="Select date"
      minDate={new Date(2024, 0, 1)}
      maxDate={new Date(2024, 11, 31)}
    />
  );
}
```

### TimePicker

Time selection with searchable time slots.

**Features:**

- Configurable steps: 5, 10, or 15 minutes
- 24h or 12h format (AM/PM)
- Searchable dropdown
- Keyboard navigation
- Touch-friendly (44px targets)

```tsx
import TimePicker from "@/components/datetime/TimePicker";

export function MyComponent() {
  const [time, setTime] = useState<TimeValue | null>(null);
  return (
    <TimePicker
      value={time}
      onChange={setTime}
      step={15}
      use24h={true}
      placeholder="Select time"
    />
  );
}
```

### DateRangePicker

Date range selection with dual calendar view.

**Features:**

- Dual calendar for easy range selection
- Distinct start (blue) and end (teal) emphasis
- Range highlighting (subtle fill)
- Keyboard navigation
- Clear selection button
- Responsive layout

```tsx
import DateRangePicker from "@/components/datetime/DateRangePicker";

export function MyComponent() {
  const [range, setRange] = useState({ start: null, end: null });
  return (
    <DateRangePicker
      value={range}
      onChange={setRange}
      placeholder="Select date range"
    />
  );
}
```

## Filtering Hooks

Mock hooks for filtering datasets by date/time selections.

### useDateFilter

Filter data by single date selection.

```tsx
import { useDateFilter } from "@/hooks/useDateRangeFilter";

export function MyComponent() {
  const { date, setDate, filtered, count } = useDateFilter(data);

  return (
    <>
      <DatePicker value={date} onChange={setDate} />
      <p>Results: {count} items</p>
    </>
  );
}
```

### useDateRangeFilter

Filter data by date range.

```tsx
import { useDateRangeFilter } from "@/hooks/useDateRangeFilter";

export function MyComponent() {
  const { range, setRange, filtered, count } = useDateRangeFilter(data);

  return (
    <>
      <DateRangePicker value={range} onChange={setRange} />
      <p>Results: {count} items</p>
    </>
  );
}
```

### useTimeRangeFilter

Filter data by time range.

```tsx
import { useTimeRangeFilter } from "@/hooks/useDateRangeFilter";

export function MyComponent() {
  const { startTime, setStartTime, endTime, setEndTime, filtered } =
    useTimeRangeFilter(data);

  return (
    <>
      <TimePicker value={startTime} onChange={setStartTime} />
      <TimePicker value={endTime} onChange={setEndTime} />
      <ul>
        {filtered.map((item) => (
          <li key={item.id}>{item.description}</li>
        ))}
      </ul>
    </>
  );
}
```

### useDateTimeRangeFilter

Filter data by both date AND time range.

```tsx
import { useDateTimeRangeFilter } from "@/hooks/useDateRangeFilter";

export function MyComponent() {
  const {
    dateRange,
    setDateRange,
    startTime,
    setStartTime,
    endTime,
    setEndTime,
    filtered,
  } = useDateTimeRangeFilter(data);

  return (
    <>
      <DateRangePicker value={dateRange} onChange={setDateRange} />
      <TimePicker value={startTime} onChange={setStartTime} />
      <TimePicker value={endTime} onChange={setEndTime} />
      <ul>
        {filtered.map((item) => (
          <li key={item.id}>{item.description}</li>
        ))}
      </ul>
    </>
  );
}
```

## Accessibility

All components meet WCAG 2.1 AA standards:

### Keyboard Navigation

| Key                        | Action                    |
| -------------------------- | ------------------------- |
| `Enter` / `Space`          | Open picker               |
| `Arrow Up/Down/Left/Right` | Navigate calendar or list |
| `Enter`                    | Select date/time          |
| `Escape`                   | Close picker              |
| `Tab`                      | Move to next element      |

### Screen Reader Support

- Descriptive `aria-label` on all buttons
- Proper `role` attributes (dialog, listbox, option)
- `aria-pressed` / `aria-selected` for selected states
- Date cells include full date descriptions
- Navigation buttons labeled clearly
- Focus management within dialogs

### Mobile Support

- Touch targets minimum 44px (date cells 36px + padding)
- Vertical scrolling in time picker
- Positioned to avoid keyboard overlap
- Responsive layout for all screen sizes

## Design Tokens (per Spec)

- **Calendar grid:** 7×6 cells
- **Cell minimum height:** 36px
- **Time step options:** 5, 10, 15 minutes
- **Range selection:** Distinct start (blue) and end (teal) emphasis
- **Today indicator:** Subtle border
- **Selected state:** Solid background color

## Responsive Behavior

All components work seamlessly on mobile, tablet, and desktop:

- Pickers positioned intelligently to avoid viewport overflow
- Touch-friendly spacing maintained across devices
- Responsive calendar grid layout
- Time picker scrolls vertically on mobile
- Labels and status text adapt to screen size

## Usage in Filters

Designed for use in transaction history, activity logs, and other filterable datasets:

```tsx
export function TransactionHistory() {
  const { filtered, setDateRange } = useDateRangeFilter(transactions);

  return (
    <div>
      <DateRangePicker onChange={setDateRange} />
      <table>
        <tbody>
          {filtered.map((tx) => (
            <tr key={tx.id}>
              <td>{tx.date.toLocaleDateString()}</td>
              <td>{tx.description}</td>
              <td>${tx.amount.toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
```

## Demo

View all components and hooks in action at `/demo/datetime`
