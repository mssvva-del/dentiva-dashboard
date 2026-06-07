import type { ReactNode } from "react";
import { RequireInternal } from "@/components/auth/can";

/**
 * Dentiva ADMIN panel shell (Platform Iter 1).
 *
 * This is the internal staff console (super_admin / support / sales / finance /
 * engineer) — a different world from the clinic dashboard. Sergio's decision:
 * keep it in the same app under /admin for now, split to admin.dentiva.* later.
 *
 * SECURITY: every route under /admin is wrapped in <RequireInternal>, which
 * blocks any clinic user (owners included). This is the UX guard; the backend
 * independently enforces require_internal() on every /admin/* API call, so a
 * clinic user who forges a request still can't read cross-tenant data.
 *
 * The admin modules (clinics list, billing, leads, impersonation, system
 * health) land in Phase C — this layout is the guarded foundation.
 */
export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <RequireInternal>
      <div className="min-h-screen bg-gray-100">
        <header className="border-b border-gray-200 bg-navy px-6 py-4">
          <div className="flex items-center gap-3">
            <span className="font-display text-lg font-semibold text-white">
              Dentiva
            </span>
            <span className="rounded-full bg-gold/20 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-widest text-gold">
              Admin
            </span>
          </div>
        </header>
        <main className="mx-auto max-w-6xl p-6 md:p-8">{children}</main>
      </div>
    </RequireInternal>
  );
}
