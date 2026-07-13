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
  ShieldCheck,
  UserPlus,
  CreditCard,
  BookOpen,
} from "lucide-react";
import { NavLink } from "./nav-link";
import { NAV } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { usePracticeMe, useDashboardToday } from "@/lib/hooks/use-dashboard";
import { useCallbacksList } from "@/lib/hooks/use-callbacks";
import { useWaitlistList } from "@/lib/hooks/use-waitlist";
import { useIsInternal, useCan } from "@/lib/hooks/use-me";
import { PERM } from "@/lib/schemas/me";

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
  // RBAC: the Admin section is only shown to Dentovox-internal staff. The /admin
  // route itself is independently guarded (RequireInternal + backend), so this
  // is purely so clinic users never see a link they can't use.
  const { isInternal } = useIsInternal();
  // Team management is owner/manager only (MANAGE_TEAM); the page + API re-check.
  const { allowed: canManageTeam } = useCan(PERM.MANAGE_TEAM);
  // Billing is visible to manager+ (VIEW_BILLING); changing the plan is owner-only.
  const { allowed: canViewBilling } = useCan(PERM.VIEW_BILLING);

  return (
    <nav aria-label="Primary" className="mt-2 flex flex-col gap-0.5 px-3">
      <GroupLabel>Today</GroupLabel>
      <NavLink href="/" label="Overview" icon={LayoutDashboard} onNavigate={onNavigate} />
      {/* Labels match the page titles — nav "Front Desk" landing on a page
          titled "Calls" reads like a mis-click. */}
      <NavLink
        href="/calls"
        label="Calls"
        icon={Phone}
        count={frontDeskCount}
        onNavigate={onNavigate}
      />
      <NavLink
        href="/bookings"
        label="Bookings"
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
      {/* Coming-soon pads removed from the nav (dead href + 4 "Soon" rows read
          as unfinished software to a first-time doctor). They return when real. */}

      <GroupLabel>Practice</GroupLabel>
      <NavLink
        href="/knowledge-base"
        label={NAV.knowledgeBase}
        icon={BookOpen}
        onNavigate={onNavigate}
      />
      <NavLink
        href="/settings"
        label={NAV.settings}
        icon={Settings}
        onNavigate={onNavigate}
      />
      {canManageTeam && (
        <NavLink
          href="/settings/team"
          label="Team"
          icon={UserPlus}
          onNavigate={onNavigate}
        />
      )}
      {canViewBilling && (
        <NavLink
          href="/settings/billing"
          label="Billing"
          icon={CreditCard}
          onNavigate={onNavigate}
        />
      )}

      {/* Dentovox-internal only — clinic users never see this. */}
      {isInternal && (
        <>
          <GroupLabel>Dentovox</GroupLabel>
          <NavLink
            href="/admin"
            label="Admin Console"
            icon={ShieldCheck}
            onNavigate={onNavigate}
          />
        </>
      )}
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
          Dentovox
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
