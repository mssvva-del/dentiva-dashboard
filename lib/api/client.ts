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

/**
 * Pull a human-readable message out of an error, preferring FastAPI's `detail`
 * field (string, or a 422 validation array of `{msg}` entries). Returns null
 * for non-ApiError values so callers can fall back to a generic message.
 */
export function apiErrorDetail(err: unknown): string | null {
  if (!(err instanceof ApiError)) return null;
  try {
    const parsed: unknown = JSON.parse(err.body);
    const detail =
      parsed && typeof parsed === "object"
        ? (parsed as Record<string, unknown>).detail
        : undefined;
    if (typeof detail === "string") return detail;
    if (Array.isArray(detail)) {
      const msgs = detail
        .map((e) =>
          e && typeof e === "object" && "msg" in e
            ? String((e as Record<string, unknown>).msg)
            : String(e)
        )
        .filter(Boolean);
      if (msgs.length) return msgs.join("; ");
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
