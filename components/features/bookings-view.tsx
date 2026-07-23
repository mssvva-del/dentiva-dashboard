"use client";

import { useState } from "react";
import { CalendarDays, List } from "lucide-react";
import { BookingsTable } from "@/components/features/bookings-table";
import { BookingsCalendar } from "@/components/features/bookings-calendar";
import { cn } from "@/lib/utils";

type View = "list" | "calendar";

/** Bookings page body: a List/Calendar toggle over the same data. */
export function BookingsView() {
  const [view, setView] = useState<View>("list");
  return (
    <div>
      <div className="mb-3 inline-flex rounded-lg border border-gray-200 p-0.5">
        <ToggleButton
          active={view === "list"}
          onClick={() => setView("list")}
          icon={<List className="h-4 w-4" />}
          label="List"
        />
        <ToggleButton
          active={view === "calendar"}
          onClick={() => setView("calendar")}
          icon={<CalendarDays className="h-4 w-4" />}
          label="Calendar"
        />
      </div>
      {view === "list" ? <BookingsTable /> : <BookingsCalendar />}
    </div>
  );
}

function ToggleButton({
  active,
  onClick,
  icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
        active ? "bg-teal/10 text-teal" : "text-gray-500 hover:bg-gray-100",
      )}
    >
      {icon}
      {label}
    </button>
  );
}
