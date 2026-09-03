"use client";

import * as React from "react";
import { Pencil } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useEditPatient } from "@/lib/hooks/use-patients";
import type { PatientDetailResponse } from "@/lib/schemas/patients";

/** Correct what the call got wrong.
 *
 *  Every field on this card was filled by an agent listening to a phone line: a
 *  name heard over a bad connection, a number written down before the caller
 *  corrected it, a birthday given as a month and a day. Until now the front desk
 *  could only read them — and a wrong number is the one that reminders go to.
 *
 *  Changes land in Dentovox. The practice software keeps its own copy, which is
 *  why the card says so rather than implying a sync that does not happen.
 */
export function PatientEditor({ patient }: { patient: PatientDetailResponse }) {
  const [open, setOpen] = React.useState(false);
  const edit = useEditPatient();

  const [form, setForm] = React.useState({
    first_name: patient.first_name ?? "",
    last_name: patient.last_name ?? "",
    phone: patient.phone ?? "",
    date_of_birth: patient.date_of_birth ?? "",
    preferred_language: patient.preferred_language ?? "en",
  });

  // Adopt a record that arrived (or changed elsewhere) while the form is shut.
  React.useEffect(() => {
    if (!open) {
      setForm({
        first_name: patient.first_name ?? "",
        last_name: patient.last_name ?? "",
        phone: patient.phone ?? "",
        date_of_birth: patient.date_of_birth ?? "",
        preferred_language: patient.preferred_language ?? "en",
      });
    }
  }, [open, patient]);

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  function save() {
    edit.mutate(
      { id: patient.patient_id, data: { ...form, phone: form.phone.trim() } },
      { onSuccess: () => setOpen(false) }
    );
  }

  if (!open) {
    return (
      <Button
        variant="outline"
        size="sm"
        className="gap-1.5"
        onClick={() => setOpen(true)}
      >
        <Pencil className="h-3.5 w-3.5" />
        Edit details
      </Button>
    );
  }

  return (
    <Card className="overflow-hidden shadow-sm">
      <CardHeader className="border-b border-gray-100 px-6 py-4">
        <CardTitle className="text-[15px] font-semibold text-navy">
          Patient details
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 p-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="p-first">First name</Label>
            <Input id="p-first" value={form.first_name} onChange={set("first_name")} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="p-last">Last name</Label>
            <Input id="p-last" value={form.last_name} onChange={set("last_name")} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="p-phone">Phone</Label>
            <Input
              id="p-phone"
              value={form.phone}
              onChange={set("phone")}
              placeholder="+16175550142"
            />
            <p className="text-[12px] text-gray-500">
              Where reminders go, and how this patient is recognised when they
              call back.
            </p>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="p-dob">Date of birth</Label>
            {/* Native date input: the browser knows the local format, and it
                cannot produce the "March-ish 1979" a free-text box invites. */}
            <Input
              id="p-dob"
              type="date"
              value={form.date_of_birth}
              onChange={set("date_of_birth")}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="p-lang">Language</Label>
            <select
              id="p-lang"
              value={form.preferred_language}
              onChange={(e) =>
                setForm((f) => ({ ...f, preferred_language: e.target.value }))
              }
              className="h-10 w-full rounded-md border border-gray-200 bg-white px-3 text-sm text-navy outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
            >
              <option value="en">English</option>
              <option value="es">Spanish</option>
            </select>
            <p className="text-[12px] text-gray-500">
              The language the receptionist speaks to them in.
            </p>
          </div>
        </div>

        <p className="text-[12px] text-gray-500">
          Saved in Dentovox. Your practice software keeps its own copy — change
          it there too if it matters for billing.
        </p>

        <div className="flex gap-2">
          <Button size="sm" onClick={save} disabled={edit.isPending}>
            {edit.isPending ? "Saving…" : "Save changes"}
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setOpen(false)}
            disabled={edit.isPending}
          >
            Cancel
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
