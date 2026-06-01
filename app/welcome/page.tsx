import Link from "next/link";
import type { Metadata } from "next";
import {
  Phone,
  CalendarCheck,
  MessageSquare,
  Bell,
  Clock,
  RotateCcw,
  BarChart3,
  ShieldCheck,
  ArrowRight,
  PhoneCall,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Dentiva — AI Receptionist for Dental Practices",
  description:
    "Dentiva answers every call, books and reschedules appointments, fills cancellations and follows up with patients — by phone and text, 24/7.",
};

const NAVY = "#0A1929";
const TEAL = "#00897B";
const GOLD = "#C9A961";

const FEATURES = [
  {
    icon: PhoneCall,
    title: "AI Voice Receptionist",
    body: "Answers every call in under two seconds, day or night. Books, reschedules, cancels — and hands off to your team for anything clinical or urgent.",
  },
  {
    icon: CalendarCheck,
    title: "Smart booking & waitlist",
    body: "Offers real openings, never double-books, and adds callers to a waitlist when nothing fits — then fills cancellations automatically.",
  },
  {
    icon: Bell,
    title: "Automated reminders",
    body: "Texts patients ~24h and ~2h before their visit, on quiet-hours rules, to cut no-shows.",
  },
  {
    icon: MessageSquare,
    title: "Two-way texting",
    body: "Patients reply CONFIRM or CANCEL — a cancellation instantly frees the slot and texts the next person waiting.",
  },
  {
    icon: Clock,
    title: "No-show tracking",
    body: "Flags repeat no-shows and surfaces no-show rate so the front desk can act on it.",
  },
  {
    icon: RotateCcw,
    title: "Patient reactivation",
    body: "Finds patients overdue for a visit and sends recall texts to win them back.",
  },
  {
    icon: BarChart3,
    title: "Live analytics & ROI",
    body: "Calls handled, bookings made, conversion, engagement and protected revenue — over 7, 30 or 90 days.",
  },
  {
    icon: ShieldCheck,
    title: "Built with privacy in mind",
    body: "Patient data encrypted at rest, per-practice isolation, and TCPA opt-out honored on every text.",
  },
];

const STEPS = [
  {
    n: "1",
    title: "A patient calls",
    body: "Dentiva picks up instantly — no hold music, no voicemail, no missed revenue.",
  },
  {
    n: "2",
    title: "The AI handles it",
    body: "It verifies the patient, books or moves the appointment, and texts a confirmation.",
  },
  {
    n: "3",
    title: "You see everything",
    body: "Every call, booking and follow-up lands in your dashboard in real time.",
  },
];

function Logo() {
  return (
    <span className="flex items-center gap-2">
      <span
        className="grid h-8 w-8 place-items-center rounded-lg text-white"
        style={{ background: TEAL }}
        aria-hidden
      >
        <Phone className="h-4 w-4" />
      </span>
      <span className="font-display text-[19px] font-semibold tracking-tight text-white">
        Dentiva
      </span>
    </span>
  );
}

export default function WelcomePage() {
  return (
    <main className="min-h-screen bg-white text-[#0A1929]">
      {/* ── Nav ───────────────────────────────────────────── */}
      <header style={{ background: NAVY }}>
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Logo />
          <nav className="flex items-center gap-6 text-[13.5px] text-white/70">
            <a href="#how" className="hidden hover:text-white sm:block">
              How it works
            </a>
            <a href="#features" className="hidden hover:text-white sm:block">
              Features
            </a>
            <Link
              href="/login"
              className="rounded-lg px-4 py-2 text-[13.5px] font-semibold text-white transition-opacity hover:opacity-90"
              style={{ background: TEAL }}
            >
              Sign in
            </Link>
          </nav>
        </div>
      </header>

      {/* ── Hero ──────────────────────────────────────────── */}
      <section
        className="relative overflow-hidden px-6 py-20 sm:py-28"
        style={{
          background: `linear-gradient(160deg, ${NAVY} 0%, #0F2440 100%)`,
        }}
      >
        <div className="mx-auto max-w-3xl text-center">
          <span
            className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-widest"
            style={{ background: "rgba(201,169,97,0.16)", color: GOLD }}
          >
            AI front desk for dental practices
          </span>
          <h1 className="mt-5 font-display text-[40px] font-semibold leading-[1.08] tracking-tight text-white sm:text-[56px]">
            Never miss another
            <br />
            patient call.
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-[16px] leading-relaxed text-white/70">
            Dentiva answers the phone 24/7, books and reschedules appointments,
            fills cancellations from the waitlist, and follows up by text — so
            your front desk can focus on the patients in the chair.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href="/login"
              className="inline-flex items-center gap-2 rounded-xl px-6 py-3 text-[15px] font-semibold text-white shadow-lg transition-transform hover:-translate-y-0.5"
              style={{ background: TEAL }}
            >
              See the live dashboard
              <ArrowRight className="h-4 w-4" />
            </Link>
            <a
              href="#how"
              className="inline-flex items-center gap-2 rounded-xl border border-white/20 px-6 py-3 text-[15px] font-semibold text-white/90 hover:bg-white/5"
            >
              How it works
            </a>
          </div>
          <p className="mt-5 text-[12.5px] text-white/45">
            Live demo environment · no setup required
          </p>
        </div>
      </section>

      {/* ── Stat strip ────────────────────────────────────── */}
      <section className="border-b border-gray-100 bg-white">
        <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 px-6 py-10 sm:grid-cols-3">
          {[
            ["24/7", "Calls answered — nights, weekends, lunch breaks"],
            ["< 2 sec", "To pick up — no hold, no voicemail"],
            ["1 platform", "Calls, bookings, texts & analytics in one place"],
          ].map(([big, small]) => (
            <div key={big} className="text-center">
              <p
                className="font-display text-[34px] font-semibold leading-none"
                style={{ color: TEAL }}
              >
                {big}
              </p>
              <p className="mt-2 text-[13px] text-gray-500">{small}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── How it works ──────────────────────────────────── */}
      <section id="how" className="mx-auto max-w-5xl px-6 py-20">
        <div className="text-center">
          <h2 className="font-display text-[30px] font-semibold tracking-tight">
            How it works
          </h2>
          <p className="mx-auto mt-3 max-w-lg text-[15px] text-gray-500">
            From a ringing phone to a booked chair — without anyone at the desk
            lifting a finger.
          </p>
        </div>
        <div className="mt-12 grid grid-cols-1 gap-8 sm:grid-cols-3">
          {STEPS.map((s) => (
            <div key={s.n} className="text-center">
              <div
                className="mx-auto grid h-11 w-11 place-items-center rounded-full font-display text-[18px] font-semibold text-white"
                style={{ background: NAVY }}
              >
                {s.n}
              </div>
              <h3 className="mt-4 text-[16px] font-semibold text-navy">{s.title}</h3>
              <p className="mt-2 text-[13.5px] leading-relaxed text-gray-500">
                {s.body}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Features ──────────────────────────────────────── */}
      <section id="features" style={{ background: "#F7F9FB" }}>
        <div className="mx-auto max-w-6xl px-6 py-20">
          <div className="text-center">
            <h2 className="font-display text-[30px] font-semibold tracking-tight">
              Everything the front desk does — automated
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-[15px] text-gray-500">
              Not just an answering service. Dentiva runs the whole booking
              lifecycle and shows you the results.
            </p>
          </div>
          <div className="mt-12 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {FEATURES.map((f) => {
              const Icon = f.icon;
              return (
                <div
                  key={f.title}
                  className="rounded-2xl border border-gray-100 bg-white p-6"
                  style={{ boxShadow: "0 1px 2px rgba(10,25,41,0.04)" }}
                >
                  <span
                    className="grid h-10 w-10 place-items-center rounded-xl"
                    style={{ background: "rgba(0,137,123,0.10)", color: TEAL }}
                    aria-hidden
                  >
                    <Icon className="h-5 w-5" />
                  </span>
                  <h3 className="mt-4 text-[15px] font-semibold text-navy">
                    {f.title}
                  </h3>
                  <p className="mt-1.5 text-[13px] leading-relaxed text-gray-500">
                    {f.body}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── CTA ───────────────────────────────────────────── */}
      <section
        className="px-6 py-20"
        style={{ background: `linear-gradient(160deg, ${NAVY} 0%, #0F2440 100%)` }}
      >
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="font-display text-[32px] font-semibold tracking-tight text-white">
            See it running live
          </h2>
          <p className="mx-auto mt-4 max-w-lg text-[15px] leading-relaxed text-white/70">
            Step into the dashboard your front desk would use every day — calls,
            schedule, waitlist, reminders and analytics, all live.
          </p>
          <Link
            href="/login"
            className="mt-8 inline-flex items-center gap-2 rounded-xl px-7 py-3.5 text-[15px] font-semibold text-white shadow-lg transition-transform hover:-translate-y-0.5"
            style={{ background: TEAL }}
          >
            Open the dashboard
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      {/* ── Footer ────────────────────────────────────────── */}
      <footer className="bg-white">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-6 py-8 sm:flex-row">
          <span className="flex items-center gap-2 text-[14px] font-semibold text-navy">
            <span
              className="grid h-6 w-6 place-items-center rounded-md text-white"
              style={{ background: TEAL }}
              aria-hidden
            >
              <Phone className="h-3 w-3" />
            </span>
            Dentiva
          </span>
          <p className="text-[12px] text-gray-400">
            AI receptionist for dental practices · Demo environment
          </p>
        </div>
      </footer>
    </main>
  );
}
