"use client";

/**
 * Onboarding wizard (Platform Iter 1, Phase B2).
 *
 * Six steps, progress saved server-side after each (practices.onboarding_step),
 * so the owner can leave and resume. Each "Continue" PUTs the step and advances
 * using the onboarding_step the backend returns (the server is the source of
 * truth for progress). Billing (real step 6) is deferred to Phase D / pilot, so
 * the final step explains that and goes live.
 */

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { showToast } from "@/lib/toast";
import { onboardingApi } from "@/lib/api/endpoints";
import { ApiError } from "@/lib/api/client";
import { useOnboardingState, useBaa } from "@/lib/hooks/use-onboarding";
import { LoadingState } from "@/components/features/page-states";
import type { OnboardingState } from "@/lib/schemas/onboarding";

const DAYS = [
  ["mon", "Monday"], ["tue", "Tuesday"], ["wed", "Wednesday"], ["thu", "Thursday"],
  ["fri", "Friday"], ["sat", "Saturday"], ["sun", "Sunday"],
] as const;

const TIMEZONES = [
  "America/New_York", "America/Chicago", "America/Denver",
  "America/Phoenix", "America/Los_Angeles", "America/Anchorage", "Pacific/Honolulu",
];

const STEP_TITLES = [
  "Clinic", "Hours", "Phone", "PMS", "Agent", "Terms", "Go live",
];
const LAST_STEP = STEP_TITLES.length; // 7

export default function OnboardingPage() {
  const router = useRouter();
  const { getToken } = useAuth();
  const { data: state, isPending, refetch } = useOnboardingState();

  // Local step (1..6), seeded from the server's saved progress once loaded.
  const [step, setStep] = useState(1);
  const [saving, setSaving] = useState(false);
  const [seeded, setSeeded] = useState(false);

  useEffect(() => {
    if (state && !seeded) {
      // If already live, leave the wizard.
      if (state.complete || state.status !== "onboarding") {
        router.replace("/");
        return;
      }
      setStep(Math.min(Math.max(state.onboarding_step || 1, 1), LAST_STEP));
      setSeeded(true);
    }
  }, [state, seeded, router]);

  if (isPending || !state) return <LoadingState label="Loading setup…" />;

  async function save<T>(fn: (token: string | null) => Promise<OnboardingState>) {
    setSaving(true);
    try {
      const token = await getToken();
      const next = await fn(token);
      await refetch();
      // Advance using the server's reported progress (cap at the last step).
      setStep(Math.min(Math.max(next.onboarding_step || step + 1, step + 1), LAST_STEP));
      return next;
    } catch (e) {
      showToast.error(
        e instanceof Error && "status" in e
          ? "Please check the fields and try again."
          : "Something went wrong saving this step.",
      );
      throw e;
    } finally {
      setSaving(false);
    }
  }

  async function goLive() {
    setSaving(true);
    try {
      const token = await getToken();
      const final = await onboardingApi.complete(token);
      if (final.complete) {
        showToast.success("You're live! Welcome to Dentiva.");
        router.replace("/");
      }
    } catch (e) {
      // Backend blocks go-live with 403 until the BAA is signed — send the owner
      // back to the Terms step with a clear message instead of a generic error.
      if (e instanceof ApiError && e.status === 403) {
        showToast.error("Please accept the Terms & BAA first.");
        setStep(6);
      } else {
        showToast.error("Some required steps are incomplete — please review them.");
      }
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <Stepper current={step} />
      <div className="mt-6 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        {step === 1 && <ClinicStep state={state} saving={saving} onSave={save} />}
        {step === 2 && <HoursStep state={state} saving={saving} onSave={save} />}
        {step === 3 && <PhoneStep state={state} saving={saving} onSave={save} />}
        {step === 4 && <PmsStep state={state} saving={saving} onSave={save} />}
        {step === 5 && <AgentStep state={state} saving={saving} onSave={save} />}
        {step === 6 && (
          <BaaStep saving={saving} onSave={save} onContinue={() => setStep(7)} />
        )}
        {step === 7 && (
          <ReviewStep state={state} saving={saving} onGoLive={goLive} />
        )}
      </div>
      {step > 1 && step <= LAST_STEP && (
        <button
          type="button"
          className="mt-4 text-sm text-muted-foreground hover:text-foreground"
          onClick={() => setStep((s) => Math.max(1, s - 1))}
          disabled={saving}
        >
          ← Back
        </button>
      )}
    </div>
  );
}

function Stepper({ current }: { current: number }) {
  return (
    <ol className="flex items-center gap-2 text-xs">
      {STEP_TITLES.map((t, i) => {
        const n = i + 1;
        const done = n < current;
        const active = n === current;
        return (
          <li key={t} className="flex items-center gap-2">
            <span
              className={[
                "grid h-6 w-6 place-items-center rounded-full text-[11px] font-semibold",
                active ? "bg-teal text-white"
                  : done ? "bg-teal/20 text-teal" : "bg-gray-200 text-gray-500",
              ].join(" ")}
            >
              {n}
            </span>
            <span className={active ? "font-medium text-foreground" : "text-muted-foreground"}>
              {t}
            </span>
            {n < STEP_TITLES.length && <span className="text-gray-300">·</span>}
          </li>
        );
      })}
    </ol>
  );
}

type SaveFn = <T>(fn: (token: string | null) => Promise<OnboardingState>) => Promise<OnboardingState>;
interface StepProps {
  state: OnboardingState;
  saving: boolean;
  onSave: SaveFn;
}

function StepHeader({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="mb-5">
      <h2 className="font-display text-xl font-semibold text-foreground">{title}</h2>
      <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
    </div>
  );
}

// ── Step 1: Clinic ───────────────────────────────────────────────────────────
function ClinicStep({ state, saving, onSave }: StepProps) {
  const [name, setName] = useState(state.name === "Unset" ? "" : state.name);
  const [address, setAddress] = useState(state.address ?? "");
  const [timezone, setTimezone] = useState(state.timezone || "America/New_York");

  return (
    <div>
      <StepHeader title="Your clinic" subtitle="The basics we'll show patients and use for scheduling." />
      <div className="space-y-4">
        <div>
          <Label htmlFor="name">Clinic name</Label>
          <Input id="name" value={name} onChange={(e) => setName(e.target.value)}
            placeholder="Bright Smiles Dental" />
        </div>
        <div>
          <Label htmlFor="address">Address (optional)</Label>
          <Input id="address" value={address} onChange={(e) => setAddress(e.target.value)}
            placeholder="123 Main St, Springfield, NJ" />
        </div>
        <div>
          <Label htmlFor="tz">Timezone</Label>
          <select id="tz" value={timezone} onChange={(e) => setTimezone(e.target.value)}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
            {TIMEZONES.map((tz) => <option key={tz} value={tz}>{tz}</option>)}
          </select>
        </div>
      </div>
      <Button className="mt-6" disabled={saving || !name.trim()}
        onClick={() => onSave((t) =>
          onboardingApi.clinic({ name: name.trim(), address: address.trim() || null, timezone }, t))}>
        Continue
      </Button>
    </div>
  );
}

// ── Step 2: Hours ────────────────────────────────────────────────────────────
function HoursStep({ state, saving, onSave }: StepProps) {
  const [hours, setHours] = useState<Record<string, { open: string; close: string } | null>>(() => {
    const seed: Record<string, { open: string; close: string } | null> = {};
    for (const [key] of DAYS) {
      const v = state.business_hours?.[key];
      seed[key] = v ? { open: v.open, close: v.close } : null;
    }
    return seed;
  });

  function toggle(day: string) {
    setHours((h) => ({ ...h, [day]: h[day] ? null : { open: "09:00", close: "17:00" } }));
  }
  function setTime(day: string, field: "open" | "close", val: string) {
    setHours((h) => ({ ...h, [day]: { ...(h[day] ?? { open: "09:00", close: "17:00" }), [field]: val } }));
  }

  return (
    <div>
      <StepHeader title="Business hours" subtitle="When your front desk is open. The agent answers 24/7 either way." />
      <div className="space-y-2">
        {DAYS.map(([key, label]) => {
          const open = hours[key];
          return (
            <div key={key} className="flex items-center gap-3">
              <label className="flex w-32 items-center gap-2 text-sm">
                <input type="checkbox" checked={!!open} onChange={() => toggle(key)} />
                {label}
              </label>
              {open ? (
                <div className="flex items-center gap-2">
                  <Input type="time" value={open.open} className="w-32"
                    onChange={(e) => setTime(key, "open", e.target.value)} />
                  <span className="text-muted-foreground">–</span>
                  <Input type="time" value={open.close} className="w-32"
                    onChange={(e) => setTime(key, "close", e.target.value)} />
                </div>
              ) : <span className="text-sm text-muted-foreground">Closed</span>}
            </div>
          );
        })}
      </div>
      <Button className="mt-6" disabled={saving}
        onClick={() => onSave((t) => onboardingApi.hours({ business_hours: hours }, t))}>
        Continue
      </Button>
    </div>
  );
}

// ── Step 3: Phone ────────────────────────────────────────────────────────────
function PhoneStep({ state, saving, onSave }: StepProps) {
  const [mode, setMode] = useState<"forward" | "skip">(state.phone_number ? "forward" : "skip");
  const [number, setNumber] = useState(state.phone_number ?? "");
  const [transfer, setTransfer] = useState(state.transfer_phone_number ?? "");

  return (
    <div>
      <StepHeader title="Phone" subtitle="Forward your existing number to the agent, or skip and use web calls for now." />
      <div className="space-y-3">
        <label className="flex items-start gap-3 rounded-lg border border-gray-200 p-3">
          <input type="radio" checked={mode === "forward"} onChange={() => setMode("forward")} className="mt-1" />
          <div className="flex-1">
            <p className="text-sm font-medium">Forward my existing number</p>
            <p className="text-xs text-muted-foreground">We give you a destination to forward to.</p>
            {mode === "forward" && (
              <Input className="mt-2" placeholder="+13105551234" value={number}
                onChange={(e) => setNumber(e.target.value)} />
            )}
          </div>
        </label>
        <label className="flex items-start gap-3 rounded-lg border border-gray-200 p-3">
          <input type="radio" checked={mode === "skip"} onChange={() => setMode("skip")} className="mt-1" />
          <div>
            <p className="text-sm font-medium">Skip for now</p>
            <p className="text-xs text-muted-foreground">Use web calls; set up phone later in Settings.</p>
          </div>
        </label>
        <div className="rounded-lg border border-gray-200 p-3">
          <p className="text-sm font-medium">Emergency transfer number</p>
          <p className="text-xs text-muted-foreground">
            Where the agent connects a caller to a live person (urgent cases).
          </p>
          <Input className="mt-2" placeholder="+13105550000" value={transfer}
            onChange={(e) => setTransfer(e.target.value)} />
        </div>
      </div>
      <Button className="mt-6" disabled={saving || (mode === "forward" && !number.trim())}
        onClick={() => onSave((t) =>
          onboardingApi.phone({
            mode,
            forward_number: mode === "forward" ? number.trim() : null,
            transfer_number: transfer.trim() || null,
          }, t))}>
        Continue
      </Button>
    </div>
  );
}

// ── Step 4: PMS ──────────────────────────────────────────────────────────────
function PmsStep({ state, saving, onSave }: StepProps) {
  const [pms, setPms] = useState<"open_dental" | "nexhealth" | "none">(
    (["open_dental", "nexhealth", "none"].includes(state.pms_system)
      ? state.pms_system : "none") as "open_dental" | "nexhealth" | "none",
  );
  const OPTIONS: [typeof pms, string, string][] = [
    ["open_dental", "Open Dental", "Connect your Open Dental system."],
    ["nexhealth", "NexHealth", "Connect via NexHealth."],
    ["none", "Skip for now", "Use the built-in scheduling; connect a PMS later."],
  ];
  return (
    <div>
      <StepHeader title="Practice management system" subtitle="Connect your PMS so the agent can read and write appointments." />
      <div className="space-y-3">
        {OPTIONS.map(([val, label, desc]) => (
          <label key={val} className="flex items-start gap-3 rounded-lg border border-gray-200 p-3">
            <input type="radio" checked={pms === val} onChange={() => setPms(val)} className="mt-1" />
            <div>
              <p className="text-sm font-medium">{label}</p>
              <p className="text-xs text-muted-foreground">{desc}</p>
            </div>
          </label>
        ))}
      </div>
      <Button className="mt-6" disabled={saving}
        onClick={() => onSave((t) => onboardingApi.pms({ pms_system: pms }, t))}>
        Continue
      </Button>
    </div>
  );
}

// ── Step 5: Agent ────────────────────────────────────────────────────────────
function AgentStep({ state, saving, onSave }: StepProps) {
  const [agentName, setAgentName] = useState(state.agent_settings?.agent_name ?? "Anna");
  const [greeting, setGreeting] = useState(state.agent_settings?.greeting ?? "");
  const [langs, setLangs] = useState<string[]>(
    state.languages_enabled?.length ? state.languages_enabled : ["en", "es"],
  );

  function toggleLang(l: string) {
    setLangs((cur) => (cur.includes(l) ? cur.filter((x) => x !== l) : [...cur, l]));
  }

  return (
    <div>
      <StepHeader title="Your AI receptionist" subtitle="Name, greeting, and languages. Voice is Cartesia (English & Spanish)." />
      <div className="space-y-4">
        <div>
          <Label htmlFor="an">Agent name</Label>
          <Input id="an" value={agentName} onChange={(e) => setAgentName(e.target.value)} />
        </div>
        <div>
          <Label htmlFor="gr">Greeting (optional)</Label>
          <Input id="gr" value={greeting} onChange={(e) => setGreeting(e.target.value)}
            placeholder="Thanks for calling Bright Smiles! How can I help?" />
        </div>
        <div>
          <Label>Languages</Label>
          <div className="mt-1 flex gap-4">
            {([["en", "English"], ["es", "Spanish"]] as const).map(([code, label]) => (
              <label key={code} className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={langs.includes(code)} onChange={() => toggleLang(code)} />
                {label}
              </label>
            ))}
          </div>
        </div>
      </div>
      <Button className="mt-6" disabled={saving || langs.length === 0 || !agentName.trim()}
        onClick={() => onSave((t) => onboardingApi.agent({
          agent_name: agentName.trim(), voice: "cartesia-Hailey",
          greeting: greeting.trim() || null, languages: langs,
        }, t))}>
        Continue
      </Button>
    </div>
  );
}

// ── Step 6: Terms & BAA ──────────────────────────────────────────────────────
function BaaStep(
  { saving, onSave, onContinue }: { saving: boolean; onSave: SaveFn; onContinue: () => void },
) {
  const { data: baa, isPending, isError, refetch } = useBaa();
  const [name, setName] = useState("");
  const [title, setTitle] = useState("");
  const [agreed, setAgreed] = useState(false);

  if (isPending) return <LoadingState label="Loading agreement…" />;
  if (isError || !baa) {
    return (
      <div>
        <StepHeader title="Terms & Business Associate Agreement" subtitle="We couldn't load the agreement." />
        <Button variant="outline" onClick={() => refetch()}>Retry</Button>
      </div>
    );
  }

  // Already signed — show a confirmation and let the owner proceed to go-live
  // without re-signing.
  if (baa.accepted) {
    return (
      <div>
        <StepHeader
          title="Terms & Business Associate Agreement"
          subtitle="This agreement is already signed for your clinic."
        />
        <div className="rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-800">
          ✓ Signed (version {String(baa.version)})
        </div>
        <Button className="mt-6" onClick={onContinue}>Continue</Button>
      </div>
    );
  }

  const canAccept = !saving && !!name.trim() && !!title.trim() && agreed;

  return (
    <div>
      <StepHeader
        title="Terms & Business Associate Agreement"
        subtitle="Required before your clinic can go live. Please review and sign on behalf of the clinic."
      />

      <pre className="max-h-72 overflow-y-auto whitespace-pre-wrap rounded-lg border border-gray-200 bg-gray-50 p-4 font-mono text-xs leading-relaxed text-foreground">
        {baa.text}
      </pre>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="signer-name">Full name</Label>
          <Input id="signer-name" value={name} onChange={(e) => setName(e.target.value)}
            placeholder="Jane Doe" />
        </div>
        <div>
          <Label htmlFor="signer-title">Title / role</Label>
          <Input id="signer-title" value={title} onChange={(e) => setTitle(e.target.value)}
            placeholder="Practice Owner" />
        </div>
      </div>

      <label className="mt-4 flex items-start gap-2 text-sm">
        <input type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)}
          className="mt-0.5" />
        <span>I have read and agree to the Terms &amp; BAA on behalf of the clinic.</span>
      </label>

      <p className="mt-3 text-xs text-muted-foreground">
        Your name, title, time, and IP address are recorded as an electronic
        signature (ESIGN Act).
      </p>

      <Button
        className="mt-6"
        disabled={!canAccept}
        onClick={() =>
          onSave((t) =>
            onboardingApi.acceptBaa({ signer_name: name.trim(), signer_title: title.trim() }, t),
          )
        }
      >
        Accept &amp; continue
      </Button>
    </div>
  );
}

// ── Step 7: Review + go live ─────────────────────────────────────────────────
function ReviewStep(
  { state, saving, onGoLive }: { state: OnboardingState; saving: boolean; onGoLive: () => void },
) {
  return (
    <div>
      <StepHeader title="Go live" subtitle="Review your setup and activate your AI receptionist." />
      <dl className="space-y-2 text-sm">
        <Row label="Clinic" value={state.name} />
        <Row label="Timezone" value={state.timezone} />
        <Row label="Phone" value={state.phone_number ?? "Web calls (skipped)"} />
        <Row label="PMS" value={state.pms_system === "none" ? "Skipped" : state.pms_system} />
        <Row label="Agent" value={state.agent_settings?.agent_name ?? "Anna"} />
        <Row label="Languages" value={(state.languages_enabled ?? []).join(", ").toUpperCase()} />
      </dl>
      <div className="mt-5 rounded-lg bg-teal/5 p-3 text-xs text-muted-foreground">
        Billing is set up separately with your Dentiva contact (pilot pricing). You
        can go live now and we&apos;ll handle the plan.
      </div>
      <Button className="mt-6" disabled={saving} onClick={onGoLive}>
        Activate &amp; go live
      </Button>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between border-b border-gray-100 pb-1.5">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="font-medium text-foreground">{value}</dd>
    </div>
  );
}
