"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
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
  onNavigate,
}: {
  href: string;
  label: string;
  icon: LucideIcon;
  count?: number;
  comingSoon?: boolean;
  onNavigate?: () => void;
}) {
  const pathname = usePathname();

  // Coming-soon items render as a non-interactive, dimmed row with a gold chip.
  if (comingSoon) {
    return (
      <div
        aria-disabled
        title="Coming soon"
        className="relative flex cursor-default items-center gap-3 rounded-[10px] px-3 py-[9px] text-[13.5px] font-medium text-white/40"
      >
        <Icon className="h-[18px] w-[18px] shrink-0 opacity-60" aria-hidden />
        <span>{label}</span>
        <NavBadge comingSoon />
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
