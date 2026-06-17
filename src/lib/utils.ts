import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/** Merge conditional class names, de-duplicating Tailwind utilities. */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Format an AZN price stored in minor units (qəpik) for display, e.g. 1500 -> "15 ₼". */
export function formatPrice(amountMinor: number): string {
  const major = amountMinor / 100;
  const formatted = Number.isInteger(major)
    ? major.toString()
    : major.toFixed(2);
  return `${formatted} ₼`;
}

/** Format a date as "DD.MM.YYYY HH:mm" (deterministic, locale-independent). */
export function formatDateTime(date: Date): string {
  const p = (n: number) => n.toString().padStart(2, "0");
  return `${p(date.getDate())}.${p(date.getMonth() + 1)}.${date.getFullYear()} ${p(date.getHours())}:${p(date.getMinutes())}`;
}

/** Build a URL-safe slug from a free-text store name. */
export function slugify(input: string): string {
  return input
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/ə/g, "e")
    .replace(/ı/g, "i")
    .replace(/ç/g, "c")
    .replace(/ş/g, "s")
    .replace(/ğ/g, "g")
    .replace(/ö/g, "o")
    .replace(/ü/g, "u")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}
