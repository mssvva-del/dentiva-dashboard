"use client";

import { usePracticeMe } from "@/lib/hooks/use-dashboard";

/**
 * "Where does this list come from?" — the first thing a clinic asks on this page.
 *
 * Most practices genuinely don't know who to bring back: their software doesn't
 * flag it, or the records are on paper. Three honest routes, with the one that
 * applies to THIS practice highlighted based on whether a practice system is
 * connected — so nobody sits on an empty list wondering what to do.
 */
export function ReactivationSources() {
  const { data } = usePracticeMe();
  const pmsConnected = !!data?.pms_connected;

  return (
    <section className="mb-5 rounded-xl border border-gray-200 bg-white p-5">
      <h2 className="text-sm font-semibold text-navy">Where this list comes from</h2>
      <p className="mt-1 text-[13px] text-gray-600">
        You don&apos;t need a marketing list — these are your own past patients.
        There are three ways to get them in.
      </p>

      <div className="mt-3 grid gap-3 sm:grid-cols-3">
        <SourceCard
          title="From your practice software"
          active={pmsConnected}
          badge={pmsConnected ? "Active" : "Needs connection"}
          body={
            pmsConnected
              ? "We read your patient records and find who's overdue automatically — no work from you."
              : "Once your practice software is connected, we find them for you automatically. Connect it in Settings."
          }
        />
        <SourceCard
          title="Upload a spreadsheet"
          active={!pmsConnected}
          badge="Works today"
          body="Have a list, or records on paper? Put them in our template and upload it below — anything you don't know can stay blank."
          link={{ href: "/dentovox-patient-list-template.csv", label: "Download template (CSV)" }}
        />
        <SourceCard
          title="Add people by hand"
          active={false}
          badge="Works today"
          body="Just a few patients in mind? Paste their numbers into a campaign below — one per line."
        />
      </div>

      <div className="mt-3 rounded-lg bg-gray-50 p-3 text-[12.5px] text-gray-600">
        <span className="font-medium text-gray-800">Who counts as &ldquo;due&rdquo;:</span>{" "}
        patients with no visit in about 18 months, patients overdue for a routine
        recall, and patients who accepted treatment but never booked it. The AI
        reaches out as their own dental office — a check-in, not a sales pitch —
        only between 9am and 8pm their time, and stops immediately if anyone asks.
      </div>
    </section>
  );
}

function SourceCard({
  title, body, badge, active, link,
}: {
  title: string;
  body: string;
  badge: string;
  active: boolean;
  link?: { href: string; label: string };
}) {
  return (
    <div
      className={
        "rounded-lg border p-3 " +
        (active ? "border-teal-300 bg-teal-50/40" : "border-gray-200")
      }
    >
      <div className="flex items-start justify-between gap-2">
        <p className="text-[13px] font-semibold text-navy">{title}</p>
        <span
          className={
            "shrink-0 rounded-full px-2 py-0.5 text-[10.5px] font-semibold " +
            (active ? "bg-teal-600 text-white" : "bg-gray-100 text-gray-600")
          }
        >
          {badge}
        </span>
      </div>
      <p className="mt-1 text-[12.5px] leading-relaxed text-gray-600">{body}</p>
      {link && (
        <a
          href={link.href}
          download
          className="mt-1.5 inline-block text-[12.5px] font-medium text-teal underline-offset-2 hover:underline"
        >
          {link.label}
        </a>
      )}
    </div>
  );
}
