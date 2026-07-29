"use client";

import { useEffect, useRef, useState } from "react";
import { X } from "lucide-react";
import { assistantApi } from "@/lib/api/endpoints";
import { apiErrorDetail } from "@/lib/api/client";
import { useApiToken } from "@/lib/hooks/use-api-token";

/**
 * Floating help assistant.
 *
 * Answers questions about using Dentovox from a curated product document on the
 * backend — it has no access to this clinic's patients or calls, so asking it
 * something it shouldn't know gets an honest "check that page" instead of data.
 * Conversation lives in component state: closing the panel is a fresh start,
 * which is what people expect from a help bubble.
 */

interface Turn {
  role: "user" | "assistant";
  content: string;
}

const SUGGESTIONS = [
  "How do I forward my phone to the AI?",
  "Do I need my practice software connected?",
  "How do you pick who to reactivate?",
];

export function AssistantWidget() {
  const getToken = useApiToken();
  const [open, setOpen] = useState(false);
  const [turns, setTurns] = useState<Turn[]>([]);
  const [draft, setDraft] = useState("");
  const [busy, setBusy] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [turns, open]);

  async function send(text: string) {
    const question = text.trim();
    if (!question || busy) return;
    const history = turns;
    setTurns([...history, { role: "user", content: question }]);
    setDraft("");
    setBusy(true);
    try {
      const res = await assistantApi.ask(question, history, await getToken());
      setTurns((t) => [...t, { role: "assistant", content: res.reply }]);
    } catch (err) {
      setTurns((t) => [
        ...t,
        {
          role: "assistant",
          content:
            apiErrorDetail(err) ??
            "I'm having trouble right now. For anything urgent, email support@dentovox.com.",
        },
      ]);
    } finally {
      setBusy(false);
    }
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        aria-label="Open help assistant"
        className="fixed bottom-5 right-5 z-40 flex h-14 w-14 items-center justify-center rounded-full text-2xl shadow-lg transition-transform hover:scale-105"
        style={{ background: "#00897B" }}
      >
        <span aria-hidden>🦷</span>
      </button>
    );
  }

  return (
    <div className="fixed bottom-5 right-5 z-40 flex h-[540px] w-[min(380px,calc(100vw-2.5rem))] flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl">
      <header
        className="flex items-center gap-2 px-4 py-3 text-white"
        style={{ background: "#00897B" }}
      >
        <span className="text-xl" aria-hidden>🦷</span>
        <div className="flex-1">
          <p className="text-sm font-semibold leading-tight">Dentovox Help</p>
          <p className="text-[11px] opacity-90">Questions about your setup</p>
        </div>
        <button onClick={() => setOpen(false)} aria-label="Close help assistant">
          <X className="h-4 w-4" />
        </button>
      </header>

      <div className="flex-1 space-y-3 overflow-y-auto p-3">
        {turns.length === 0 && (
          <div className="space-y-2">
            <p className="text-[13px] text-gray-600">
              Ask me anything about using Dentovox — forwarding, scheduling,
              reactivation, billing. I don&apos;t see your patient data.
            </p>
            {SUGGESTIONS.map((s) => (
              <button
                key={s}
                onClick={() => send(s)}
                className="block w-full rounded-lg border border-gray-200 px-3 py-2 text-left text-[13px] text-gray-700 hover:border-teal hover:bg-teal-50/40"
              >
                {s}
              </button>
            ))}
          </div>
        )}
        {turns.map((t, i) => (
          <div
            key={i}
            className={
              t.role === "user"
                ? "ml-8 rounded-lg bg-teal-50 px-3 py-2 text-[13px] text-navy"
                : "mr-4 rounded-lg bg-gray-50 px-3 py-2 text-[13px] leading-relaxed text-gray-800"
            }
          >
            {t.content}
          </div>
        ))}
        {busy && (
          <p className="mr-4 rounded-lg bg-gray-50 px-3 py-2 text-[13px] text-gray-400">
            Thinking…
          </p>
        )}
        <div ref={endRef} />
      </div>

      <form
        className="flex gap-2 border-t border-gray-100 p-2.5"
        onSubmit={(e) => {
          e.preventDefault();
          send(draft);
        }}
      >
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Type your question…"
          aria-label="Your question"
          maxLength={2000}
          className="h-9 flex-1 rounded-md border border-input bg-background px-2.5 text-sm"
        />
        <button
          type="submit"
          disabled={busy || !draft.trim()}
          className="rounded-md px-3 text-sm font-medium text-white disabled:opacity-40"
          style={{ background: "#00897B" }}
        >
          Send
        </button>
      </form>
    </div>
  );
}
