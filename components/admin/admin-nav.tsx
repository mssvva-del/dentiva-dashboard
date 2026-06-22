"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

/**
 * Admin side nav (Phase E). Links are not permission-filtered here — the server
 * returns 403 (and the page shows an access notice) if the staff role lacks the
 * permission, which keeps this component simple and the boundary server-side.
 */
const LINKS: [string, string][] = [
  ["/admin", "Overview"],
  ["/admin/clinics", "Clinics"],
  ["/admin/revenue", "Revenue"],
  ["/admin/staff", "Staff"],
  ["/admin/feature-flags", "Feature flags"],
  ["/admin/system-health", "System health"],
  ["/admin/audit-logs", "Audit log"],
];

export function AdminNav() {
  const path = usePathname();
  return (
    <nav className="hidden w-48 shrink-0 flex-col gap-0.5 md:flex">
      {LINKS.map(([href, label]) => {
        const active = href === "/admin" ? path === "/admin" : path.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            className={[
              "rounded-lg px-3 py-2 text-sm font-medium transition-colors",
              active ? "bg-teal/10 text-teal" : "text-gray-600 hover:bg-gray-200/60",
            ].join(" ")}
          >
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
