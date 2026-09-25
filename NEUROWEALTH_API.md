# NEUROWEALTH_API Contract

This document specifies the HTTP API contract between the NeuroWealth frontend and its backend service. All requests and responses must adhere to these specifications for the frontend to function correctly.

## Overview

<!-- - **Base URL**: Configured via `NEUROWEALTH_API_BASE_URL` environment variable
- **Authentication**: Bearer token in `Authorization` header (server-side only)
- **Response format**: All responses must conform to the unified envelope
- **Timeout**: 10 seconds (configurable per request via `apiRequest` options) -->

## Environment Variables

| Variable                        | Required | Default                | Purpose                                                                |
| ------------------------------- | -------- | ---------------------- | ---------------------------------------------------------------------- |
| `NEUROWEALTH_API_BASE_URL`      | No       | N/A                    | Base URL of the backend API. If unset, frontend runs in demo mode.     |
| `NEUROWEALTH_API_AUTH_TOKEN`    | No       | N/A                    | Bearer token for server→backend requests. Required if BASE_URL is set. |
| `NEUROWEALTH_PORTFOLIO_PATH`    | No       | `/portfolio/overview`  | Path to the portfolio endpoint relative to base URL                    |
| `NEUROWEALTH_TRANSACTIONS_PATH` | No       | `/transactions`        | Path to the transactions endpoint relative to base URL                 |
| `NEUROWEALTH_STRATEGY_PATH`     | No       | `/strategy/preference` | Path to the strategy/preference endpoint relative to base URL          |

## Response Envelope

All backend responses must conform to this structure:

### Success Response

```json
{
  "success": true,
  "data": {
    // Endpoint-specific payload
  }
}
```

**Example:**

```json
{
  "success": true,
  "data": {
    "summary": {
      "totalBalance": 46320.82,
      "totalYield": 2941.16,
      "apy": 8.4,
      "strategy": "balanced",
      "strategyLabel": "Balanced",
      "strategyDescription": "Yield split across Blend lending, DEX liquidity, and a protective stable reserve."
    },
    "allocation": [
      { "id": "alloc-usdc-lend", "label": "Blend USDC lending", "symbol": "USDC", "amount": 22420.45, "share": 48.4, "change": 1.2, "tone": "primary" }
    ],
    "activity": [
      { "id": "event-yield", "kind": "yield", "title": "Yield settled", "detail": "Daily earnings swept into your core balance.", "occurredAt": "2026-03-24T07:42:00.000Z", "amount": 142.38, "status": "completed" }
    ],
    "updatedAt": "2026-03-24T08:42:00.000Z",
    "source": "demo",
    "notice": "Using preview data until NEUROWEALTH_API_BASE_URL is configured for the live backend."
  }
}
```

### Error Response

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message",
    "details": {
      "fieldName": ["Field-specific error message"],
      "anotherField": ["Error 1", "Error 2"]
    }
  }
}
```

**Example:**

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_FAILED",
    "message": "Request validation failed",
    "details": {
      "amount": ["Amount must be greater than 0"],
      "currency": ["Unsupported currency"]
    }
  }
}
```

## Error Codes

Standard error codes the frontend recognizes:

| Code                    | HTTP Status | Meaning                                  | Handling                         |
| ----------------------- | ----------- | ---------------------------------------- | -------------------------------- |
| `REQUEST_TIMEOUT`       | 408         | Request exceeded 10s timeout             | Retry with backoff               |
| `NETWORK_ERROR`         | 503         | Network unavailable (DNS, refused, etc.) | Show "Service unavailable"       |
| `INVALID_JSON`          | 500         | Response body not valid JSON             | Log and show generic error       |
| `INVALID_ENVELOPE`      | 500         | Response missing success/error fields    | Log and show generic error       |
| `UNAUTHORIZED`          | 401         | Bearer token invalid or expired          | Redirect to re-auth              |
| `FORBIDDEN`             | 403         | User lacks permission for resource       | Show "Access denied"             |
| `NOT_FOUND`             | 404         | Resource does not exist                  | Show "Not found"                 |
| `VALIDATION_FAILED`     | 400         | Request body validation failed           | Show field errors from `details` |
| `CONFLICT`              | 409         | Resource conflict (e.g., duplicate key)  | Show conflict message            |
| `INTERNAL_SERVER_ERROR` | 500         | Backend error                            | Log and show generic error       |

Custom error codes from the backend are forwarded verbatim to the frontend. The frontend logs them and displays a generic error message unless specific handling is implemented.

## API Endpoints

### 1. Portfolio Overview

**Endpoint**: `GET /portfolio/overview`

Fetches the user's portfolio summary.

**Frontend route**: `GET /api/portfolio`

**Request**:

```
Authorization: Bearer <token>
Accept: application/json
```

**Success response (200)**:

```json
{
  "success": true,
  "data": {
    "summary": {
      "totalBalance": 46320.82,
      "totalYield": 2941.16,
      "apy": 8.4,
      "strategy": "balanced",
      "strategyLabel": "Balanced",
      "strategyDescription": "Yield split across Blend lending, DEX liquidity, and a protective stable reserve."
    },
    "allocation": [
      {
        "id": "alloc-usdc-lend",
        "label": "Blend USDC lending",
        "symbol": "USDC",
        "amount": 22420.45,
        "share": 48.4,
        "change": 1.2,
        "tone": "primary"
      },
      {
        "id": "alloc-dex-lp",
        "label": "Stellar DEX LP",
        "symbol": "XLM",
        "amount": 12860.11,
        "share": 27.8,
        "change": 2.4,
        "tone": "accent"
      }
    ],
    "activity": [
      {
        "id": "event-yield",
        "kind": "yield",
        "title": "Yield settled",
        "detail": "Daily earnings swept into your core balance.",
        "occurredAt": "2026-03-24T07:42:00.000Z",
        "amount": 142.38,
        "status": "completed"
      },
      {
        "id": "event-deposit",
        "kind": "deposit",
        "title": "Deposit confirmed",
        "detail": "Wallet deposit routed to the Balanced strategy.",
        "occurredAt": "2026-03-23T18:22:00.000Z",
        "amount": 8500,
        "status": "completed"
      }
    ],
    "updatedAt": "2026-03-24T08:42:00.000Z",
    "source": "demo",
    "notice": "Using preview data until NEUROWEALTH_API_BASE_URL is configured for the live backend."
  }
}
```

**Error responses**:

- `401 UNAUTHORIZED`: Token invalid or expired
- `403 FORBIDDEN`: User account not active
- `500 INTERNAL_SERVER_ERROR`: Backend error

---

### 2. Transaction History

**Endpoint**: `GET /transactions`

Fetches paginated transaction history for the user.

**Frontend route**: `GET /api/transactions?skip=0&limit=20`

**Query parameters**:

- `skip` (number, default 0): Number of items to skip
- `limit` (number, default 20): Number of items to return (max 100)
- `status` (string, optional): Filter by status (completed, pending, failed, cancelled)
- `type` (string, optional): Filter by type (transfer, deposit, withdrawal, swap)

**Request**:

```
Authorization: Bearer <token>
Accept: application/json
```

**Success response (200)**:

```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": "tx-abc123",
        "date": "2024-06-15T14:30:00Z",
        "description": "ETH transfer to vault",
        "amount": 1.5,
        "currency": "ETH",
        "status": "completed",
        "type": "transfer",
        "wallet": "MetaMask",
        "fee": 0.001,
        "txHash": "0x..."
      }
    ],
    "total": 87,
    "skip": 0,
    "limit": 20
  }
}
```

**Error responses**:

- `400 VALIDATION_FAILED`: Invalid `skip`, `limit`, `status`, or `type`
- `401 UNAUTHORIZED`: Token invalid or expired
- `500 INTERNAL_SERVER_ERROR`: Backend error

---

### 3. Strategy Preference

**Endpoint**: `GET /strategy/preference`

Fetches the user's current strategy and risk profile.

**Frontend route**: `GET /api/strategy`

**Request**:

```
Authorization: Bearer <token>
Accept: application/json
```

**Success response (200)**:

```json
{
  "success": true,
  "data": {
    "strategy": "balanced",
    "riskProfile": "moderate",
    "targetAllocation": {
      "stocks": 50,
      "bonds": 30,
      "crypto": 20
    },
    "createdAt": "2024-01-15T10:00:00Z",
    "updatedAt": "2024-06-10T14:30:00Z"
  }
}
```

**Error responses**:

- `401 UNAUTHORIZED`: Token invalid or expired
- `404 NOT_FOUND`: User has not set a strategy
- `500 INTERNAL_SERVER_ERROR`: Backend error

---

### 4. Update Strategy Preference

**Endpoint**: `POST /strategy/preference`

Updates the user's strategy and risk profile.

**Frontend route**: `POST /api/strategy`

**Request body**:

```json
{
  "strategy": "growth",
  "riskProfile": "aggressive",
  "targetAllocation": {
    "stocks": 60,
    "bonds": 20,
    "crypto": 20
  }
}
```

**Success response (200)**:

```json
{
  "success": true,
  "data": {
    "strategy": "growth",
    "riskProfile": "aggressive",
    "targetAllocation": {
      "stocks": 60,
      "bonds": 20,
      "crypto": 20
    },
    "updatedAt": "2024-06-15T15:45:00Z"
  }
}
```

**Error responses**:

- `400 VALIDATION_FAILED`: Invalid strategy or allocation values
  - `strategy`: ["Must be one of: balanced, conservative, growth"]
  - `targetAllocation`: ["Sum of allocations must equal 100"]
- `401 UNAUTHORIZED`: Token invalid or expired
- `500 INTERNAL_SERVER_ERROR`: Backend error

---

## Client-Side Integration

### Making authenticated requests (frontend)

Browser requests to Next.js `/api/*` routes are authenticated via the session cookie (`nw_session`). This cookie is client-readable (not httpOnly) and unsigned in the current mock-auth setup. No extra header is needed:

```typescript
// Browser → Next.js (cookie auth automatic)
const portfolio = await apiRequest<PortfolioPayload>("/api/portfolio");
```

### Making authenticated requests (server-side)

Server route handlers must use `createServerApiClient()` to proxy to the backend:

```typescript
// Route handler: GET /api/portfolio
import { createServerApiClient } from "@/lib/api-client";

export async function GET(request: NextRequest) {
  const client = createServerApiClient();

  if (!client) {
    // Backend not configured — return demo data
    return NextResponse.json({
      success: true,
      data: {
        /* mock portfolio */
      },
    });
  }

  try {
    const portfolio = await client<PortfolioPayload>("/portfolio/overview");
    return NextResponse.json({ success: true, data: portfolio });
  } catch (error) {
    if (error instanceof ApiRequestError) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: error.code,
            message: error.message,
            details: error.details,
          },
        },
        { status: error.status },
      );
    }
    throw error;
  }
}
```

### Error handling

The frontend's `apiRequest` function automatically:

1. Validates the response envelope
2. Throws `ApiRequestError` with a `code`, `message`, `status`, and `details`
3. Handles timeouts (408) and network errors (503)

```typescript
try {
  const data = await apiRequest<T>("/api/endpoint");
} catch (error) {
  if (error instanceof ApiRequestError) {
    console.error(`[${error.code}] ${error.message}`, error.details);
    // Handle by code or status
    if (error.status === 401) {
      // Redirect to login
    }
  }
}
```

## Demo Mode

When `NEUROWEALTH_API_BASE_URL` is **not** set:

- `createServerApiClient()` returns `null`
- Route handlers branch to return mock data
- Frontend tests and development work without a backend
- Useful for design sprints, offline work, and CI/CD without deployment

Example check in a route handler:

```typescript
const client = createServerApiClient();

if (!client) {
  // No backend configured — use demo data
  return NextResponse.json({
    success: true,
    data: MOCK_PORTFOLIO_DATA,
  });
}

// Backend available — proxy request
const data = await client<T>("/endpoint");
```

## Rate Limiting

The backend may return rate-limit headers:

```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 45
X-RateLimit-Reset: 1623792000
```

The frontend should:

1. Respect `X-RateLimit-Reset` and defer requests after exceeding the limit
2. Show a "Rate limited" message to the user
3. Implement exponential backoff on retries

Currently, the frontend does not have built-in rate-limit handling. Implement in the request interceptor if needed.

## Backward Compatibility

The backend **must** maintain backward compatibility for at least **2 major versions**:

- New fields in responses are additive (the frontend ignores unknown fields)
- Deprecated fields must continue to be sent for at least one version
- Breaking changes must be communicated and coordinated with the frontend team

Example: If adding a new field `riskScore` to the portfolio summary:

```json
// v1 (current)
{ "summary": { "totalBalance": 46320.82, "totalYield": 2941.16, "apy": 8.4, "strategy": "balanced" } }

// v1.1 (backward compatible — additive field)
{ "summary": { "totalBalance": 46320.82, "totalYield": 2941.16, "apy": 8.4, "strategy": "balanced", "riskScore": 0.42 } }

// v2 (breaking — must be coordinated)
```

## Testing the API Contract

Use the Node.js test runner to validate request/response formats:

```bash
yarn test
```

Tests live in `src/**/*.test.ts` and can be run with full debugging:

```bash
TZ=UTC node --import tsx --test src/**/*.test.ts --inspect
```

Integration tests that require a backend are in `.github/workflows/integration-tests.yml` and run only when `NEUROWEALTH_API_BASE_URL` is available.
