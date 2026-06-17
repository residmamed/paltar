/**
 * Normalize an Azerbaijani phone number to E.164 (+994XXXXXXXXX).
 * Accepts common local formats: 0XX XXX XX XX, +994XX..., 994XX..., XX XXX XX XX.
 * Returns null if it cannot be normalized to a plausible AZ mobile number.
 */
export function normalizePhone(input: string): string | null {
  let digits = input.replace(/[^\d+]/g, "");
  if (digits.startsWith("+")) digits = digits.slice(1);

  if (digits.startsWith("994")) {
    digits = digits.slice(3);
  } else if (digits.startsWith("0")) {
    digits = digits.slice(1);
  }

  // AZ mobile subscriber numbers are 9 digits (operator code + 7 digits).
  if (!/^\d{9}$/.test(digits)) return null;
  return `+994${digits}`;
}

/** Mask a phone for display, e.g. +994501234567 -> +994 50 ***  ** 67 */
export function maskPhone(phone: string): string {
  if (phone.length < 6) return phone;
  return `${phone.slice(0, 6)}*** ** ${phone.slice(-2)}`;
}
