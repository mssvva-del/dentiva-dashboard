"use client";

import * as React from "react";
import { NotebookPen } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

/** A note the front desk reads before the patient walks in, and can correct.
 *
 *  Callers say things no field holds — which tooth, how long it has hurt, who is
 *  driving them, that the last cleaning was painful. Until now all of it lived
 *  inside a transcript nobody opens, so this screen said "Cleaning, 9:00" and
 *  stopped there.
 *
 *  Used for both notes: the one about a visit, written by the agent during the
 *  call, and the one about the person, which outlives every appointment.
 */
export function NotesCard({
  title,
  hint,
  placeholder,
  value,
  onSave,
  saving,
}: {
  title: string;
  hint: string;
  placeholder: string;
  value: string | null | undefined;
  onSave: (notes: string) => void;
  saving?: boolean;
}) {
  const saved = value ?? "";
  const [draft, setDraft] = React.useState(saved);
  // A note that arrives late, or one somebody saved on another screen, has to
  // reach the box — but not over half a sentence the front desk is still
  // typing. "Untouched" means the draft still matches the value we last saw
  // from the server, which is why the previous one is remembered: comparing
  // against the NEW value calls every server change a local edit.
  const lastSaved = React.useRef(saved);
  React.useEffect(() => {
    if (saved !== lastSaved.current) {
      if (draft === lastSaved.current) setDraft(saved);
      lastSaved.current = saved;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [saved]);
  const dirty = draft !== saved;

  return (
    <Card className="overflow-hidden shadow-sm">
      <CardHeader className="flex-row items-center justify-between border-b border-gray-100 px-6 py-4">
        <CardTitle className="font-display flex items-center gap-2 font-semibold text-navy" style={{ fontSize: 16 }}>
          <NotebookPen className="h-4 w-4 opacity-60" />
          {title}
        </CardTitle>
        {dirty && (
          <Button size="sm" onClick={() => onSave(draft.trim())} disabled={saving}>
            {saving ? "Saving…" : "Save"}
          </Button>
        )}
      </CardHeader>
      <CardContent className="space-y-2 p-6">
        <textarea
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder={placeholder}
          rows={4}
          maxLength={4000}
          className="w-full resize-y rounded-md border border-gray-200 px-3 py-2 text-sm text-navy outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
        />
        <p className="text-[12px] text-gray-500">{hint}</p>
      </CardContent>
    </Card>
  );
}
