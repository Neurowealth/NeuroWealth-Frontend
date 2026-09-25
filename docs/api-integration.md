# NEUROWEALTH_API Integration Guide (Issue #167)

## Overview

This document describes the expected request/response shapes for the NEUROWEALTH_API backend integration. When `NEUROWEALTH_API_BASE_URL` is set, the frontend will forward requests to your backend API.

**Default behavior:** If `NEUROWEALTH_API_BASE_URL` is not set, the frontend uses demo/mock data.

## Environment Configuration

### Server-Only Variables

Add these to your `.env.local` (server-side only, never exposed to browser):

```bash
# Backend API base URL (optional; uses demo data if not set)
NEUROWEALTH_API_BASE_URL=http://localhost:8000

# API endpoint paths (optional; defaults shown)
NEUROWEALTH_PORTFOLIO_PATH=/portfolio/overview
NEUROWEALTH_TRANSACTIONS_PATH=/transactions
```

See `docs/env.md` for complete environment variable documentation.

## API Endpoints

### Request Body Limits

JSON write routes enforce a 100 KB request body limit before schema validation.
This application-level limit is intentionally below Vercel Functions' documented
4.5 MB request/response payload cap while matching the small payloads expected by
the transaction and strategy flows.

Affected frontend routes:

- `POST /api/transactions`
- `PUT /api/strategy`

Oversized requests return `413 Payload Too Large` with the standard envelope:

```json
{
  "success": false,
  "error": {
    "code": "PAYLOAD_TOO_LARGE",
    "message": "Request body must not exceed 100 KB."
  }
}
```

Malformed JSON returns `400 Bad Request` before route-specific validation:

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Request body must be valid JSON.",
    "details": {
      "body": ["Malformed JSON payload."]
    }
  }
}
```

### 1. Portfolio Overview

**Frontend Route:** `GET /api/portfolio?scenario=live`

**Backend Endpoint:** `{NEUROWEALTH_API_BASE_URL}{NEUROWEALTH_PORTFOLIO_PATH}`

**Default Path:** `/portfolio/overview`

#### Request

```http
GET /portfolio/overview HTTP/1.1
Host: localhost:8000
Accept: application/json
```

#### Response (Success)

```json
{
  "success": true,
  "data": {
    "source": "api",
    "portfolio": {
      "totalValue": 125000.5,
      "currency": "USD",
      "lastUpdated": "2026-04-25T10:30:00Z"
    },
    "allocations": [
      {
        "id": "stocks",
        "label": "Stocks",
        "value": 75000,
        "percentage": 60,
        "color": "primary"
      },
      {
        "id": "bonds",
        "label": "Bonds",
        "value": 37500,
        "percentage": 30,
        "color": "accent"
      },
      {
        "id": "cash",
        "label": "Cash",
        "value": 12500,
        "percentage": 10,
        "color": "warning"
      }
    ],
    "performance": [
      {
        "date": "2026-01-01",
        "value": 120000,
        "change": 0
      },
      {
        "date": "2026-02-01",
        "value": 122500,
        "change": 2500
      },
      {
        "date": "2026-03-01",
        "value": 125000,
        "change": 2500
      }
    ]
  }
}
```

#### Response (Error)

```json
{
  "success": false,
  "error": {
    "code": "SERVICE_UNAVAILABLE",
    "message": "Portfolio service temporarily unavailable. Showing preview data.",
    "details": "Connection timeout"
  }
}
```

**Status Code:** 503 (Service Unavailable)

---

### 2. Transactions

**Frontend Route:** `POST /api/transactions`

**Backend Endpoint:** `{NEUROWEALTH_API_BASE_URL}{NEUROWEALTH_TRANSACTIONS_PATH}`

**Default Path:** `/transactions`

#### Request

```http
POST /transactions HTTP/1.1
Host: localhost:8000
Content-Type: application/json
Accept: application/json

{
  "kind": "deposit",
  "intent": "submit",
  "simulation": "auto",
  "values": {
    "amount": "100.00",
    "walletAddress": "GABC...XYZ",
    "walletConnected": true
  }
}
```

**Request Schema:**

```typescript
{
  kind: "deposit" | "withdrawal",
  intent?: "quote" | "submit",
  simulation?: "auto" | "success" | "failure",
  values: {
    amount: string,
    walletAddress: string,
    walletConnected: boolean,
  }
}
```

#### Response (Success)

```json
{
  "success": true,
  "data": {
    "pending": {
      "id": "txn_abc123",
      "kind": "deposit",
      "amount": "100.00",
      "status": "pending",
      "createdAt": "2026-04-25T10:30:00Z"
    }
  }
}
```

#### Response (Quote)

```json
{
  "success": true,
  "data": {
    "quote": {
      "amount": "100.00",
      "estimatedFee": "0.50",
      "estimatedTotal": "99.50"
    }
  }
}
```

#### Response (Error)

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Fix the highlighted fields and try again.",
    "details": {
      "amount": ["Amount must be greater than 0"],
      "walletAddress": ["Invalid Stellar address"]
    }
  }
}
```

**Status Code:** 400 (Bad Request)

---

## Error Codes

| Code                  | HTTP Status | Description                             |
| --------------------- | ----------- | --------------------------------------- |
| `VALIDATION_ERROR`    | 400         | Request validation failed               |
| `UNAUTHORIZED`        | 401         | Bearer token invalid or expired         |
| `FORBIDDEN`           | 403         | User lacks permission for resource      |
| `NOT_FOUND`           | 404         | Resource does not exist                 |
| `PAYLOAD_TOO_LARGE`   | 413         | Request body exceeds 100 KB limit       |
| `RATE_LIMITED`        | 429         | Too many requests — retry after backoff |
| `INTERNAL_ERROR`      | 500         | Internal server error                   |
| `BACKEND_ERROR`       | 502         | Backend service error                   |
| `SERVICE_UNAVAILABLE` | 503         | Backend service temporarily unavailable |

## Response Envelope

All API responses follow this envelope structure:

```typescript
{
  success: boolean,
  data?: any,
  error?: {
    code: string,
    message: string,
    details?: any
  }
}
```

## Demo Mode

When `NEUROWEALTH_API_BASE_URL` is not set:

- Portfolio endpoint returns mock data with `source: "demo"`
- Transaction endpoints return simulated responses
- No backend connection required
- Useful for development and testing

## Integration Checklist

- [ ] Backend API implements `/portfolio/overview` endpoint
- [ ] Backend API implements `/transactions` endpoint
- [ ] Responses follow envelope structure (success/error)
- [ ] Error responses include error code and message
- [ ] Contrast ratios meet WCAG AA standards (see `docs/qa/chart-colors-cvd.md`)
- [ ] Cookie consent storage uses centralized keys (see `src/lib/storage-keys.ts`)

## Testing

### Local Development

```bash
# Start frontend with demo mode (no backend required)
yarn dev

# Start frontend with backend integration
NEUROWEALTH_API_BASE_URL=http://localhost:8000 yarn dev
```

### API Testing

Use curl or Postman to test endpoints:

```bash
# Test portfolio endpoint
curl -X GET http://localhost:3000/api/portfolio?scenario=live

# Test transaction endpoint
curl -X POST http://localhost:3000/api/transactions \
  -H "Content-Type: application/json" \
  -d '{"kind":"deposit","intent":"submit","values":{"amount":"100.00","walletAddress":"GABC...XYZ","walletConnected":true}}'
```

## Related Issues

- #167: Document NEUROWEALTH_API contract (paths, auth, error JSON) for integration
- #131: Align cookie consent storage keys and settings page labels
- #422: Data viz: verify chart colors against design tokens and contrast for CVD
