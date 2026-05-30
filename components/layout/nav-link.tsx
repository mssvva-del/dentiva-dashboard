"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export function NavLink({
  href,
  label,
  icon: Icon,
  onNavigate,
}: {
  href: string;
  label: string;
  icon: LucideIcon;
  onNavigate?: () => void;
}) {
  const pathname = usePathname();
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
    </Link>
  );
}
