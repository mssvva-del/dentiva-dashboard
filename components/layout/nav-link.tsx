"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCan } from "@/lib/hooks/use-me";
import { PERM, type Permission } from "@/lib/schemas/me";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

/** A count chip (teal) or a "Soon" roadmap chip (gold). */
function NavBadge({ count, comingSoon }: { count?: number; comingSoon?: boolean }) {
  if (comingSoon) {
    return (
      <span
        className="ml-auto rounded-full px-1.5 py-px text-[9px] font-semibold uppercase tracking-wider"
        style={{ background: "rgba(201, 169, 97, 0.18)", color: "#E8D9A8" }}
      >
        Soon
      </span>
    );
  }
  if (typeof count === "number" && count > 0) {
    return (
      <span
        className="ml-auto grid h-[18px] min-w-[18px] place-items-center rounded-full px-1 text-[10px] font-semibold tabular-nums"
        style={{ background: "rgba(0, 137, 123, 0.22)", color: "#4DB6AC" }}
      >
        {count}
      </span>
    );
  }
  return null;
}

export function NavLink({
  href,
  label,
  icon: Icon,
  count,
  comingSoon,
  permission,
  onNavigate,
}: {
  href: string;
  label: string;
  icon: LucideIcon;
  count?: number;
  comingSoon?: boolean;
  /** Hide this link when the signed-in user lacks the permission. UX only — the
   *  page guards itself and the API re-checks; this stops the nav offering a
   *  door that opens onto an access notice. */
  permission?: Permission;
  onNavigate?: () => void;
}) {
  const pathname = usePathname();
  const { allowed, pending } = useCan(permission ?? PERM.VIEW_DASHBOARD);
  // While permissions load, show the link: a nav that reshuffles itself a moment
  // after it appears is more disorienting than one extra access notice.
  if (permission && !pending && !allowed) return null;

  // Coming-soon items render as a non-interactive, dimmed row with a gold chip.
  if (comingSoon) {
    const csClass =
      "relative flex items-center gap-3 rounded-[10px] px-3 py-[9px] text-[13.5px] font-medium text-white/40";
    const csInner = (
      <>
        <Icon className="h-[18px] w-[18px] shrink-0 opacity-60" aria-hidden />
        <span>{label}</span>
        <NavBadge comingSoon />
      </>
    );
    // Clickable (to a preview page) when a real href is given; else inert row.
    if (href && href !== "#") {
      return (
        <Link
          href={href}
          onClick={onNavigate}
          title="Coming soon — preview"
          className={cn(csClass, "transition-colors hover:text-white/70")}
        >
          {csInner}
        </Link>
      );
    }
    return (
      <div aria-disabled title="Coming soon" className={cn(csClass, "cursor-default")}>
        {csInner}
      </div>
    );
  }

  const active = href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <Link
      href={href}
      onClick={onNavigate}
      aria-current={active ? "page" : undefined}
      className={cn(
        "relative flex items-center gap-3 rounded-[10px] px-3 py-[9px] text-[13.5px] font-medium transition-all duration-150",
        active
          ? "bg-teal/[0.18] text-white"
          : "text-white/75 hover:bg-white/[0.06] hover:text-white"
      )}
    >
      {/* Active left-edge indicator */}
      {active && (
        <span
          className="absolute -left-3 bottom-2 top-2 w-[3px] rounded-r-[3px] bg-teal"
          aria-hidden
        />
      )}
      <Icon className="h-[18px] w-[18px] shrink-0 opacity-90" aria-hidden />
      <span>{label}</span>
      <NavBadge count={count} />
    </Link>
  );
}
