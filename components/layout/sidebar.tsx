"use client";

import { LayoutDashboard, Phone, CalendarCheck, Settings } from "lucide-react";
import { NavLink } from "./nav-link";
import { NAV } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { usePracticeMe } from "@/lib/hooks/use-dashboard";

const NAV_ITEMS = [
  { href: "/", label: NAV.dashboard, icon: LayoutDashboard },
  { href: "/calls", label: NAV.calls, icon: Phone },
  { href: "/bookings", label: NAV.bookings, icon: CalendarCheck },
] as const;

export function SidebarNav({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <nav aria-label="Primary" className="mt-4 flex flex-col gap-0.5 px-3">
      <p className="px-2 pb-1 pt-3 text-[10px] font-semibold uppercase tracking-widest text-white/[0.35]">
        Main
      </p>
      {NAV_ITEMS.map((item) => (
        <NavLink
          key={item.href}
          href={item.href}
          label={item.label}
          icon={item.icon}
          onNavigate={onNavigate}
        />
      ))}
      <p className="px-2 pb-1 pt-4 text-[10px] font-semibold uppercase tracking-widest text-white/[0.35]">
        Practice
      </p>
      <NavLink
        href="/settings"
        label={NAV.settings}
        icon={Settings}
        onNavigate={onNavigate}
      />
    </nav>
  );
}

export function SidebarBrand() {
  return (
    <div className="flex items-center gap-3 border-b border-white/[0.08] px-5 py-5">
      {/* Logo mark */}
      <div
        className="relative grid h-[38px] w-[38px] shrink-0 place-items-center rounded-[10px] font-display text-[19px] font-bold text-white"
        style={{
          background: "linear-gradient(135deg, #00897B 0%, #4DB6AC 100%)",
          boxShadow: "0 4px 12px rgba(0, 137, 123, 0.3)",
        }}
        aria-hidden
      >
        D
        <span
          className="absolute right-1 top-1 h-1 w-1 rounded-full bg-gold"
          aria-hidden
        />
      </div>
      {/* Name + tagline */}
      <div>
        <span className="block font-display text-xl font-semibold leading-none tracking-tight text-white">
          Dentiva
        </span>
        <span className="mt-0.5 block text-[10px] font-medium uppercase tracking-widest text-white/[0.40]">
          AI Receptionist
        </span>
      </div>
    </div>
  );
}

function PracticeCard() {
  const { data: practice } = usePracticeMe();
  if (!practice) return null;
  return (
    <div className="m-3 mt-auto rounded-[10px] border border-white/[0.08] bg-white/[0.04] p-4">
      <p className="mb-0.5 text-[10px] font-semibold uppercase tracking-widest text-white/[0.50]">
        Practice
      </p>
      <p className="text-sm font-semibold text-white">{practice.name}</p>
      <p className="mt-0.5 text-[11px] text-white/[0.55]">AI Receptionist</p>
      <div className="mt-3 flex gap-1">
        <span
          className="rounded-full px-2 py-0.5 text-[10px] font-semibold"
          style={{ background: "rgba(0, 137, 123, 0.20)", color: "#4DB6AC" }}
        >
          EN
        </span>
      </div>
    </div>
  );
}

export function Sidebar({ className }: { className?: string }) {
  return (
    <aside
      className={cn(
        "hidden w-[248px] shrink-0 flex-col bg-navy md:flex",
        "h-screen overflow-y-auto sticky top-0",
        className
      )}
      style={{
        scrollbarWidth: "thin",
        scrollbarColor: "rgba(255,255,255,0.1) transparent",
      }}
    >
      <SidebarBrand />
      <SidebarNav />
      <PracticeCard />
    </aside>
  );
}
