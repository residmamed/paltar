import { prisma } from "@/lib/db";
import { ListingState, Role } from "@/generated/prisma/enums";
import { REGULAR_LISTING_LIMIT } from "@/lib/constants";
import type { ListingInput } from "@/lib/validations/listing";

/** States that consume a listing slot (see CONTEXT.md "Listing allowance"). */
export const COUNTED_STATES: ListingState[] = [
  ListingState.PENDING,
  ListingState.ACTIVE,
];

/** Content fields whose change forces re-review. Price/negotiable are excluded. */
export const CONTENT_FIELDS = [
  "title",
  "description",
  "department",
  "category",
  "condition",
  "brand",
  "size",
  "city",
  "contactPhone",
] as const;

export function isUnlimited(role: Role): boolean {
  return role === Role.STORE || role === Role.ADMIN;
}

export async function countCommittedListings(
  ownerId: string,
  excludeId?: string,
): Promise<number> {
  return prisma.listing.count({
    where: {
      ownerId,
      state: { in: COUNTED_STATES },
      ...(excludeId ? { id: { not: excludeId } } : {}),
    },
  });
}

/** Whether the user has room for one more committed (PENDING/ACTIVE) listing. */
export async function hasFreeSlot(
  user: { id: string; role: Role },
  excludeId?: string,
): Promise<boolean> {
  if (isUnlimited(user.role)) return true;
  const count = await countCommittedListings(user.id, excludeId);
  return count < REGULAR_LISTING_LIMIT;
}

/**
 * Decide whether an edit only touched price/negotiable. If any CONTENT_FIELD or
 * the image set changed, the listing must be re-reviewed.
 */
export function isContentChanged(
  current: {
    title: string;
    description: string;
    department: string;
    category: string;
    condition: string;
    brand: string | null;
    size: string;
    city: string;
    contactPhone: string;
    images: { url: string }[];
  },
  next: ListingInput,
): boolean {
  for (const f of CONTENT_FIELDS) {
    const a = (current[f] ?? "") as string;
    const b = ((next[f] ?? "") as string) || "";
    if (a !== b) return true;
  }
  const currentUrls = current.images.map((i) => i.url);
  if (currentUrls.length !== next.images.length) return true;
  return currentUrls.some((url, i) => url !== next.images[i]);
}
