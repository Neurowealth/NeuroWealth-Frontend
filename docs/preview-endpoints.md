# Preview Route Endpoints

The NeuroWealth frontend includes server-side rendered preview endpoints for generating preview images and documentation of transaction flows and portfolio widgets.

## Transaction Preview Endpoint

**Route:** `GET /api/transaction-preview`

Generates a preview image showing a transaction flow (deposit or withdrawal) in a specific state.

### Query Parameters

| Parameter | Type | Values | Default | Description |
|-----------|------|--------|---------|-------------|
| `theme` | string | `light`, `dark` | `light` | Color theme for the preview image |
| `kind` | string | `deposit`, `withdrawal` | `deposit` | Transaction type |
| `preview` | string | `form`, `confirm`, `pending`, `success`, `failure` | `form` | Current stage of the transaction flow |

### Example URLs

**Basic deposit form preview (light theme):**
```
/api/transaction-preview?kind=deposit&preview=form&theme=light
```

**Withdrawal confirmation preview (dark theme):**
```
/api/transaction-preview?kind=withdrawal&preview=confirm&theme=dark
```

**Transaction success state:**
```
/api/transaction-preview?kind=deposit&preview=success&theme=light
```

**Transaction failure state:**
```
/api/transaction-preview?kind=withdrawal&preview=failure&theme=dark
```

### Preview States

- **form**: Initial transaction form with amount input and wallet selection
- **confirm**: Review stage showing quote details, fees, and destination amount
- **pending**: Transaction being processed with reference number display
- **success**: Successful transaction completion with receipt details
- **failure**: Failed transaction with error information and reference for support

### Response

The endpoint returns an OpenGraph image (1600×1000px) that can be:
- Used in social sharing (meta tags)
- Embedded in documentation
- Used for screenshots and previews
- Shared in communications about transaction flows

---

## Widget Preview Endpoint

**Route:** `GET /api/widget-preview`

Generates a preview image showing the NeuroWealth portfolio dashboard widgets and asset allocation overview.

### Query Parameters

| Parameter | Type | Values | Default | Description |
|-----------|------|--------|---------|-------------|
| `theme` | string | `light`, `dark` | `light` | Color theme for the preview image |

### Example URLs

**Portfolio overview (light theme):**
```
/api/widget-preview?theme=light
```

**Portfolio overview (dark theme):**
```
/api/widget-preview?theme=dark
```

### Preview Content

The widget preview displays:
- Total balance and yields across positions
- Current APY and active strategy
- Asset allocation breakdown
- Recent activity and transaction history
- Portfolio composition visualization

### Response

The endpoint returns an OpenGraph image (1600×1080px) that can be:
- Used in social sharing
- Included in feature documentation
- Used for product demos and screenshots
- Shared in marketing materials

---

## Usage Notes

### Caching

Both endpoints export `force-dynamic`, which opts them out of Next.js static generation. They also set explicit `Cache-Control` response headers so CDNs and browsers can cache the rendered images:

| Endpoint | `Cache-Control` header |
|---|---|
| `/api/transaction-preview` | `public, s-maxage=86400, max-age=3600` |
| `/api/widget-preview` | `public, s-maxage=86400, max-age=3600` |

CDNs (e.g. Vercel Edge) may cache a response for up to **24 hours** (`s-maxage=86400`); browsers cache it for up to **1 hour** (`max-age=3600`). Because the images are parameterised by query string, each distinct combination of parameters is cached independently — a fresh render is triggered only when a previously-unseen parameter set is requested, or after the TTL expires.

### Image Dimensions

- Transaction preview: **1600×1000px**
- Widget preview: **1600×1080px**

### Browser Integration

Preview endpoints can be embedded in `<meta og:image>` tags for dynamic Open Graph images:

```html
<meta property="og:image" content="/api/transaction-preview?kind=deposit&theme=dark" />
<meta property="og:image:width" content="1600" />
<meta property="og:image:height" content="1000" />
```

### Testing

You can test preview endpoints directly in your browser or with curl:

```bash
# View transaction preview
curl -v "http://localhost:3000/api/transaction-preview?kind=deposit&preview=confirm&theme=dark"

# View widget preview
curl -v "http://localhost:3000/api/widget-preview?theme=dark"
```

The endpoint will return the image with appropriate Content-Type headers for direct viewing or embedding.
