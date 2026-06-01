"use client";

import {
  LayoutDashboard,
  Phone,
  PhoneCall,
  CalendarCheck,
  Settings,
  Users,
  RotateCcw,
  ClipboardList,
  ScanLine,
  Boxes,
  Store,
  BarChart3,
  Clock,
} from "lucide-react";
import { NavLink } from "./nav-link";
import { NAV } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { usePracticeMe, useDashboardToday } from "@/lib/hooks/use-dashboard";
import { useCallbacksList } from "@/lib/hooks/use-callbacks";
import { useWaitlistList } from "@/lib/hooks/use-waitlist";

function GroupLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="px-2 pb-1 pt-4 text-[10px] font-semibold uppercase tracking-widest text-white/[0.35]">
      {children}
    </p>
  );
}

export function SidebarNav({ onNavigate }: { onNavigate?: () => void }) {
  const { data: today } = useDashboardToday();
  // Front Desk badge surfaces calls that still need a human glance.
  const frontDeskCount = today?.calls_missed ?? 0;
  // Callbacks badge surfaces pending urgent call-back requests.
  const { data: callbacks } = useCallbacksList({ status: "pending" });
  const urgentCallbacks = callbacks?.pending_urgent ?? 0;
  // Waitlist badge surfaces how many callers are still waiting for a slot.
  const { data: waitlist } = useWaitlistList({ status: "waiting" });
  const waitingCount = waitlist?.waiting ?? 0;

  return (
    <nav aria-label="Primary" className="mt-2 flex flex-col gap-0.5 px-3">
      <GroupLabel>Today</GroupLabel>
      <NavLink href="/" label="Overview" icon={LayoutDashboard} onNavigate={onNavigate} />
      <NavLink
        href="/calls"
        label="Front Desk"
        icon={Phone}
        count={frontDeskCount}
        onNavigate={onNavigate}
      />
      <NavLink
        href="/bookings"
        label="Schedule"
        icon={CalendarCheck}
        onNavigate={onNavigate}
      />
      <NavLink href="/patients" label="Patients" icon={Users} onNavigate={onNavigate} />
      <NavLink
        href="/callbacks"
        label="Callbacks"
        icon={PhoneCall}
        count={urgentCallbacks}
        onNavigate={onNavigate}
      />
      <NavLink
        href="/analytics"
        label="Analytics"
        icon={BarChart3}
        onNavigate={onNavigate}
      />

      <GroupLabel>Engagement</GroupLabel>
      <NavLink
        href="/waitlist"
        label="Waitlist"
        icon={Clock}
        count={waitingCount}
        onNavigate={onNavigate}
      />
      <NavLink
        href="/reactivation"
        label="Reactivation"
        icon={RotateCcw}
        onNavigate={onNavigate}
      />
      <NavLink href="#" label="Treatment Plans" icon={ClipboardList} comingSoon />

      <GroupLabel>Clinical</GroupLabel>
      <NavLink
        href="/coming-soon/xray-ai"
        label="X-Ray AI"
        icon={ScanLine}
        comingSoon
        onNavigate={onNavigate}
      />
      <NavLink
        href="/coming-soon/implant-planner"
        label="Implant Planner"
        icon={Boxes}
        comingSoon
        onNavigate={onNavigate}
      />
      <NavLink
        href="/coming-soon/marketplace"
        label="Marketplace"
        icon={Store}
        comingSoon
        onNavigate={onNavigate}
      />

      <GroupLabel>Practice</GroupLabel>
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

const LANG_LABELS: Record<string, string> = {
  en: "EN",
  es: "ES",
  ru: "RU",
};

function PracticeCard() {
  const { data: practice } = usePracticeMe();
  if (!practice) return null;

  const langs = practice.languages_enabled?.length
    ? practice.languages_enabled
    : ["en"];
  const meta = [practice.pms_system, practice.pms_connected ? "Connected" : null]
    .filter(Boolean)
    .join(" · ");

  return (
    <div className="m-3 mt-auto rounded-[10px] border border-white/[0.08] bg-white/[0.04] p-4">
      <p className="text-sm font-semibold text-white">{practice.name}</p>
      {meta && <p className="mt-0.5 text-[11px] text-white/[0.55]">{meta}</p>}
      <div className="mt-3 flex gap-1">
        {langs.map((code) => (
          <span
            key={code}
            className="rounded-full px-2 py-0.5 text-[10px] font-semibold"
            style={{ background: "rgba(0, 137, 123, 0.20)", color: "#4DB6AC" }}
          >
            {LANG_LABELS[code.toLowerCase()] ?? code.toUpperCase()}
          </span>
        ))}
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
