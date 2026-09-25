# Component Patterns

## DataBoundary

`DataBoundary` is a reusable UI component for handling data loading states, errors, and success states in a consistent manner across the application.

### When to Use DataBoundary

Use `DataBoundary` for:
- **Data-dependent sections** within a page that have their own loading, error, and success states
- **Independent chunks** of content that can fail or load independently from the rest of the page
- **Modal or drawer content** that needs to manage its own data lifecycle
- **Nested layouts** where different sections have different data sources

**Do not use** `DataBoundary` for:
- Page-level loading states (use page-level skeleton or loading UI instead)
- Global application state errors
- Content that always loads synchronously

### Page-Level vs DataBoundary

#### Page-Level Loading/Error
Use when the entire page depends on the same data:
```tsx
export default function DashboardPage() {
  const { data, loading, error } = usePortfolioData();

  if (loading) return <DashboardSkeleton />;
  if (error) return <ErrorPage error={error} />;

  return <Dashboard data={data} />;
}
```

#### DataBoundary
Use when specific sections have independent data:
```tsx
export default function DashboardPage() {
  const [portfolioLoading, portfolioError, portfolio] = usePortfolioData();
  const [activitiesLoading, activitiesError, activities] = useActivities();

  return (
    <div className="grid gap-4">
      <DataBoundary
        loading={portfolioLoading}
        error={portfolioError}
        onRetry={() => refetchPortfolio()}
        skeleton={<PortfolioSkeleton />}
        label="portfolio data"
      >
        <PortfolioCard data={portfolio!} />
      </DataBoundary>

      <DataBoundary
        loading={activitiesLoading}
        error={activitiesError}
        onRetry={() => refetchActivities()}
        skeleton={<ActivitiesSkeleton />}
        label="recent activity"
      >
        <ActivityList items={activities!} />
      </DataBoundary>
    </div>
  );
}
```

### API

```tsx
interface DataBoundaryProps {
  loading: boolean;
  error: Error | null;
  onRetry?: () => void;
  skeleton?: React.ReactNode;
  label?: string;
  children: React.ReactNode;
}
```

- **loading**: Whether data is being fetched
- **error**: Error object, if any occurred
- **onRetry**: Callback function when user clicks retry button (optional)
- **skeleton**: Custom loading UI shown while loading. Defaults to a generic skeleton (optional)
- **label**: Context label for error messages, e.g., "portfolio data", "user settings" (optional, defaults to "data")
- **children**: Content to render on success

### Examples

#### Basic Usage
```tsx
<DataBoundary
  loading={isLoading}
  error={error}
  skeleton={<MyComponentSkeleton />}
>
  <MyComponent data={data} />
</DataBoundary>
```

#### With Retry Handler
```tsx
<DataBoundary
  loading={isLoading}
  error={error}
  onRetry={() => refetch()}
  skeleton={<MyComponentSkeleton />}
  label="transaction details"
>
  <TransactionDetails transaction={transaction!} />
</DataBoundary>
```

#### In a Modal
```tsx
function TransactionModal({ transactionId }) {
  const { data, loading, error, refetch } = useTransaction(transactionId);

  return (
    <Modal>
      <DataBoundary
        loading={loading}
        error={error}
        onRetry={refetch}
        skeleton={<TransactionSkeleton />}
        label="transaction"
      >
        <TransactionForm transaction={data!} />
      </DataBoundary>
    </Modal>
  );
}
```

### States

#### Loading State
When `loading` is `true`:
- Shows the `skeleton` prop (or a generic skeleton if not provided)
- Disables user interactions appropriately

#### Error State
When `error` is not `null`:
- Shows an inline error banner with the error message
- Displays the provided `label` for context ("Failed to load {label}")
- Shows a retry button if `onRetry` is provided

#### Success State
When `loading` is `false` and `error` is `null`:
- Renders the provided `children`

### Error Messages
Error messages are auto-generated based on the `label` prop:
- "Failed to load {label}" (e.g., "Failed to load portfolio data")
- The error's actual message is displayed as secondary text

If you need more context-specific error messages, handle the error state separately at the page level rather than relying on DataBoundary.
