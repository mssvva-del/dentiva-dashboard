"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useNewLeadsCount } from "@/lib/hooks/use-leads";

/**
 * Admin side nav (Phase E). Links are not permission-filtered here — the server
 * returns 403 (and the page shows an access notice) if the staff role lacks the
 * permission, which keeps this component simple and the boundary server-side.
 */
const LINKS: [string, string][] = [
  ["/admin", "Overview"],
  ["/admin/clinics", "Clinics"],
  ["/admin/revenue", "Revenue"],
  ["/admin/pricing", "Pricing"],
  ["/admin/coupons", "Coupons"],
  ["/admin/leads", "Leads"],
  ["/admin/staff", "Staff"],
  ["/admin/feature-flags", "Feature flags"],
  ["/admin/system-health", "System health"],
  ["/admin/audit-logs", "Audit log"],
];

export function AdminNav() {
  const path = usePathname();
  // Badge count of new leads (only fetched for users who hold MANAGE_LEADS).
  const newLeads = useNewLeadsCount();
  return (
    <nav className="hidden w-48 shrink-0 flex-col gap-0.5 md:flex">
      {LINKS.map(([href, label]) => {
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
