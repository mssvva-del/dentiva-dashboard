"use client";

import Link from "next/link";
import { notFound } from "next/navigation";
import { ScanLine, Boxes, Store, ArrowLeft, Sparkles } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

type Feature = {
  title: string;
  icon: LucideIcon;
  tagline: string;
  blurb: string;
  bullets: string[];
};

const FEATURES: Record<string, Feature> = {
  "xray-ai": {
    title: "X-Ray AI",
    icon: ScanLine,
    tagline: "AI reading of dental radiographs",
    blurb:
      "Automatic detection of caries, bone loss and other findings on X-rays, with confidence scores — a second pair of eyes for the clinician.",
    bullets: [
      "Caries & periapical detection on bitewings/PAs",
      "Bone-loss measurement for perio",
      "Confidence overlays the dentist can accept or dismiss",
      "Planned as an integration with a cleared imaging partner (FDA path)",
    ],
  },
  "implant-planner": {
    title: "Implant Planner",
    icon: Boxes,
    tagline: "3D implant planning from CBCT",
    blurb:
      "Plan implant placement on CBCT scans — angulation, depth and proximity to anatomy — to speed case acceptance and surgical guides.",
    bullets: [
      "Import DICOM / CBCT volumes",
      "Suggested implant position & size",
      "Nerve / sinus proximity warnings",
      "Export to surgical-guide workflows",
    ],
  },
  marketplace: {
    title: "Marketplace",
    icon: Store,
    tagline: "Supplies, services & add-ons in one place",
    blurb:
      "Order consumables, book labs, and enable Dentovox add-on modules — billed alongside your subscription.",
    bullets: [
      "Curated supplies & lab services",
      "One-click add-on modules",
      "Consolidated invoicing via your account",
      "Partner offers for Dentovox practices",
    ],
  },
};

export default function ComingSoonPage({
  params,
}: {
  params: { feature: string };
}) {
  const { feature } = params;
  const data = FEATURES[feature];
  if (!data) notFound();
  const Icon = data.icon;

  return (
    <div className="max-w-2xl">
      <div className="mb-4">
        <Link href="/">
          <Button variant="ghost" size="sm" className="gap-1.5 text-gray-500">
            <ArrowLeft className="h-4 w-4" />
            Back to dashboard
          </Button>
        </Link>
      </div>

      <PageHeader title={data.title} breadcrumb="Dashboard / Roadmap" subtitle={data.tagline} />

      <Card className="overflow-hidden shadow-sm">
        <CardContent className="p-8 text-center">
          <div
            className="mx-auto grid h-16 w-16 place-items-center rounded-2xl"
            style={{ background: "rgba(0,137,123,0.10)", color: "#00897B" }}
            aria-hidden
          >
            <Icon className="h-8 w-8" />
          </div>
          <span
            className="mt-4 inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-wider"
            style={{ background: "rgba(201,169,97,0.18)", color: "#B7791F" }}
          >
            <Sparkles className="h-3 w-3" aria-hidden />
            On the roadmap
          </span>
          <p className="mx-auto mt-4 max-w-md text-[14px] leading-relaxed text-gray-600">
            {data.blurb}
          </p>

          <ul className="mx-auto mt-6 max-w-sm space-y-2 text-left">
            {data.bullets.map((b) => (
              <li key={b} className="flex items-start gap-2 text-[13px] text-navy">
                <span
                  className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full"
                  style={{ background: "#00897B" }}
                  aria-hidden
                />
                {b}
              </li>
            ))}
          </ul>

          <p className="mt-6 text-[12px] text-gray-400">
            Want this prioritized for your practice? Tell us — it helps us sequence the roadmap.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
