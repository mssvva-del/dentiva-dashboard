/**
 * Plain-English answers to what a dentist actually worries about.
 *
 * One source of truth: the setup wizard and the practice pages read from here,
 * and the same copy is handed to the marketing site so a prospect and a customer
 * never get two different stories. Written for someone who has never configured
 * phone software — no jargon, no "simply", concrete numbers where they exist.
 */

export interface FaqItem {
  q: string;
  a: string;
}

/** Phone forwarding — the step that scares people most. */
export const FAQ_PHONE: FaqItem[] = [
  {
    q: "Do I have to change my phone number?",
    a: "No. You keep the number your patients already know. You just tell your phone company to forward calls to the Dentovox number shown above — your number never changes, and you can turn forwarding off any time.",
  },
  {
    q: "Can Dentovox turn on forwarding for me?",
    a: "No — and no service can. Forwarding lives on your phone line, so only the account holder (you, with your phone company) can switch it on. It takes about two minutes: usually you dial *72 followed by the Dentovox number. We show the exact steps for your carrier on this page.",
  },
  {
    q: "Will the AI answer every call, even when my front desk is free?",
    a: "That's your choice. Most practices start with 'overflow' — the AI only picks up when nobody answers after about 3 rings (you can change how many), so your team always gets first crack. You can also pick after-hours only, or full-time.",
  },
  {
    q: "What happens to a call if the AI can't help?",
    a: "It transfers to the number you set as your emergency/transfer line, or takes a message and creates a callback request you'll see in the dashboard. It never hangs up on a patient.",
  },
  {
    q: "How do I know forwarding actually worked?",
    a: "Call your own practice number from a mobile phone. If the AI answers, forwarding is working — that's the whole test.",
  },
  {
    q: "How do I turn it off?",
    a: "Dial *73 on your practice line (most carriers) and calls go straight to your desk again. Nothing else in Dentovox changes.",
  },
];

/** PMS / practice-management connection — where expectations need managing. */
export const FAQ_PMS: FaqItem[] = [
  {
    q: "Do I need my practice software connected before I can use this?",
    a: "No. Dentovox has its own scheduling built in, and it works from the moment you finish setup — it uses your business hours and the appointments it books, so the AI never invents a time you don't have.",
  },
  {
    q: "Why isn't the connection instant?",
    a: "Practice-management systems aren't like connecting a Google account. Open Dental runs on a computer in your office and has to be opened up for access from your side; NexHealth installs a sync for your specific practice. Both need a person on their end, so it's typically 1–2 business days after you pick one.",
  },
  {
    q: "What happens after I choose my system here?",
    a: "We create a connection request and email you a short checklist of what's needed from your office. Nothing you do here breaks anything, and your AI receptionist keeps working with built-in scheduling in the meantime.",
  },
  {
    q: "What does connecting my PMS actually get me?",
    a: "Two things: the AI reads your real open slots instead of built-in scheduling, and appointments it books land directly in your existing calendar — so your front desk doesn't retype anything.",
  },
  {
    q: "Can I skip this for now?",
    a: "Yes. Choose 'Skip for now' and connect later from Settings whenever you're ready. Nothing about the phone answering depends on it.",
  },
];

/** The AI receptionist itself — trust and control. */
export const FAQ_AGENT: FaqItem[] = [
  {
    q: "Will patients know they're talking to AI?",
    a: "Yes. The receptionist says it's a virtual assistant in the greeting, and if a patient asks directly it answers honestly. That's both the law in several states and simply better — callers trust it more than a robot pretending to be human.",
  },
  {
    q: "What if someone calls with an emergency?",
    a: "Bleeding, swelling, severe pain or trouble breathing put the call into emergency handling: the AI stops trying to schedule and either transfers to your emergency number or takes urgent details for an immediate callback. This is enforced by our system, not just by wording in a script.",
  },
  {
    q: "Can it say something wrong about my practice?",
    a: "It only answers from what you give it — your hours, doctors, services, insurances and policies in Knowledge Base. If it doesn't know something, it says so and offers a callback instead of guessing.",
  },
  {
    q: "Can I change its name or how it greets people?",
    a: "Yes, any time in Settings → AI Agent. The name and greeting take effect on the very next call.",
  },
  {
    q: "Can I listen to what it said?",
    a: "Every call has a transcript in the Calls page, with the outcome (booked, question answered, transferred). Nothing is hidden from you.",
  },
];

/** Reactivation — the part clinics don't know how to start. */
export const FAQ_REACTIVATION: FaqItem[] = [
  {
    q: "How do you know which patients to reach out to?",
    a: "Three ways, and you choose. If your practice software is connected, we find them automatically — patients with no visit in the last 18 months (you can change that), patients overdue for a recall, and patients who accepted treatment but never booked it. If it isn't connected, upload a spreadsheet, or add people by hand.",
  },
  {
    q: "My records are on paper. Can I still use this?",
    a: "Yes. Type them into the spreadsheet template we provide (name, phone, last visit if you know it) and upload it. Anything you don't know can stay blank.",
  },
  {
    q: "Is it legal to call or text old patients?",
    a: "For your own former patients, appointment-related outreach is generally allowed — but the rules are strict. Dentovox enforces them: no contact outside 9am–8pm local time, limits on how often one person is contacted, an opt-out honoured immediately, and no promotional wording unless you explicitly turn it on.",
  },
  {
    q: "What if someone asks to stop?",
    a: "They're opted out instantly and permanently — by replying STOP to a text, or just saying it on a call. We never contact them again for any campaign.",
  },
  {
    q: "Will it sound like spam?",
    a: "It's written as a check-in from their own dental office, not a sales pitch — it mentions how long it's been, offers a time, and stops after one polite follow-up if they're not interested.",
  },
];

/** Terms & BAA — signed by a person who isn't a lawyer. */
export const FAQ_TERMS: FaqItem[] = [
  {
    q: "What is a BAA and why am I signing one?",
    a: "A Business Associate Agreement is the HIPAA contract between your practice and any vendor that handles patient information on your behalf. Since the AI talks to your patients, you're required to have one with us. Signing here records it properly — who signed, when, and which version.",
  },
  {
    q: "Where is patient information stored?",
    a: "Names, phone numbers and call transcripts are encrypted before they're written to our database, and each practice's data is walled off from every other practice's at the database level, not just in the app.",
  },
  {
    q: "Can I get my data out, or deleted?",
    a: "Yes. Bookings export to a spreadsheet from the Bookings page, and you can ask us to delete your practice's data — we'll confirm when it's done.",
  },
];

/** Business hours — small step, common confusion. */
export const FAQ_HOURS: FaqItem[] = [
  {
    q: "Do these hours mean the AI stops answering?",
    a: "No — the AI answers 24/7 if you forward calls to it. These are your front desk hours: they're what the AI offers as appointment times, and what it tells a patient who asks when you're open.",
  },
  {
    q: "We close for lunch. Should I split the hours?",
    a: "Keep it simple — set open to close. If a specific time is already taken it won't be offered anyway, and you can block time in your own calendar as usual.",
  },
];
