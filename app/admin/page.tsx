"use client";

import { useMe } from "@/lib/hooks/use-me";

/**
 * Admin landing (Platform Iter 1 foundation).
 *
 * Confirms the internal-only guard works end to end and shows the signed-in
 * staff member's resolved admin permissions. The real admin modules (clinics,
 * billing, leads, impersonation, system health) replace this in Phase C.
 */
export default function AdminHomePage() {
  const { data: me } = useMe();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold text-foreground">
          Admin console
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Internal Dentiva staff only. Signed in as{" "}
          <span className="font-medium text-foreground">{me?.email}</span>
          {me?.staff_role ? ` · ${me.staff_role}` : null}.
        </p>
      </div>

      <section className="rounded-xl border border-gray-200 bg-white p-5">
        <h2 className="text-sm font-semibold text-foreground">
          Your admin permissions
        </h2>
        <p className="mt-1 text-xs text-muted-foreground">
          Resolved server-side from your Dentiva role. Modules below unlock based
          on these.
        </p>
        <div className="mt-3 flex flex-wrap gap-1.5">
          {me?.permissions.length ? (
            me.permissions.map((p) => (
              <span
                key={p}
                className="rounded-full bg-teal/10 px-2.5 py-1 text-[11px] font-medium text-teal"
              >
                {p}
              </span>
            ))
          ) : (
            <span className="text-xs text-muted-foreground">
              No permissions resolved.
            </span>
          )}
        </div>
      </section>

      <p className="text-xs text-muted-foreground">
        Admin modules (clinics, billing, leads, impersonation, system health)
        ship in Phase C.
      </p>
    </div>
  );
}
