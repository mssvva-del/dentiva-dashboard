"use client";

import { useEffect, useState } from "react";

/**
 * Persistent "Viewing as <clinic>" banner (Phase E). When an admin starts
 * impersonation we stash a flag in sessionStorage; this banner makes the
 * read-only, audited impersonation impossible to miss. "Stop" clears it.
 *
 * Iter 1 scope: the banner is the visible contract + the backend logs every
 * impersonation start. Full data-context switching is a later iteration.
 */
export function ImpersonationBanner() {
  const [target, setTarget] = useState<{ id: string; name: string } | null>(null);

  useEffect(() => {
    const raw =
      typeof window !== "undefined"
        ? sessionStorage.getItem("dentiva_impersonating")
        : null;
    if (raw) {
      try {
        setTarget(JSON.parse(raw));
      } catch {
        setTarget(null);
      }
    }
  }, []);

  if (!target) return null;
  return (
    <div className="flex items-center justify-between gap-3 bg-gold px-6 py-2 text-sm text-navy">
      <span>
        <strong>Viewing as {target.name}</strong> — read-only, this access is logged.
      </span>
      <button
        className="rounded-md bg-navy/10 px-2.5 py-1 text-xs font-semibold hover:bg-navy/20"
        onClick={() => {
          sessionStorage.removeItem("dentiva_impersonating");
          setTarget(null);
        }}
      >
        Stop
      </button>
    </div>
  );
}
