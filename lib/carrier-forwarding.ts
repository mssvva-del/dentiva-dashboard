/**
 * Call-forwarding steps per US carrier.
 *
 * The distinction that matters and that most guides bury: forwarding EVERY call
 * ("unconditional") vs forwarding only when nobody picks up ("no answer"). Our
 * overflow mode — the one most practices want, where the front desk always gets
 * first crack — needs the no-answer variant. Getting this wrong means either the
 * team never hears the phone, or the AI never does.
 *
 * Codes are dialled on the practice's own line. We cannot set any of this for the
 * clinic: forwarding belongs to the line's account holder.
 */

export interface CarrierSteps {
  /** Forward only when nobody answers — the front desk keeps first pick-up. */
  noAnswer: string | null;
  /** Forward every call straight to the AI. */
  allCalls: string;
  /** Turn forwarding back off. */
  disable: string;
  /** Anything specific to this carrier worth saying out loud. */
  note?: string;
}

export interface Carrier {
  id: string;
  name: string;
  steps: CarrierSteps;
}

/** `{n}` is replaced with the practice's Dentovox number. */
export const CARRIERS: Carrier[] = [
  {
    id: "verizon",
    name: "Verizon",
    steps: {
      noAnswer: "Dial *71 then {n}, then press call. Wait for the confirmation tone.",
      allCalls: "Dial *72 then {n}, then press call.",
      disable: "Dial *73 to turn forwarding off.",
    },
  },
  {
    id: "att",
    name: "AT&T",
    steps: {
      noAnswer: "Dial *61* then {n} then #, and press call.",
      allCalls: "Dial *21* then {n} then #, and press call.",
      disable: "Dial #61# (no-answer) or #21# (all calls) to turn it off.",
    },
  },
  {
    id: "tmobile",
    name: "T-Mobile",
    steps: {
      noAnswer: "Dial **61* then {n} then #, and press call.",
      allCalls: "Dial **21* then {n} then #, and press call.",
      disable: "Dial ##61# (no-answer) or ##21# (all calls).",
    },
  },
  {
    id: "spectrum",
    name: "Spectrum Business",
    steps: {
      noAnswer: "In the Spectrum Business voice portal, set Call Forwarding No Answer to {n}.",
      allCalls: "Dial *72 then {n}, or set Call Forwarding Always to {n} in the portal.",
      disable: "Dial *73, or switch it off in the portal.",
      note: "Spectrum accounts differ — if the star codes don't take, use the voice portal.",
    },
  },
  {
    id: "comcast",
    name: "Comcast Business",
    steps: {
      noAnswer: "In My Account → Voice → Call Forwarding, set 'Call Forward No Answer' to {n}.",
      allCalls: "Dial *72 then {n}, or set 'Call Forward Always' to {n} in My Account.",
      disable: "Dial *73, or turn it off in My Account.",
    },
  },
  {
    id: "ringcentral",
    name: "RingCentral",
    steps: {
      noAnswer:
        "Admin Portal → Users (or Call Queue) → Call Handling → Forward to External Number → {n}, after 3–4 rings.",
      allCalls: "Same screen — set forwarding to {n} with no ring delay.",
      disable: "Remove {n} from the forwarding list in the same screen.",
      note: "RingCentral has no star codes — everything is in the admin portal.",
    },
  },
  {
    id: "vonage",
    name: "Vonage / 8x8 / other VoIP",
    steps: {
      noAnswer:
        "In your provider's admin portal, find Call Forwarding (sometimes 'Call Handling') and forward on no-answer to {n}.",
      allCalls: "Same screen — forward all calls to {n}.",
      disable: "Remove {n} from the forwarding settings.",
      note: "Wording differs per provider, but every business VoIP portal has this setting.",
    },
  },
  {
    id: "other",
    name: "Other / I'm not sure",
    steps: {
      noAnswer: "Most landlines: dial *71 then {n}. If that doesn't work, ask your provider for 'call forward on no answer'.",
      allCalls: "Most landlines: dial *72 then {n}.",
      disable: "Dial *73.",
      note:
        "Not sure who your carrier is? Look at the phone bill for the practice line, or call the number on it and ask for 'call forwarding setup'. The AI number to give them is below.",
    },
  },
];

export function fillNumber(step: string, number: string): string {
  return step.replace(/\{n\}/g, number);
}
