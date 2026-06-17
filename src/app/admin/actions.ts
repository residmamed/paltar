"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth-helpers";
import { ListingState } from "@/generated/prisma/enums";

/** Refresh every surface that shows a listing's review state. */
function revalidateReview(id: string) {
  revalidatePath("/admin");
  revalidatePath("/admin/listings");
  revalidatePath(`/admin/listings/${id}`);
  revalidatePath("/account/listings");
  revalidatePath(`/listings/${id}`);
}

/** Approve a pending listing: it becomes Active and goes public. */
export async function approveListing(id: string) {
  await requireAdmin();

  const listing = await prisma.listing.findUnique({ where: { id } });
  if (!listing || listing.state !== ListingState.PENDING) return;

  await prisma.listing.update({
    where: { id },
    data: {
      state: ListingState.ACTIVE,
      approvedAt: new Date(),
      rejectionReason: null,
    },
  });

  revalidateReview(id);
}

/**
 * Reject a listing with a reason. Allowed from Pending (initial review) or
 * Active (a takedown of an already-public listing). The owner can edit and
 * resubmit, which returns it to Pending.
 */
export async function rejectListing(id: string, formData: FormData) {
  await requireAdmin();

  const reason = String(formData.get("reason") ?? "").trim();
  if (!reason) return;

  const listing = await prisma.listing.findUnique({ where: { id } });
  if (
    !listing ||
    (listing.state !== ListingState.PENDING &&
      listing.state !== ListingState.ACTIVE)
  ) {
    return;
  }

  await prisma.listing.update({
    where: { id },
    data: {
      state: ListingState.REJECTED,
      rejectionReason: reason.slice(0, 500),
    },
  });

  revalidateReview(id);
}
