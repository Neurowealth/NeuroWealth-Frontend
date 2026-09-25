/**
 * Unified API response envelope for all /api/* routes.
 * Ensures consistent error handling and response shape across the application.
 */

export interface ApiErrorResponse {
    success: false;
    error: {
        code: string;
        message: string;
        details?: Record<string, string | string[]>;
    };
}

export interface ApiSuccessResponse<T = unknown> {
    success: true;
    data: T;
}

export type ApiResponse<T = unknown> = ApiSuccessResponse<T> | ApiErrorResponse;

/**
 * Standard HTTP status codes for API errors
 */
export const HTTP_STATUS = {
    OK: 200,
    CREATED: 201,
    BAD_REQUEST: 400,
    PAYLOAD_TOO_LARGE: 413,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    UNPROCESSABLE_ENTITY: 422,
    TOO_MANY_REQUESTS: 429,
    INTERNAL_SERVER_ERROR: 500,
    SERVICE_UNAVAILABLE: 503,
} as const;

/**
 * Error codes for consistent error identification
 */
export const ERROR_CODE = {
    VALIDATION_ERROR: "VALIDATION_ERROR",
    UNAUTHORIZED: "UNAUTHORIZED",
    FORBIDDEN: "FORBIDDEN",
    NOT_FOUND: "NOT_FOUND",
    PAYLOAD_TOO_LARGE: "PAYLOAD_TOO_LARGE",
    RATE_LIMITED: "RATE_LIMITED",
    INTERNAL_ERROR: "INTERNAL_ERROR",
    SERVICE_UNAVAILABLE: "SERVICE_UNAVAILABLE",
    BACKEND_ERROR: "BACKEND_ERROR",
} as const;

/**
 * Create a success response
 */
export function successResponse<T>(data: T): ApiSuccessResponse<T> {
    return {
        success: true,
        data,
    };
}

function normalizeErrorDetails(
    details: object,
): Record<string, string | string[]> | undefined {
    const entries = Object.entries(details).filter(
        (e): e is [string, string | string[]] =>
            e[1] !== undefined &&
            (typeof e[1] === "string" || Array.isArray(e[1])),
    );
    if (!entries.length) return undefined;
    return Object.fromEntries(entries);
}

/**
 * Maximum allowed request body size for POST API routes (100 KB).
 * This application-level guard is intentionally below Vercel Functions' 4.5 MB
 * payload cap because transaction and strategy writes only need small JSON.
 */
export const MAX_BODY_BYTES = 100 * 1024; // 100 KB

function payloadTooLargeResponse(maxBytes: number) {
    return errorResponse(
        ERROR_CODE.PAYLOAD_TOO_LARGE,
        `Request body must not exceed ${maxBytes / 1024} KB.`,
    );
}

/**
 * Read and parse a JSON request body, enforcing a byte-size limit.
 *
 * Returns `{ ok: true, data }` on success, or
 * `{ ok: false, response }` with a ready-to-return NextResponse on failure.
 *
 * Usage in a route handler:
 *   const result = await readJsonBody(request);
 *   if (!result.ok) return result.response;
 *   const raw = result.data;
 */
export async function readJsonBody(
    request: Request,
    maxBytes = MAX_BODY_BYTES,
): Promise<
    | { ok: true; data: unknown }
    | { ok: false; response: import("next/server").NextResponse }
> {
    const { NextResponse } = await import("next/server");

    // Fast path: reject oversized requests before reading the body when the
    // client/proxy provides Content-Length. The same limit is also enforced
    // while streaming below because this header is optional and client-controlled.
    const contentLength = request.headers.get("content-length");
    const declaredBytes =
        contentLength === null ? Number.NaN : Number(contentLength);
    if (Number.isFinite(declaredBytes) && declaredBytes > maxBytes) {
        return {
            ok: false,
            response: NextResponse.json(
                payloadTooLargeResponse(maxBytes),
                { status: HTTP_STATUS.PAYLOAD_TOO_LARGE },
            ),
        };
    }

    let chunks: Uint8Array[] = [];
    let totalBytes = 0;

    try {
        if (request.body) {
            const reader = request.body.getReader();

            try {
                while (true) {
                    const { done, value } = await reader.read();
                    if (done) break;

                    totalBytes += value.byteLength;

                    if (totalBytes > maxBytes) {
                        await reader.cancel();
                        return {
                            ok: false,
                            response: NextResponse.json(
                                payloadTooLargeResponse(maxBytes),
                                { status: HTTP_STATUS.PAYLOAD_TOO_LARGE },
                            ),
                        };
                    }

                    chunks.push(value);
                }
            } finally {
                reader.releaseLock();
            }
        } else {
            chunks = [new Uint8Array(await request.arrayBuffer())];
            totalBytes = chunks[0].byteLength;
        }
    } catch {
        return {
            ok: false,
            response: NextResponse.json(
                errorResponse(
                    ERROR_CODE.VALIDATION_ERROR,
                    "Failed to read request body.",
                ),
                { status: HTTP_STATUS.BAD_REQUEST },
            ),
        };
    }

    if (totalBytes > maxBytes) {
        return {
            ok: false,
            response: NextResponse.json(
                payloadTooLargeResponse(maxBytes),
                { status: HTTP_STATUS.PAYLOAD_TOO_LARGE },
            ),
        };
    }

    try {
        const bytes = new Uint8Array(totalBytes);
        let offset = 0;
        for (const chunk of chunks) {
            bytes.set(chunk, offset);
            offset += chunk.byteLength;
        }

        const text = new TextDecoder().decode(bytes);
        return { ok: true, data: JSON.parse(text) };
    } catch {
        return {
            ok: false,
            response: NextResponse.json(
                errorResponse(
                    ERROR_CODE.VALIDATION_ERROR,
                    "Request body must be valid JSON.",
                    {
                        body: ["Malformed JSON payload."],
                    },
                ),
                { status: HTTP_STATUS.BAD_REQUEST },
            ),
        };
    }
}

/**
 * Create an error response.
 * `details` accepts any plain object (e.g. field error maps); non-string values are omitted.
 */
export function errorResponse(
    code: string,
    message: string,
    details?: object,
): ApiErrorResponse {
    const normalized = details ? normalizeErrorDetails(details) : undefined;
    return {
        success: false,
        error: {
            code,
            message,
            ...(normalized && { details: normalized }),
        },
    };
}
