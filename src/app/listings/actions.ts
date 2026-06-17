"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth-helpers";
import { normalizePhone } from "@/lib/phone";
import {
  listingSchema,
  parsePriceToMinor,
  type ListingInput,
} from "@/lib/validations/listing";
import {
  COUNTED_STATES,
  hasFreeSlot,
  isContentChanged,
} from "@/lib/listings";
import { ListingState, Role } from "@/generated/prisma/enums";

export type ListingFormState = { error?: string };

const LIMIT_MSG =
  "Aktiv elan limitinə çatmısınız (5). Yeni elan üçün birini deaktiv edin və ya mağaza olun.";

type ParseResult =
  | { ok: true; data: ListingInput }
  | { ok: false; error: string };

function parseListingForm(formData: FormData): ParseResult {
  const phone = normalizePhone(String(formData.get("contactPhone") ?? ""));
  if (!phone) return { ok: false, error: "Düzgün telefon nömrəsi daxil edin" };

  const priceMinor = parsePriceToMinor(String(formData.get("price") ?? ""));
  if (priceMinor === null) return { ok: false, error: "Qiymət düzgün deyil" };

  const brandRaw = String(formData.get("brand") ?? "").trim();
  const candidate = {
    title: String(formData.get("title") ?? ""),
    description: String(formData.get("description") ?? ""),
    department: String(formData.get("department") ?? ""),
    category: String(formData.get("category") ?? ""),
    condition: String(formData.get("condition") ?? ""),
    brand: brandRaw || undefined,
    size: String(formData.get("size") ?? ""),
    priceMinor,
    negotiable: formData.get("negotiable") != null,
    city: String(formData.get("city") ?? ""),
    contactPhone: phone,
    images: formData.getAll("images").map(String).filter(Boolean),
  };

  const result = listingSchema.safeParse(candidate);
  if (!result.success) {
    return { ok: false, error: result.error.issues[0]?.message ?? "Yanlış məlumat" };
  }
  return { ok: true, data: result.data };
}

export async function createListing(
  _prev: ListingFormState,
  formData: FormData,
): Promise<ListingFormState> {
  const user = await requireUser();
  const parsed = parseListingForm(formData);
  if (!parsed.ok) return { error: parsed.error };

  if (!(await hasFreeSlot(user))) return { error: LIMIT_MSG };

  const { images, ...fields } = parsed.data;
  // Admins are the reviewers — their own listings publish immediately.
  const isAdmin = user.role === Role.ADMIN;
  await prisma.listing.create({
    data: {
      ownerId: user.id,
      ...fields,
      state: isAdmin ? ListingState.ACTIVE : ListingState.PENDING,
      approvedAt: isAdmin ? new Date() : null,
      images: {
        create: images.map((url, i) => ({ url, position: i })),
      },
    },
  });

  revalidatePath("/account/listings");
  redirect("/account/listings?created=1");
}

export async function updateListing(
  id: string,
  _prev: ListingFormState,
  formData: FormData,
): Promise<ListingFormState> {
  const user = await requireUser();
  const listing = await prisma.listing.findUnique({
    where: { id },
    include: { images: { orderBy: { position: "asc" } } },
  });
  if (!listing || listing.ownerId !== user.id) {
    return { error: "Elan tapılmadı" };
  }

  const parsed = parseListingForm(formData);
  if (!parsed.ok) return { error: parsed.error };
  const data = parsed.data;

  // Price-only edits stay live; any content/image change forces re-review —
  // except for admins, whose own edits publish immediately (they review).
  const isAdmin = user.role === Role.ADMIN;
  const contentChanged = isContentChanged(listing, data);
  const reviewState = isAdmin ? ListingState.ACTIVE : ListingState.PENDING;
  const newState = contentChanged ? reviewState : listing.state;

  const wasCounted = COUNTED_STATES.includes(listing.state);
  const willCount = COUNTED_STATES.includes(newState);
  if (willCount && !wasCounted && !(await hasFreeSlot(user, id))) {
    return { error: LIMIT_MSG };
  }

  const { images, ...fields } = data;
  await prisma.$transaction(async (tx) => {
    await tx.listing.update({
      where: { id },
      data: {
        ...fields,
        brand: fields.brand ?? null, // allow clearing
        state: newState,
        ...(contentChanged
          ? { rejectionReason: null, ...(isAdmin ? { approvedAt: new Date() } : {}) }
          : {}),
      },
    });
    if (contentChanged) {
      await tx.listingImage.deleteMany({ where: { listingId: id } });
      await tx.listingImage.createMany({
        data: images.map((url, i) => ({ listingId: id, url, position: i })),
      });
    }
  });

  revalidatePath("/account/listings");
  revalidatePath(`/listings/${id}`);
  redirect("/account/listings?updated=1");
}

// --- State transitions -----------------------------------------------------

async function loadOwned(id: string) {
  const user = await requireUser();
  const listing = await prisma.listing.findUnique({ where: { id } });
  if (!listing || listing.ownerId !== user.id) redirect("/account/listings");
  return { user, listing };
}

function revalidateListing(id: string) {
  revalidatePath("/account/listings");
  revalidatePath(`/listings/${id}`);
}

/** Make an approved listing public again (from INACTIVE or SOLD). */
export async function activateListing(id: string) {
  const { user, listing } = await loadOwned(id);
  if (
    listing.state !== ListingState.INACTIVE &&
    listing.state !== ListingState.SOLD
  ) {
    return;
  }
  if (!listing.approvedAt) return; // never approved — must go through review
  if (!(await hasFreeSlot(user, id))) {
    redirect("/account/listings?limit=1");
  }
  await prisma.listing.update({
    where: { id },
    data: { state: ListingState.ACTIVE },
  });
  revalidateListing(id);
}

export async function deactivateListing(id: string) {
  const { listing } = await loadOwned(id);
  if (listing.state !== ListingState.ACTIVE) return;
  await prisma.listing.update({
    where: { id },
    data: { state: ListingState.INACTIVE },
  });
  revalidateListing(id);
}

export async function markListingSold(id: string) {
  const { listing } = await loadOwned(id);
  if (
    listing.state !== ListingState.ACTIVE &&
    listing.state !== ListingState.INACTIVE
  ) {
    return;
  }
  await prisma.listing.update({
    where: { id },
    data: { state: ListingState.SOLD },
  });
  revalidateListing(id);
}

export async function deleteListing(id: string) {
  const { listing } = await loadOwned(id);
  await prisma.listing.delete({ where: { id: listing.id } });
  revalidatePath("/account/listings");
}
