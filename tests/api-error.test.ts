import { describe, it, expect } from "vitest";
import { ApiError, apiErrorDetail } from "@/lib/api/client";

// The backend uses a unified envelope { error: { code, message, details } }
// (app.main._error_payload). apiErrorDetail must read that — the old code only
// read a top-level `detail`, so real errors surfaced as null/blank to operators.
describe("apiErrorDetail", () => {
  it("reads error.message from the unified envelope", () => {
    const body = JSON.stringify({
      error: { code: "FORBIDDEN", message: "You don't have access.", details: {} },
    });
    expect(apiErrorDetail(new ApiError(403, body))).toBe("You don't have access.");
  });

  it("joins per-field validation messages from error.details.errors", () => {
    const body = JSON.stringify({
      error: {
        code: "INVALID_REQUEST",
        message: "Request validation failed",
        details: { errors: [{ msg: "name is required" }, { msg: "phone is invalid" }] },
      },
    });
    expect(apiErrorDetail(new ApiError(400, body))).toBe(
      "name is required; phone is invalid",
    );
  });

  it("reads the rate-limit envelope (RATE_LIMITED)", () => {
    const body = JSON.stringify({
      error: { code: "RATE_LIMITED", message: "Too many requests. Please slow down and try again later." },
    });
    expect(apiErrorDetail(new ApiError(429, body))).toBe(
      "Too many requests. Please slow down and try again later.",
    );
  });

  it("uses error.message when details.errors is present but empty", () => {
    // No field-level messages → the general message is the right thing to show
    // (not a blank). Locks the intended precedence: non-empty errors win, else message.
    const body = JSON.stringify({
      error: { code: "SERVER_ERROR", message: "Something went wrong.", details: { errors: [] } },
    });
    expect(apiErrorDetail(new ApiError(500, body))).toBe("Something went wrong.");
  });

  it("still falls back to the legacy top-level detail string", () => {
    const body = JSON.stringify({ detail: "legacy message" });
    expect(apiErrorDetail(new ApiError(400, body))).toBe("legacy message");
  });

  it("falls back to legacy detail validation array", () => {
    const body = JSON.stringify({ detail: [{ msg: "too short" }, { msg: "bad format" }] });
    expect(apiErrorDetail(new ApiError(422, body))).toBe("too short; bad format");
  });

  it("returns the raw body when JSON has no known shape", () => {
    expect(apiErrorDetail(new ApiError(500, "plain text boom"))).toBe("plain text boom");
  });

  it("returns null for non-ApiError values", () => {
    expect(apiErrorDetail(new Error("nope"))).toBeNull();
    expect(apiErrorDetail("string")).toBeNull();
  });
});
