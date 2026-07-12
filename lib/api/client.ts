import { z } from "zod";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

export class ApiError extends Error {
  constructor(
    public status: number,
    public body: string
  ) {
    super(`API error ${status}: ${body}`);
    this.name = "ApiError";
  }
}

/** Join a FastAPI-style validation array of `{msg}` entries into one string. */
function joinValidationMsgs(arr: unknown[]): string | null {
  const msgs = arr
    .map((e) =>
      e && typeof e === "object" && "msg" in e
        ? String((e as Record<string, unknown>).msg)
        : String(e)
    )
    .filter(Boolean);
  return msgs.length ? msgs.join("; ") : null;
}

/**
 * Pull a human-readable message out of an error. The backend uses a unified
 * envelope `{ error: { code, message, details } }` (app.main._error_payload), so
 * we read `error.message` first — and surface the per-field validation messages
 * from `error.details.errors` when present. Falls back to the legacy top-level
 * `detail` shape so any un-migrated response still renders. Returns null for
 * non-ApiError values so callers can use a generic message.
 */
export function apiErrorDetail(err: unknown): string | null {
  if (!(err instanceof ApiError)) return null;
  try {
    const parsed: unknown = JSON.parse(err.body);
    const root =
      parsed && typeof parsed === "object"
        ? (parsed as Record<string, unknown>)
        : {};

    // New envelope: { error: { message, details: { errors: [...] } } }
    const errObj =
      root.error && typeof root.error === "object"
        ? (root.error as Record<string, unknown>)
        : undefined;
    if (errObj) {
      const details =
        errObj.details && typeof errObj.details === "object"
          ? (errObj.details as Record<string, unknown>)
          : undefined;
      if (details && Array.isArray(details.errors)) {
        const joined = joinValidationMsgs(details.errors);
        if (joined) return joined;
      }
      if (typeof errObj.message === "string" && errObj.message) return errObj.message;
    }

    // Legacy fallback: top-level `detail` (string or validation array).
    const detail = root.detail;
    if (typeof detail === "string") return detail;
    if (Array.isArray(detail)) {
      const joined = joinValidationMsgs(detail);
      if (joined) return joined;
    }
    if (detail) return JSON.stringify(detail);
  } catch {
    /* body wasn't JSON — fall through */
  }
  return err.body || null;
}

interface ApiClientOptions<T> extends Omit<RequestInit, "body"> {
  schema: z.ZodType<T>;
  /** Clerk JWT for Authorization header. */
  token?: string | null;
  params?: Record<string, string | number | undefined>;
  body?: unknown;
}

function buildUrl(
  path: string,
  params?: Record<string, string | number | undefined>
): string {
  const url = new URL(`${API_BASE_URL}${path}`);
  if (params) {
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined) url.searchParams.set(key, String(value));
    }
  }
  return url.toString();
}

/**
 * Typed fetch wrapper. Validates the response against a Zod schema at the
 * network boundary so shape drift throws here, not inside React.
 */
export async function apiClient<T>(
  path: string,
  options: ApiClientOptions<T>
): Promise<T> {
  const { schema, token, params, body, headers, ...rest } = options;

  const res = await fetch(buildUrl(path, params), {
    ...rest,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
    ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
  });

  if (!res.ok) {
    throw new ApiError(res.status, await res.text().catch(() => ""));
  }

  const json: unknown = await res.json();
  return schema.parse(json);
}
