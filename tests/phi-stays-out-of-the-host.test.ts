/**
 * Patient data must never be fetched on the server.
 *
 * Vercel hosts this app, and we have no BAA with Vercel — nor do we need one
 * while it only serves the shell. Every page that shows patients, calls or
 * bookings renders a client component, and the data goes browser → our API,
 * never through Vercel's servers.
 *
 * That is one `await fetch` away from being false. A server component that
 * loads a patient list would put PHI through a host that never agreed to
 * handle it, the page would look and behave exactly the same, and nobody
 * would notice until an audit. So the boundary is checked rather than
 * remembered.
 *
 * Railway wanted $1,000/month committed for twelve months for its BAA. That
 * is what this boundary is worth keeping.
 */
import { describe, it, expect } from "vitest";
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

const ROOT = join(__dirname, "..");

/** Every source file under app/, walked rather than globbed — node:fs's glob is
 *  untyped here, and a test that does not typecheck is a test nobody trusts. */
function sourceFiles(dir = join(ROOT, "app")): string[] {
  const out: string[] = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) out.push(...sourceFiles(path));
    else if (/\.tsx?$/.test(entry.name)) out.push(path);
  }
  return out;
}

describe("PHI never reaches the hosting layer", () => {
  it("no server component fetches from our API", () => {
    const offenders: string[] = [];
    for (const file of sourceFiles()) {
      const source = readFileSync(file, "utf8");
      const isClient = /^\s*["']use client["']/m.test(source);
      if (isClient) continue;
      // A server file calling fetch() is calling it on Vercel's machine.
      if (/\bawait\s+fetch\s*\(|\bfetch\s*\(\s*`?\$?\{?process\.env/.test(source)) {
        offenders.push(file.replace(ROOT + "/", ""));
      }
    }
    expect(
      offenders,
      `these render on Vercel and fetch from our API — if the response carries ` +
        `patient data, PHI is passing through a host we have no BAA with:\n  ` +
        offenders.join("\n  "),
    ).toEqual([]);
  });
});
