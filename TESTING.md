# NeuroWealth Frontend Testing Strategy

## Overview

This document outlines the comprehensive testing strategy for the NeuroWealth frontend application, covering unit tests, integration tests, and end-to-end (E2E) tests.

## Testing Stack

- **Unit & Integration Tests**: Vitest + React Testing Library
- **E2E Tests**: Playwright
- **Coverage**: v8 provider
- **CI/CD**: GitHub Actions

## Running Tests

### Unit Tests

```bash
# Run tests in watch mode
yarn test

# Run tests once
yarn test:run

# Run tests with UI
yarn test:ui

# Generate coverage report
yarn test:coverage
```

### E2E Tests

```bash
# Run E2E tests
yarn e2e

# Run E2E tests with UI
yarn e2e:ui

# Debug E2E tests
yarn e2e:debug
```

## Test Structure

### Unit Tests (`src/__tests__/`)

#### Contexts
- **AuthContext.test.tsx**: Authentication flow, session management, sign in/up/out
- **WalletProvider.test.tsx**: Wallet connection, disconnection, balance refresh

#### Libraries
- **transactions.test.ts**: Transaction validation, quote building, receipt generation
- **portfolio.test.ts**: Portfolio data normalization, scenario building

#### Components
- **WalletConnectButton.test.tsx**: Wallet button rendering and interactions
- **ProtectedRoute.test.tsx**: Route protection and redirects

#### Hooks
- **usePortfolio.test.ts**: Portfolio data fetching
- **useStellarWallet.test.ts**: Wallet operations

### E2E Tests (`e2e/`)

#### auth.spec.ts
- Sign in flow
- Sign up flow
- Protected route access
- Sign out flow
- Session persistence

#### transactions.spec.ts
- Deposit transaction flow (form → confirm → pending → success)
- Withdrawal transaction flow (form → confirm → pending → success)
- Form validation (amount, address)
- Error handling

#### portfolio.spec.ts
- Portfolio dashboard display
- Asset allocation rendering
- Recent activity display
- Theme toggling
- Scenario switching

## Critical User Journeys Covered

### 1. Login Journey
```
User → Sign In Page → Enter Credentials → Dashboard
```
**Tests**: `auth.spec.ts` - "should sign in user"

### 2. Wallet Connection Journey
```
User → Click Connect → Select Wallet → Authorize → Connected State
```
**Tests**: `WalletConnectButton.test.tsx`, `useStellarWallet.test.ts`

### 3. Deposit Journey
```
User → Deposit Form → Enter Amount → Review → Confirm → Pending → Success
```
**Tests**: `transactions.spec.ts` - "should complete deposit flow"

### 4. Withdrawal Journey
```
User → Withdrawal Form → Enter Amount & Address → Review → Confirm → Pending → Success
```
**Tests**: `transactions.spec.ts` - "should complete withdrawal flow"

### 5. Portfolio View Journey
```
User → Dashboard → Load Portfolio → Display Metrics & Activity
```
**Tests**: `portfolio.spec.ts` - "should display portfolio dashboard"

## Test Coverage Goals

| Category | Target | Current |
|----------|--------|---------|
| Statements | 80% | TBD |
| Branches | 75% | TBD |
| Functions | 80% | TBD |
| Lines | 80% | TBD |

## Key Test Scenarios

### Authentication
- ✅ Sign in with valid credentials
- ✅ Sign up with new account
- ✅ Sign out clears session
- ✅ Protected routes redirect to signin
- ✅ Session persists on page reload

### Transactions
- ✅ Deposit validation (amount, wallet connection)
- ✅ Withdrawal validation (amount, address format)
- ✅ Quote generation with correct fees
- ✅ Transaction submission flow
- ✅ Success/failure receipts
- ✅ Error messages for invalid inputs

### Portfolio
- ✅ Portfolio data fetching
- ✅ Allocation display
- ✅ Activity feed rendering
- ✅ Theme switching
- ✅ Scenario toggling (live/empty)

### Wallet Integration
- ✅ Wallet connection
- ✅ Wallet disconnection
- ✅ Balance refresh
- ✅ Auto-reconnect on page reload
- ✅ localStorage persistence

## Mocking Strategy

### Stellar SDK
- Mock `Horizon.Server` for account queries
- Mock wallet kit for connection flows
- Mock transaction signing

### Next.js
- Mock `next/navigation` (useRouter, usePathname, useSearchParams)
- Mock `next/image`

### Browser APIs
- Mock `localStorage` and `sessionStorage`
- Mock `window.matchMedia`
- Mock `IntersectionObserver`

### API Routes
- Mock fetch responses for portfolio and transaction endpoints
- Simulate success/failure scenarios

## CI/CD Integration

### GitHub Actions Workflow

The `.github/workflows/test.yml` workflow runs:

1. **Unit Tests** (Node 18.x, 20.x)
   - Linting
   - Unit tests with coverage
   - Coverage upload to Codecov

2. **E2E Tests**
   - Build application
   - Run Playwright tests
   - Upload test report

3. **Build Verification**
   - Build application
   - Verify build output

### Running Tests on PR

Tests automatically run on:
- Push to `main`, `develop`, or `feature/**` branches
- Pull requests to `main` or `develop`

## Best Practices

### Writing Tests

1. **Use descriptive test names**
   ```typescript
   it('should validate deposit amount is above minimum', () => {
     // test code
   });
   ```

2. **Follow AAA pattern** (Arrange, Act, Assert)
   ```typescript
   it('should sign in user', async () => {
     // Arrange
     const user = userEvent.setup();
     render(<SignInForm />);
     
     // Act
     await user.fill(emailInput, 'test@example.com');
     await user.click(submitButton);
     
     // Assert
     expect(screen.getByText('Welcome')).toBeInTheDocument();
   });
   ```

3. **Test behavior, not implementation**
   - Test what users see and do
   - Avoid testing internal state directly

4. **Use semantic queries**
   ```typescript
   // Good
   screen.getByRole('button', { name: /sign in/i });
   screen.getByLabelText(/email/i);
   
   // Avoid
   screen.getByTestId('submit-btn');
   ```

### E2E Tests

1. **Test critical user journeys**
   - Focus on happy paths and common errors
   - Avoid testing every edge case (that's for unit tests)

2. **Use page objects for maintainability**
   ```typescript
   class LoginPage {
     async goto() { await page.goto('/signin'); }
     async signIn(email, password) { /* ... */ }
   }
   ```

3. **Keep tests independent**
   - Each test should be able to run in isolation
   - Use `beforeEach` for common setup

## Debugging Tests

### Unit Tests
```bash
# Run specific test file
yarn test src/__tests__/lib/transactions.test.ts

# Run tests matching pattern
yarn test --grep "should validate"

# Debug in Node inspector
node --inspect-brk ./node_modules/vitest/vitest.mjs run
```

### E2E Tests
```bash
# Debug mode with inspector
yarn e2e:debug

# Run specific test file
yarn e2e e2e/auth.spec.ts

# Run specific test
yarn e2e -g "should sign in user"
```

## Continuous Improvement

### Metrics to Track
- Test coverage percentage
- Test execution time
- Flaky test rate
- Bug escape rate (bugs found in production)

### Regular Reviews
- Monthly coverage reports
- Quarterly test strategy review
- Identify untested critical paths

## Resources

- [Vitest Documentation](https://vitest.dev/)
- [React Testing Library](https://testing-library.com/react)
- [Playwright Documentation](https://playwright.dev/)
- [Testing Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)
