"use client";

import { LayoutDashboard, Phone, CalendarCheck, Settings } from "lucide-react";
import { NavLink } from "./nav-link";
import { APP_NAME, NAV } from "@/lib/constants";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/", label: NAV.dashboard, icon: LayoutDashboard },
  { href: "/calls", label: NAV.calls, icon: Phone },
  { href: "/bookings", label: NAV.bookings, icon: CalendarCheck },
  { href: "/settings", label: NAV.settings, icon: Settings },
] as const;

export function SidebarNav({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <nav aria-label="Primary" className="flex flex-col gap-1 p-3">
      {NAV_ITEMS.map((item) => (
        <NavLink
          key={item.href}
          href={item.href}
          label={item.label}
          icon={item.icon}
          onNavigate={onNavigate}
        />
      ))}
    </nav>
  );
}

export function SidebarBrand() {
  return (
    <div className="flex h-16 items-center gap-2 px-5">
      <span
        className="h-2.5 w-2.5 rounded-full bg-teal"
        aria-hidden
      />
      <span className="font-display text-lg font-semibold tracking-tight text-white">
        {APP_NAME}
      </span>
    </div>
  );
}

export function Sidebar({ className }: { className?: string }) {
  return (
    <aside
      className={cn(
        "hidden w-60 shrink-0 flex-col border-r border-navy-light bg-navy md:flex",
        className
      )}
    >
      <SidebarBrand />
      <SidebarNav />
    </aside>
  );
}
