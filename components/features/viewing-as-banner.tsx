"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";

import { clearViewingAs, getViewingAs, type ViewingAs } from "@/lib/impersonation";

/** Persistent bar shown while Dentovox staff are looking at a clinic's screens.
 *
 *  Loud on purpose. Everything below it is somebody else's practice, and the one
 *  mistake that matters here is forgetting that — reading a patient list and
 *  believing it is your own, or telling a clinic what "their" dashboard says
 *  while looking at another clinic's.
 */
export function ViewingAsBanner() {
  const [target, setTarget] = useState<ViewingAs | null>(null);
  const router = useRouter();
  const qc = useQueryClient();

  // Browser storage is not readable during SSR, so resolve after mount.
  useEffect(() => setTarget(getViewingAs()), []);

  if (!target) return null;

  const leave = () => {
    clearViewingAs();
    setTarget(null);
    void qc.invalidateQueries();
    router.push("/admin/clinics");
  };

  return (
    <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-amber-300 bg-amber-50 px-4 py-3">
      <p className="text-sm text-amber-900">
        <span className="font-semibold">Viewing {target.name}</span> — this is
        the clinic&apos;s own view. You can fix appointments and patient records
        here; everything you do is logged under your name.
      </p>
      <button
        type="button"
        onClick={leave}
        className="rounded-md border border-amber-400 bg-white px-3 py-1.5 text-sm font-medium text-amber-900 hover:bg-amber-100"
      >
        Back to Dentovox admin
      </button>
    </div>
  );
}
