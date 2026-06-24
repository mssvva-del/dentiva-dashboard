"use client";

import * as React from "react";
import { RetellWebClient } from "retell-client-js-sdk";
import { Phone, PhoneOff, Loader2 } from "lucide-react";
import { useApiToken } from "@/lib/hooks/use-api-token";
import { voiceApi } from "@/lib/api/endpoints";
import { showToast } from "@/lib/toast";
import { cn } from "@/lib/utils";

type CallState = "idle" | "connecting" | "live";

/**
 * Live voice-demo button: starts a Retell web call with the AI receptionist
 * right in the browser (mic). Built for screen-share demos — click, allow the
 * mic, and talk to "Grace".
 */
export function TalkToReceptionist() {
  const getToken = useApiToken();
  const [state, setState] = React.useState<CallState>("idle");
  const clientRef = React.useRef<RetellWebClient | null>(null);

  React.useEffect(() => {
    return () => {
      try {
        clientRef.current?.stopCall?.();
      } catch {
        /* noop */
      }
    };
  }, []);

  async function start() {
    if (state !== "idle") return;
    setState("connecting");

    // Step 1 — ask the browser for the microphone up front, with a clear
    // message if it's blocked (most common failure).
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      // Release immediately; the SDK opens its own stream.
      stream.getTracks().forEach((t) => t.stop());
    } catch (err) {
      console.error("mic permission error", err);
      showToast.error(
        "Microphone blocked. Click the 🎤 icon in the address bar → Allow, then try again."
      );
      setState("idle");
      return;
    }

    // Step 2 — mint a token from our backend.
    let accessToken: string;
    try {
      const res = await voiceApi.webCall(await getToken());
      accessToken = res.access_token;
    } catch (err) {
      console.error("web-call token error", err);
      showToast.error("Couldn't reach the voice service. Try again in a moment.");
      setState("idle");
      return;
    }

    // Step 3 — start the live call.
    try {
      const client = new RetellWebClient();
      clientRef.current = client;
      client.on("call_started", () => setState("live"));
      client.on("call_ended", () => {
        setState("idle");
        clientRef.current = null;
      });
      client.on("error", (err: unknown) => {
        console.error("retell web call error", err);
        showToast.error("Call error — ending.");
        try {
          client.stopCall();
        } catch {
          /* noop */
        }
        setState("idle");
        clientRef.current = null;
      });
      await client.startCall({ accessToken });
    } catch (err) {
      console.error("startCall error", err);
      showToast.error("Couldn't start the call. Please try again.");
      setState("idle");
      clientRef.current = null;
    }
  }

  function end() {
    try {
      clientRef.current?.stopCall?.();
    } catch {
      /* noop */
    }
    setState("idle");
    clientRef.current = null;
  }

  const live = state === "live";
  const connecting = state === "connecting";

  return (
    <div
      className="flex items-center justify-between gap-4 rounded-[14px] border p-5"
      style={{
        background: live
          ? "linear-gradient(135deg, #0A1929 0%, #0F2440 100%)"
          : "linear-gradient(135deg, #00897B 0%, #0A1929 100%)",
        borderColor: "transparent",
      }}
    >
      <div className="min-w-0">
        <p className="flex items-center gap-2 text-[14px] font-semibold text-white">
          {live ? (
            <>
              <span className="relative flex h-2.5 w-2.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75" />
                <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-red-500" />
              </span>
              On call with Dentovox
            </>
          ) : (
            "Talk to the AI receptionist"
          )}
        </p>
        <p className="mt-0.5 text-[12.5px] text-white/70">
          {live
            ? "Speak naturally — try booking or rescheduling an appointment."
            : "Live voice demo. Click, allow your microphone, and talk to Grace."}
        </p>
      </div>

      {live ? (
        <button
          onClick={end}
          className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-white px-5 py-2.5 text-[14px] font-semibold text-red-600 transition-transform hover:-translate-y-0.5"
        >
          <PhoneOff className="h-4 w-4" />
          End call
        </button>
      ) : (
        <button
          onClick={start}
          disabled={connecting}
          className={cn(
            "inline-flex shrink-0 items-center gap-2 rounded-xl bg-white px-5 py-2.5 text-[14px] font-semibold transition-transform hover:-translate-y-0.5 disabled:opacity-70",
          )}
          style={{ color: "#00897B" }}
        >
          {connecting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Connecting…
            </>
          ) : (
            <>
              <Phone className="h-4 w-4" />
              Start call
            </>
          )}
        </button>
      )}
    </div>
  );
}
