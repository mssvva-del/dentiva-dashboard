/** How a US number reads to a person, and a link that dials it.
 *
 *  The clinic's screens showed "⋯7824" — the last four digits of the patient's
 *  phone. On a callback list, a waitlist and a booking, all three of which exist
 *  so somebody can pick up the phone, that is the one field that had to be there.
 */

export function formatPhone(raw: string | null | undefined): string | null {
  if (!raw) return null;
  const digits = raw.replace(/\D/g, "");
  const ten = digits.length === 11 && digits.startsWith("1")
    ? digits.slice(1)
    : digits;
  if (ten.length !== 10) return raw; // not a US number — show it as given
  return `(${ten.slice(0, 3)}) ${ten.slice(3, 6)}-${ten.slice(6)}`;
}

export function telHref(raw: string | null | undefined): string | null {
  if (!raw) return null;
  const digits = raw.replace(/[^\d+]/g, "");
  return digits ? `tel:${digits}` : null;
}
