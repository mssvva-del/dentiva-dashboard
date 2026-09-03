"use client";

import { useEffect, useState } from "react";

/**
 * Persistent "Viewing as <clinic>" banner. When an operator opens a clinic's
 * dashboard we stash a flag in sessionStorage; this banner makes it impossible
 * to miss whose screen is on the display. "Stop" clears it.
 *
 * It said "read-only" long after that stopped being true — appointments and
 * patient records can now be fixed from here, which is the whole point of
 * opening a clinic during a support call. A banner describing a rule the
 * product no longer has is worse than none: the operator believes the button
 * they need will not work, and does not press it.
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
        <strong>Viewing as {target.name}</strong> — you can fix appointments and
        patient records here. Everything you do is logged under your name.
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
