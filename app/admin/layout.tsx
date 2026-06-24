import type { ReactNode } from "react";
import { RequireInternal } from "@/components/auth/can";
import { AdminNav } from "@/components/admin/admin-nav";
import { ImpersonationBanner } from "@/components/admin/impersonation-banner";

/**
 * Dentovox ADMIN panel shell (Platform Iter 1, Phase E).
 *
 * Internal staff console — a different world from the clinic dashboard. Every
 * route under /admin is wrapped in <RequireInternal> (clinic users, owners
 * included, are blocked); the backend independently enforces require_internal()
 * + per-endpoint Dentovox-role permissions on every /api/admin call.
 */
export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <RequireInternal>
      <div className="min-h-screen bg-gray-100">
        <header className="border-b border-gray-200 bg-navy px-6 py-3">
          <div className="flex items-center gap-3">
            <span className="font-display text-lg font-semibold text-white">Dentovox</span>
            <span className="rounded-full bg-gold/20 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-widest text-gold">
              Admin
            </span>
          </div>
        </header>
        <ImpersonationBanner />
        <div className="mx-auto flex max-w-7xl gap-6 p-4 md:p-6">
          <AdminNav />
          <main className="min-w-0 flex-1">{children}</main>
        </div>
      </div>
    </RequireInternal>
  );
}
