"use client";

import type { OnboardingState } from "@/lib/schemas/onboarding";

/** What the practice has to do, with everything they need already on the screen.
 *
 *  Eaglesoft, Dentrix and Open Dental keep their data on a machine in the
 *  practice with no route in from outside, so a small program has to run ON that
 *  machine. Nobody can automate that away — vendors who look like they did are
 *  either on a cloud system or are emailing this same installer.
 *
 *  What was worth automating is everyone's part in the middle: the key used to
 *  travel by forwarded email, and the clinic had to ask us whether it had
 *  worked. Both are now on their own screen. */
export function PmsInstallBlock({ state }: { state?: OnboardingState }) {
  const key = state?.pms_install_key;
  if (!key && !state?.pms_connected) return null;

  if (state?.pms_connected) {
    return (
      <div className="mt-4 rounded-lg border border-green-200 bg-green-50 p-3 text-[13px] text-green-900">
        <span className="font-semibold">Your calendar is connected.</span>{" "}
        The agent now offers your real openings, and bookings land in your own
        schedule.
      </div>
    );
  }

  return (
    <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-4 text-[13px] text-amber-950">
      <p className="font-semibold">One step on your side — about 5 minutes.</p>
      <p className="mt-1">
        Your practice software stores its schedule on a computer in your office,
        so a small sync program has to be installed there. Whoever looks after
        that computer can do it — the same person who installs your practice
        software updates.
      </p>
      <ol className="mt-3 list-decimal space-y-1 pl-5">
        <li>Download the installer and run it on the computer that runs your
          practice software.</li>
        <li>When it asks for a product key, paste the key below.</li>
        <li>Leave it to finish — usually under an hour, mostly waiting.</li>
      </ol>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <code className="rounded border border-amber-300 bg-white px-2 py-1 font-mono text-xs">
          {key}
        </code>
        <button
          type="button"
          onClick={() => navigator.clipboard?.writeText(key ?? "")}
          className="rounded border border-amber-300 bg-white px-2 py-1 text-xs"
        >
          Copy key
        </button>
        <a
          href="https://docs.nexhealth.com/docs/nexhealth-synchronizer-installation-guide-1"
          target="_blank" rel="noreferrer"
          className="rounded border border-amber-300 bg-white px-2 py-1 text-xs"
        >
          Installation guide
        </a>
        <a
          href={`mailto:?subject=${encodeURIComponent("Install our scheduling sync (5 minutes)")}&body=${encodeURIComponent(
            `Hi,\n\nPlease install the NexHealth Synchronizer on the computer that runs our practice software.\n\nGuide: https://docs.nexhealth.com/docs/nexhealth-synchronizer-installation-guide-1\nProduct key: ${key}\n\nIt takes about five minutes of work. Thanks!`,
          )}`}
          className="rounded border border-amber-300 bg-white px-2 py-1 text-xs"
        >
          Email this to our IT
        </a>
      </div>
      <p className="mt-3 text-xs">
        This page will say &quot;connected&quot; on its own once it is done — you
        do not need to tell us.
      </p>
    </div>
  );
}
