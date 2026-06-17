"use client";

import { useState } from "react";
import { Check, X } from "lucide-react";
import { Textarea } from "@/components/ui/input";
import { SubmitButton } from "@/components/ui/submit-button";
import { approveListing, rejectListing } from "@/app/admin/actions";

/**
 * Admin approve / reject controls for a single listing. Approving publishes it;
 * rejecting reveals a required reason field. Used in the queue and the review
 * detail page. Set `allowApprove={false}` for a reject-only takedown of an
 * already-active listing.
 */
export function ReviewActions({
  listingId,
  allowApprove = true,
}: {
  listingId: string;
  allowApprove?: boolean;
}) {
  const [rejecting, setRejecting] = useState(false);

  if (rejecting) {
    return (
      <form
        action={rejectListing.bind(null, listingId)}
        className="w-full space-y-2"
      >
        <Textarea
          name="reason"
          required
          maxLength={500}
          autoFocus
          placeholder="Rədd səbəbi (istifadəçiyə göstəriləcək)"
          className="min-h-20"
        />
        <div className="flex gap-2">
          <SubmitButton variant="danger" size="sm">
            Rədd et
          </SubmitButton>
          <button
            type="button"
            onClick={() => setRejecting(false)}
            className="rounded-full px-3 py-1.5 text-sm font-medium text-zinc-600 hover:bg-zinc-100"
          >
            Ləğv et
          </button>
        </div>
      </form>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      {allowApprove && (
        <form action={approveListing.bind(null, listingId)}>
          <SubmitButton size="sm">
            <Check className="size-4" />
            Təsdiq et
          </SubmitButton>
        </form>
      )}
      <button
        type="button"
        onClick={() => setRejecting(true)}
        className="inline-flex h-8 items-center gap-2 rounded-full border border-red-200 px-3 text-sm font-medium text-red-600 transition hover:bg-red-50"
      >
        <X className="size-4" />
        {allowApprove ? "Rədd et" : "Elanı sil"}
      </button>
    </div>
  );
}
