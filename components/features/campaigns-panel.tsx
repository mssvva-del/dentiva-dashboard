"use client";

import { useRef, useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { reactivationApi, type CampaignRow } from "@/lib/api/endpoints";
import { apiErrorDetail } from "@/lib/api/client";
import { showToast } from "@/lib/toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

/**
 * Clinic-authored campaigns (2026-07): upload contacts (CSV file / pasted list /
 * one number), write your own message, launch SMS/voice outreach.
 *
 * Compliance is enforced server-side; the UI mirrors it honestly:
 *  - "Promotional" requires the written-consent attestation checkbox (recorded).
 *  - Treatment campaigns with promo wording get blocked by the backend gate —
 *    surfaced here so the clinic isn't confused by silent skips.
 */
const KEY = ["reactivation", "campaigns"];

export function CampaignsPanel() {
  const { getToken } = useAuth();
  const qc = useQueryClient();
  const { data: campaigns } = useQuery({
    queryKey: KEY,
    queryFn: async () => reactivationApi.campaigns(await getToken()),
    staleTime: 15_000,
    retry: false,
  });

  return (
    <div className="mt-8 space-y-6">
      <div>
        <h2 className="font-display text-xl font-semibold text-foreground">
          Outreach campaigns
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Upload patient contacts, write your message, and let the AI reach out
          by text or phone.
        </p>
      </div>
      <NewCampaignForm onDone={() => qc.invalidateQueries({ queryKey: KEY })} />
      <CampaignsTable rows={campaigns ?? []} />
    </div>
  );
}

function NewCampaignForm({ onDone }: { onDone: () => void }) {
  const { getToken } = useAuth();
  const fileRef = useRef<HTMLInputElement>(null);
  const [name, setName] = useState("");
  const [contacts, setContacts] = useState("");
  const [message, setMessage] = useState("");
  const [category, setCategory] = useState<"treatment" | "marketing">("treatment");
  const [channels, setChannels] = useState<"sms" | "voice" | "both">("sms");
  const [attested, setAttested] = useState(false);
  // Launching texts/calls REAL patients — never on one click. The confirm step
  // shows who and what before anything sends.
  const [confirming, setConfirming] = useState(false);

  // Client-side estimate for the confirm dialog (the server does the real parse).
  const estimatedContacts = contacts
    .split(/[\n;]+|,(?=\s*\+?\d)/)
    .filter((chunk) => (chunk.match(/\d/g) ?? []).length >= 7).length;

  const create = useMutation({
    mutationFn: async () =>
      reactivationApi.createCampaign(
        {
          name,
          contacts_text: contacts,
          custom_context: message || null,
          category,
          channels,
          consent_attested: attested,
          launch_now: true,
        },
        await getToken(),
      ),
    onSuccess: (res) => {
      const i = res.intake;
      showToast.success(
        `Campaign launched — ${res.campaign.enrolled} enrolled ` +
        `(${i.added} new, ${i.updated} updated` +
        (i.invalid_count ? `, ${i.invalid_count} invalid skipped` : "") + ").",
      );
      setName(""); setContacts(""); setMessage(""); setAttested(false);
      setConfirming(false);
      if (fileRef.current) fileRef.current.value = "";
      onDone();
    },
    onError: (err) => {
      setConfirming(false);
      showToast.error(apiErrorDetail(err) ?? "Couldn't create campaign.");
    },
  });

  const onFile = async (f: File | undefined) => {
    if (!f) return;
    const text = await f.text();
    setContacts(text);
    showToast.info(`Loaded ${f.name}`);
  };

  const marketing = category === "marketing";
  const valid =
    name.trim() && contacts.trim() && (!marketing || (attested && message.trim()));

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5">
      <h3 className="text-sm font-semibold">New campaign</h3>
      <div className="mt-3 grid gap-4 lg:grid-cols-2">
        <div className="space-y-3">
          <label className="block text-sm">
            <span className="text-xs text-muted-foreground">Campaign name</span>
            <Input value={name} onChange={(e) => setName(e.target.value)}
              placeholder="Annual checkup push" />
          </label>
          <label className="block text-sm">
            <span className="text-xs text-muted-foreground">
              Contacts — upload a file or paste numbers (one per line, or CSV
              with name,phone)
            </span>
            <input ref={fileRef} type="file" accept=".csv,.txt"
              className="mt-1 block w-full text-xs"
              onChange={(e) => onFile(e.target.files?.[0])} />
            <textarea
              value={contacts}
              onChange={(e) => setContacts(e.target.value)}
              rows={5}
              placeholder={"Mike,7322840545\n9175722233\n+1 (908) 555-0140"}
              className="mt-2 w-full rounded-md border border-input bg-background p-2 font-mono text-xs"
            />
          </label>
        </div>
        <div className="space-y-3">
          <label className="block text-sm">
            <span className="text-xs text-muted-foreground">
              Your message / direction (goes into the text & the call)
            </span>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={3}
              placeholder="It's time for your annual checkup — we have openings this week."
              className="mt-1 w-full rounded-md border border-input bg-background p-2 text-sm"
            />
          </label>
          <div className="flex flex-wrap gap-3">
            <label className="text-sm">
              <span className="block text-xs text-muted-foreground">Type</span>
              <select value={category}
                onChange={(e) => setCategory(e.target.value as "treatment" | "marketing")}
                className="mt-1 h-9 rounded-md border border-input bg-background px-2 text-sm">
                <option value="treatment">Care reminder (checkups, recalls)</option>
                <option value="marketing">Promotional (offers, discounts)</option>
              </select>
            </label>
            <label className="text-sm">
              <span className="block text-xs text-muted-foreground">Channels</span>
              <select value={channels}
                onChange={(e) => setChannels(e.target.value as "sms" | "voice" | "both")}
                className="mt-1 h-9 rounded-md border border-input bg-background px-2 text-sm">
                <option value="sms">Text only</option>
                <option value="voice">Calls only</option>
                <option value="both">Text + calls</option>
              </select>
            </label>
          </div>
          {marketing ? (
            <label className="flex items-start gap-2 rounded-md border border-amber-300 bg-amber-50 p-3 text-xs text-amber-900">
              <input type="checkbox" checked={attested}
                onChange={(e) => setAttested(e.target.checked)} className="mt-0.5" />
              <span>
                I confirm every uploaded patient gave our practice{" "}
                <b>prior express written consent</b> to receive promotional
                messages (required by US law — TCPA). This confirmation is
                recorded with my name and time.
              </span>
            </label>
          ) : (
            <p className="text-xs text-muted-foreground">
              Care reminders are sent under standard patient consent. Promotional
              wording (discounts, offers) is automatically blocked in this type —
              switch to &ldquo;Promotional&rdquo; if that&apos;s your goal.
            </p>
          )}
          <div className="flex justify-end">
            <Button disabled={!valid || create.isPending} onClick={() => setConfirming(true)}>
              Review & launch
            </Button>
          </div>
        </div>
      </div>

      {confirming && (
        <div className="mt-4 rounded-lg border border-teal-200 bg-teal-50/60 p-4">
          <p className="text-sm font-semibold text-navy">
            Ready to launch &ldquo;{name.trim()}&rdquo;?
          </p>
          <ul className="mt-2 space-y-1 text-sm text-gray-700">
            <li>
              • Reaches about <b>{estimatedContacts || "?"}</b>{" "}
              {estimatedContacts === 1 ? "patient" : "patients"} by{" "}
              <b>
                {channels === "sms" ? "text" : channels === "voice" ? "phone call" : "text + phone call"}
              </b>
              , starting now (within allowed hours).
            </li>
            <li>
              • Message: {message.trim()
                ? <span className="italic">&ldquo;{message.trim()}&rdquo;</span>
                : <span className="text-gray-500">standard recall wording</span>}
            </li>
            <li>• Patients can reply STOP at any time — we handle opt-outs automatically.</li>
          </ul>
          <div className="mt-3 flex justify-end gap-2">
            <Button variant="ghost" size="sm" disabled={create.isPending}
              onClick={() => setConfirming(false)}>
              Go back
            </Button>
            <Button size="sm" disabled={create.isPending} onClick={() => create.mutate()}>
              {create.isPending ? "Launching…" : "Yes, launch now"}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

function CampaignsTable({ rows }: { rows: CampaignRow[] }) {
  const { getToken } = useAuth();
  const qc = useQueryClient();
  const toggle = useMutation({
    mutationFn: async (c: CampaignRow) =>
      c.status === "running"
        ? reactivationApi.pauseCampaign(c.id, await getToken())
        : reactivationApi.launchCampaign(c.id, await getToken()),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
    onError: (err) => showToast.error(apiErrorDetail(err) ?? "Couldn't update campaign."),
  });

  if (rows.length === 0) return null;
  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
      <table className="w-full text-sm">
        <thead className="bg-gray-50 text-left text-xs uppercase text-gray-500">
          <tr>
            <th className="px-4 py-2.5">Campaign</th>
            <th className="px-4 py-2.5">Status</th>
            <th className="px-4 py-2.5">Enrolled</th>
            <th className="px-4 py-2.5">Contacted</th>
            <th className="px-4 py-2.5">Booked</th>
            <th className="px-4 py-2.5"></th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {rows.map((c) => (
            <tr key={c.id}>
              <td className="px-4 py-2.5">
                <p className="font-medium">{c.name}</p>
                <p className="text-xs text-muted-foreground">
                  {c.category === "marketing" ? "Promotional" : "Care reminder"} ·{" "}
                  {c.channels}
                </p>
              </td>
              <td className="px-4 py-2.5 capitalize">{c.status}</td>
              <td className="px-4 py-2.5">{c.enrolled}</td>
              <td className="px-4 py-2.5">{c.contacted}</td>
              <td className="px-4 py-2.5">{c.booked}</td>
              <td className="px-4 py-2.5 text-right">
                {(c.status === "running" || c.status === "paused" || c.status === "draft") && (
                  <Button size="sm" variant="outline" disabled={toggle.isPending}
                    onClick={() => toggle.mutate(c)}>
                    {c.status === "running" ? "Pause" : "Launch"}
                  </Button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
