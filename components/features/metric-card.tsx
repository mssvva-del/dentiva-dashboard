
/** Big primary card — navy gradient, white text, large Fraunces number */
export function HeroMetricCard({
  label,
  value,
  sub,
}: {
  label: string;
  value: number | string;
  sub?: string;
}) {
  return (
    <div
      className="relative overflow-hidden rounded-[14px] border-none p-6 text-white"
      style={{
        background: "linear-gradient(135deg, #0A1929 0%, #0F2440 100%)",
        boxShadow: "0 4px 12px rgba(10, 25, 41, 0.07)",
      }}
    >
      {/* Subtle teal radial glow */}
      <div
        className="pointer-events-none absolute -right-12 -top-12 h-[220px] w-[220px] rounded-full"
        style={{
          background:
            "radial-gradient(circle, rgba(0, 137, 123, 0.18) 0%, transparent 70%)",
        }}
        aria-hidden
      />
      <p className="relative text-[11px] font-semibold uppercase tracking-widest text-teal-light">
        {label}
      </p>
      <p
        className="relative mt-3 font-display text-[44px] font-semibold leading-none"
        style={{ fontFeatureSettings: "'tnum'", letterSpacing: "-0.025em" }}
      >
        {value}
      </p>
      {sub ? (
        <p className="relative mt-4 text-[12.5px] text-white/[0.65]">{sub}</p>
      ) : null}
    </div>
  );
}

/** Secondary stat card — white, smaller value */
export function StatCard({
  label,
  value,
  accent,
}: {
  label: string;
  value: number | string;
  accent?: "teal" | "gold" | "danger" | "success";
}) {
  const accentColor =
    {
      teal: "#00897B",
      gold: "#C9A961",
      danger: "#C53030",
      success: "#2F855A",
    }[accent ?? "teal"] ?? "#0A1929";

  return (
    <div
      className="rounded-[14px] border border-gray-200 bg-white p-6 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-brand-md"
      style={{ boxShadow: "0 1px 2px rgba(10, 25, 41, 0.04)" }}
    >
      <p className="text-[11px] font-semibold uppercase tracking-widest text-gray-500">
        {label}
      </p>
      <p
        className="mt-2 font-display text-[32px] font-semibold leading-none"
        style={{
          color: accentColor,
          fontFeatureSettings: "'tnum'",
          letterSpacing: "-0.02em",
        }}
      >
        {value}
      </p>
    </div>
  );
}

/** Keep old MetricCard as an alias so other pages don't break */
export function MetricCard({
  label,
  value,
  accent,
}: {
  label: string;
  value: number | string;
  accent?: "teal" | "gold" | "destructive";
}) {
  const mappedAccent =
    accent === "destructive" ? "danger" : (accent as "teal" | "gold" | undefined);
  return <StatCard label={label} value={value} accent={mappedAccent} />;
}

