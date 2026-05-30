import * as React from "react";

export function PageHeader({
  title,
  subtitle,
  breadcrumb,
  action,
}: {
  title: string;
  subtitle?: string;
  breadcrumb?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="mb-6 flex items-start justify-between gap-4">
      <div>
        {breadcrumb ? (
          <p className="mb-1 text-[11px] font-semibold uppercase tracking-widest text-gray-500">
            {breadcrumb}
          </p>
        ) : null}
        <h1
          className="font-display text-[28px] font-semibold leading-tight tracking-tight text-navy"
          style={{ letterSpacing: "-0.015em" }}
        >
          {title}
        </h1>
        {subtitle ? (
          <p className="mt-1 text-sm text-gray-500">{subtitle}</p>
        ) : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}
