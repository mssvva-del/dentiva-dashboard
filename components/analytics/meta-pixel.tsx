"use client";

/**
 * Meta Pixel — on the three PHI-free pages only (sign-up, onboarding, billing).
 *
 * This dashboard shows patients: names, numbers, call transcripts. A pixel
 * loaded everywhere sends Meta the URL and title of every page and, by default,
 * scrapes buttons and records SPA navigations — for a HIPAA business associate
 * that is a disclosure. So it is never mounted in a layout, automatic
 * configuration is off, and history tracking is off: once loaded it sends only
 * the event a page asks for. Same pixel id as dentovox.com, so the ads see one
 * funnel; custom conversions tell the two hosts apart by URL.
 */

import { useEffect } from "react";

const PIXEL_ID = "1225254477647697";

type Fbq = ((...args: unknown[]) => void) & {
  callMethod?: (...args: unknown[]) => void;
  queue?: unknown[];
  loaded?: boolean;
  version?: string;
  push?: unknown;
  disablePushState?: boolean;
};

function fbq(): Fbq {
  const w = window as unknown as { fbq?: Fbq; _fbq?: Fbq };
  if (!w.fbq) {
    const n = function (...args: unknown[]) {
      if (n.callMethod) n.callMethod(...args);
      else n.queue!.push(args);
    } as Fbq;
    n.push = n; n.loaded = true; n.version = "2.0"; n.queue = [];
    n.disablePushState = true;
    w.fbq = n; w._fbq = n;
    const s = document.createElement("script");
    s.async = true;
    s.src = "https://connect.facebook.net/en_US/fbevents.js";
    document.head.appendChild(s);
    n("set", "autoConfig", false, PIXEL_ID);
    n("init", PIXEL_ID);
  }
  return w.fbq;
}

/**
 * Send one event once. `onceKey` (kept in localStorage) stops a reload or a
 * second visit from counting the same registration or trial twice; `eventId`
 * lets Meta merge it with the same event sent server-side.
 */
export function MetaPixelEvent({
  event, params, eventId, onceKey, when = true,
}: {
  event: string;
  params?: Record<string, unknown>;
  eventId?: string;
  onceKey?: string;
  when?: boolean;
}) {
  useEffect(() => {
    if (!when) return;
    try {
      if (onceKey && localStorage.getItem(onceKey)) return;
      onceKey && localStorage.setItem(onceKey, "1");
    } catch { /* private mode: count it, better than not */ }
    fbq()("track", event, params ?? {}, eventId ? { eventID: eventId } : undefined);
  }, [event, eventId, onceKey, when, params]);
  return null;
}
