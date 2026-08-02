"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useNewLeadsCount } from "@/lib/hooks/use-leads";
import { useAdminMe } from "@/lib/hooks/use-admin";

/**
 * Admin side nav (Phase E).
 *
 * The server is and stays the boundary — every admin route re-checks its own
 * permission. This only stops the nav advertising doors that will not open: a
 * support user was shown Revenue, Pricing and Feature flags and got a generic
 * error on each, which reads like a broken product rather than a role.
 *
 * A link with no permission listed is open to any internal staff member. While
 * permissions are still loading nothing is hidden — a nav that rearranges itself
 * a moment after it appears is worse than one extra 403.
 */
const LINKS: [string, string, string?][] = [
  ["/admin", "Overview"],
  ["/admin/clinics", "Clinics", "view_all_clinics"],
  ["/admin/revenue", "Revenue", "view_revenue"],
  ["/admin/pricing", "Pricing", "manage_pricing"],
  ["/admin/coupons", "Coupons", "manage_pricing"],
  ["/admin/leads", "Leads", "manage_leads"],
  ["/admin/staff", "Staff", "manage_dentiva_staff"],
  ["/admin/feature-flags", "Feature flags", "manage_feature_flags"],
  ["/admin/system-health", "System health", "view_system_health"],
  ["/admin/call-qa", "Call QA", "view_system_health"],
  ["/admin/audit-logs", "Audit log", "view_audit_logs"],
];

export function AdminNav() {
  const path = usePathname();
  // Badge count of new leads (only fetched for users who hold MANAGE_LEADS).
  const newLeads = useNewLeadsCount();
  const { data: me } = useAdminMe();
  const allowed = (permission?: string) =>
    permission === undefined || me === undefined || me.permissions.includes(permission);
  return (
    <nav className="hidden w-48 shrink-0 flex-col gap-0.5 md:flex">
      {LINKS.filter(([, , permission]) => allowed(permission)).map(([href, label]) => {
        const active = href === "/admin" ? path === "/admin" : path.startsWith(href);
        const badge = href === "/admin/leads" && newLeads > 0 ? newLeads : null;
        return (
          <Link
            key={href}
            href={href}
            className={[
              "flex items-center justify-between rounded-lg px-3 py-2 text-sm font-medium transition-colors",
              active ? "bg-teal/10 text-teal" : "text-gray-600 hover:bg-gray-200/60",
            ].join(" ")}
          >
            <span>{label}</span>
            {badge !== null && (
              <span className="ml-2 inline-flex min-w-5 items-center justify-center rounded-full bg-teal px-1.5 text-xs font-semibold text-white">
                {badge}
              </span>
            )}
          </Link>
        );
      })}
    </nav>
  );
}
